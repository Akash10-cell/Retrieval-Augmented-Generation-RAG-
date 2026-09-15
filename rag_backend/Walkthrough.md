# Project: Multi-Format RAG Pipeline

## Overview
This project implements a complete **Retrieval-Augmented Generation (RAG)** pipeline using **FastAPI** and the **Google Gemini API**. It supports multi-format document ingestion, semantic vector retrieval, and grounded answer synthesis with direct source citations.

---

## Key Features

### 1. Multi-Format Document Ingestion
The `/rag_3` endpoint dynamically processes multiple file types based on extension:
- **PDF Documents (`.pdf`)**: Extracted using `PyMuPDF` (`fitz`).
- **Word Documents (`.docx`)**: Paragraphs extracted using `python-docx`.
- **Text Files (`.txt`, `.md`)**: Decoded as raw text using UTF-8 (with automatic fallback).
- **Images (`.png`, `.jpg`, `.jpeg`, `.webp`)**: Uses Gemini 3.5 Flash-Lite multimodal vision for intelligent OCR and structured text extraction—no external OS dependencies (like Tesseract) required.

### 2. Sentence-Based Chunking with Overlap
- Text is split based on sentence boundaries (`.`, `!`, `?`).
- Sentences are grouped into chunks of **6 sentences** each.
- A **2-sentence overlap** between consecutive chunks preserves semantic context across boundaries.

### 3. Vector Embeddings
- Integrated with Google Gemini's `gemini-embedding-2` model to convert all document chunks into high-dimensional vector embeddings.

### 4. In-Memory Vector Store & Cosine Similarity
- Built-in NumPy vector store computes cosine similarity between the user's query embedding and all chunk embeddings.
- Retrieves the **Top 3** most semantically relevant chunks.

### 5. Grounded Generation & Untruncated Citations
- Leverages `gemini-3.5-flash-lite` to generate answers strictly based on the retrieved context.
- Returns the generated answer along with the exact **untruncated source text snippets** as citations for complete traceability.

### 6. Secure Configuration
- Uses `python-dotenv` to securely load the API key from `.env` (`gemini-api-key`).

---

## Installation & Setup

### 1. Install Dependencies
```bash
pip install fastapi uvicorn google-genai pymupdf python-docx python-dotenv numpy pillow
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
gemini-api-key=YOUR_GEMINI_API_KEY
```

### 3. Start the Server
```bash
uvicorn RAG:app --reload
```

---

## API Usage

### Interactive API Docs
Visit Swagger UI in your browser:
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Endpoint: `POST /rag_3`
- **Parameters**:
  - `file`: Upload file (`.pdf`, `.docx`, `.txt`, `.png`, `.jpg`, `.jpeg`, `.webp`)
  - `question`: User query string
- **Sample Response**:
```json
{
  "answer": "According to the document...",
  "citations": [
    "Exact source chunk 1...",
    "Exact source chunk 2...",
    "Exact source chunk 3..."
  ]
}
```
