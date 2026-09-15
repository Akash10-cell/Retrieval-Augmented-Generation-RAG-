from google import genai
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import pymupdf # type: ignore
import numpy as np
import os
from dotenv import load_dotenv
import re
import docx
from PIL import Image
import io

load_dotenv()

app = FastAPI()

client = genai.Client(
    api_key=os.getenv("gemini-api-key")
)

def chunk_text(text: str, chunk_size: int = 6, overlap: int = 2) -> list[str]:
    """Splits text into chunks of `chunk_size` sentences with `overlap` sentences overlap."""
    # Split by punctuation (period, question mark, exclamation point) followed by whitespace
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    if not sentences:
        return []

    chunks = []
    start = 0
    while start < len(sentences):
        end = start + chunk_size
        chunk = " ".join(sentences[start:end])
        chunks.append(chunk)
        # Advance by chunk_size minus overlap
        step = max(1, chunk_size - overlap)
        start += step
        
    return chunks

def get_embedding(text: str) -> np.ndarray:
    """Helper to get a single embedding."""
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text
    )
    return np.array(response.embeddings[0].values)

@app.post("/rag_3")
async def rag_3(file: UploadFile = File(...), question: str = Form(...)):
    
    # 1. Ingest documents
    file_bytes = await file.read()
    filename = file.filename.lower()
    full_text = ""

    try:
        if filename.endswith(".pdf"):
            doc = pymupdf.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                full_text += page.get_text()
            doc.close()
        elif filename.endswith(".txt"):
            # Ensure text is decoded properly
            full_text = file_bytes.decode("utf-8", errors="replace")
        elif filename.endswith(".docx"):
            # Load docx from bytes
            doc = docx.Document(io.BytesIO(file_bytes))
            full_text = "\n".join([para.text for para in doc.paragraphs])
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            # Extract text using Gemini Vision
            image = Image.open(io.BytesIO(file_bytes))
            ocr_response = client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=["Extract all the text from this document or image accurately. Return only the extracted text. If no text exists, return empty.", image]
            )
            full_text = ocr_response.text
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, TXT, or Image (.png/.jpg).")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

    if not full_text.strip():
        raise HTTPException(status_code=400, detail="No readable text found in the uploaded file.")
    
    # 2. Chunk text
    chunks = chunk_text(full_text, chunk_size=6, overlap=2)

    # 3. Create embeddings for chunks
    try:
        # Try batch embedding
        response = client.models.embed_content(
            model="gemini-embedding-2",
            contents=chunks
        )
        chunk_embeddings = [np.array(e.values) for e in response.embeddings]
    except Exception as e:
        # Fallback to sequential embedding if batch fails
        chunk_embeddings = []
        for c in chunks:
            chunk_embeddings.append(get_embedding(c))

    # 4. Store vectors (in-memory matrix for this request)
    vector_store = np.array(chunk_embeddings)

    # 5. Retrieve top relevant chunks
    question_embedding = get_embedding(question)
    
    # Calculate cosine similarity using NumPy
    norms = np.linalg.norm(vector_store, axis=1) * np.linalg.norm(question_embedding)
    
    # Avoid division by zero
    norms = np.where(norms == 0, 1e-10, norms)
    similarities = np.dot(vector_store, question_embedding) / norms
    
    # Get top 3 chunks
    top_k = min(3, len(chunks))
    top_indices = np.argsort(similarities)[-top_k:][::-1]
    
    retrieved_chunks = [chunks[i] for i in top_indices]
    context = "\n\n---\n\n".join(retrieved_chunks)

    # 6. Generate answer
    prompt = f"""
You are a helpful AI assistant.
Answer the question based ONLY on the provided document context.
If the answer is not present in the context, respond with "I don't know".

Context:
{context}

Question: {question}
"""
    
    generate_response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )
    
    # 7. Show citations
    citations = []
    for rank, idx in enumerate(top_indices):
        citations.append({
            "chunk_id": int(idx),
            "similarity_score": round(float(similarities[idx]), 4),
            "text_snippet": chunks[idx].strip()
        })

    return {
        "status": True,
        "question": question,
        "answer": generate_response.text,
        "citations": citations
    }


# Persistent document storage API. The existing RAG endpoint above remains unchanged.
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from uuid import uuid4
import json
from fastapi import Query
from fastapi.responses import FileResponse

DOCUMENT_STORAGE_DIR = Path(__file__).resolve().parent / "document_storage"
DOCUMENT_METADATA_FILE = DOCUMENT_STORAGE_DIR / "metadata.json"
DOCUMENT_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
document_storage_lock = Lock()
stored_document_extensions = {".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg"}


def read_document_metadata():
    if not DOCUMENT_METADATA_FILE.exists():
        return []

    try:
        return json.loads(DOCUMENT_METADATA_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []


def write_document_metadata(documents):
    temporary_file = DOCUMENT_METADATA_FILE.with_suffix(".tmp")
    temporary_file.write_text(json.dumps(documents, indent=2), encoding="utf-8")
    temporary_file.replace(DOCUMENT_METADATA_FILE)


def get_document_for_user(document_id, owner_email):
    return next(
        (
            document
            for document in read_document_metadata()
            if document["id"] == document_id
            and document["owner_email"] == owner_email.lower()
        ),
        None,
    )


@app.post("/documents")
async def store_document(
    file: UploadFile = File(...),
    owner_email: str = Form(...),
):
    original_name = Path(file.filename or "document").name
    extension = Path(original_name).suffix.lower()
    if extension not in stored_document_extensions:
        raise HTTPException(status_code=400, detail="Unsupported document format.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded document is empty.")
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Documents must be 20 MB or smaller.")

    document_id = str(uuid4())
    stored_file = DOCUMENT_STORAGE_DIR / f"{document_id}{extension}"
    document = {
        "id": document_id,
        "owner_email": owner_email.lower().strip(),
        "name": original_name,
        "content_type": file.content_type or "application/octet-stream",
        "size": len(file_bytes),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    with document_storage_lock:
        stored_file.write_bytes(file_bytes)
        documents = read_document_metadata()
        documents.insert(0, document)
        write_document_metadata(documents)

    return document


@app.get("/documents")
def list_documents(owner_email: str = Query(...)):
    owner_email = owner_email.lower().strip()
    return [
        document
        for document in read_document_metadata()
        if document["owner_email"] == owner_email
    ]


@app.get("/documents/{document_id}/download")
def download_document(document_id: str, owner_email: str = Query(...)):
    document = get_document_for_user(document_id, owner_email.strip())
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    extension = Path(document["name"]).suffix.lower()
    stored_file = DOCUMENT_STORAGE_DIR / f"{document_id}{extension}"
    if not stored_file.exists():
        raise HTTPException(status_code=404, detail="Stored document file not found.")

    return FileResponse(
        stored_file,
        media_type=document["content_type"],
        filename=document["name"],
    )


@app.delete("/documents/{document_id}")
def delete_document(document_id: str, owner_email: str = Query(...)):
    with document_storage_lock:
        document = get_document_for_user(document_id, owner_email.strip())
        if not document:
            raise HTTPException(status_code=404, detail="Document not found.")

        extension = Path(document["name"]).suffix.lower()
        stored_file = DOCUMENT_STORAGE_DIR / f"{document_id}{extension}"
        stored_file.unlink(missing_ok=True)
        documents = [item for item in read_document_metadata() if item["id"] != document_id]
        write_document_metadata(documents)

    return {"status": True, "id": document_id}