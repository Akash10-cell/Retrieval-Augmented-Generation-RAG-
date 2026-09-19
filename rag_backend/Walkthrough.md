# Project: Multi-Format RAG Pipeline & Document Management API

## Overview
This project implements a complete **Retrieval-Augmented Generation (RAG)** pipeline and **Persistent Document Management System** using **FastAPI** and the **Google Gemini API**. It supports multi-format document ingestion, semantic vector retrieval, grounded answer synthesis with direct source citations, and persistent per-user document storage.

---

## Key Features

### 1. Multi-Format Document Ingestion & Multi-File RAG (`POST /rag_3`)
Processes single or multiple files across multiple file types dynamically in a single query:
- **Simultaneous Multi-File Support**: Upload multiple documents at once under repeated `file` keys (standard in Postman/curl), `files` lists, or single uploads.
- **PDF Documents (`.pdf`)**: Text extracted using `PyMuPDF` (`fitz`).
- **Word Documents (`.docx`)**: Paragraphs extracted using `python-docx`.
- **Text Files (`.txt`)**: Decoded as UTF-8 with automatic fallback handling.
- **Images (`.png`, `.jpg`, `.jpeg`)**: Processed using Gemini 3.5 Flash-Lite multimodal vision for intelligent OCR text extraction—no external OS binaries (like Tesseract) required.

### 2. Sentence-Based Chunking with Overlap
- Splits text cleanly using sentence boundary punctuation (`.`, `!`, `?`).
- Groups sentences into chunks of **6 sentences** each.
- Features a **2-sentence sliding overlap** between chunks to maintain semantic context across boundaries.
- Tags each chunk with its source document name (e.g. `[filename.pdf]`) for clear multi-document tracing.

### 3. High-Dimensional Vector Embeddings
- Integrated with Google Gemini's `gemini-embedding-2` model to generate high-dimensional (3072-dim) vector representations for all chunks.
- Computes individual chunk vectors to guarantee precise 1-to-1 vector similarity mapping.

### 4. Balanced Multi-Source Vector Retrieval
- Custom NumPy-powered vector store computes cosine similarity between the query embedding and chunk vectors.
- **Fair Multi-Document Representation**: When querying across multiple documents, the retrieval engine guarantees representation by pulling the top relevant chunks from **each** uploaded document, plus the overall top-scoring chunks up to a dynamic `top_k`.
- Prevents chunks from a large or single dominant document from crowding out smaller documents or image OCR snippets.

### 5. Grounded Generation & Untruncated Citations
- Leverages `gemini-3.5-flash-lite` to generate answers strictly based on the retrieved context chunks.
- Multi-part questions spanning different files are accurately divided and answered per document context.
- Responds with explicit notice if any specific part is not supported by the document context.
- Returns top-matched citations with chunk IDs, source filenames, similarity scores, and complete untruncated source text.

### 6. Persistent Document Storage & Library Management
In addition to the RAG endpoint, the backend provides full document lifecycle management:
- **`POST /documents`**: Uploads and saves documents to `document_storage/` with unique UUIDs, thread-safe file writing, and max size validation (up to 20 MB).
- **`GET /documents`**: Fetches all documents owned by a specific user (`owner_email`).
- **`GET /documents/{document_id}/download`**: Securely serves and downloads stored documents with original filename and MIME type.
- **`DELETE /documents/{document_id}`**: Atomically removes the document file and its entry from `metadata.json`.
- **Concurrency & Safety**: Protected using Python's `threading.Lock` and atomic temporary-file replacement for metadata writes.

### 7. In-Place Stored Document Querying (`POST /documents/{document_id}/ask`)
- Executes the full RAG pipeline on any previously stored document directly using its `document_id`.
- Eliminates the need to re-upload documents for subsequent questions.
- Automatically reads the document from disk, extracts text, generates embeddings, retrieves relevant chunks, and synthesizes answers.

### 8. Conversation History & Chat Persistence (`GET /conversations`, `POST /conversations`)
- Stores complete user chat interactions including questions, answers, and citations.
- Uses thread-safe atomic local storage in `document_storage/conversations.json`.
- Operates independently of external databases, ensuring instant response times and zero network timeout risks.

### 9. User Authentication (`POST /register`, `POST /login`)
- Secure registration and authentication system with `bcrypt` password hashing.
- Issues unique user session tokens for verified authentication.

### 10. Secure Configuration
- Uses `python-dotenv` to load credentials securely from `rag_backend/.env` (`gemini-api-key`, `my_mongo_uri`).

---

## Installation & Setup

### 1. Install Dependencies
```bash
pip install fastapi uvicorn google-genai pymupdf python-docx python-dotenv numpy pillow
```

### 2. Configure Environment Variables
Ensure a `.env` file exists in the `rag_backend/` folder:
```env
gemini-api-key=YOUR_GEMINI_API_KEY
```

### 3. Start the Server
Navigate to `rag_backend` and start Uvicorn:
```bash
cd rag_backend
uvicorn RAG:app --reload
```

---

## API Reference

### Interactive API Docs (Swagger UI)
Interactive docs are available at:
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 1. RAG Inference: `POST /rag_3`
Runs document ingestion, OCR, balanced vector retrieval, and question answering across one or **multiple files simultaneously**.

- **Request Type**: `multipart/form-data`
- **Parameters**:
  - `file` (File / Repeated Files): Upload one or multiple files by repeating the `file` key (standard in Postman, curl, HTML forms).
  - `files` (Files, optional): Multiple files uploaded as a list.
  - `question` (Text): Query or multi-part questions across the uploaded documents.
  - *Supported formats*: `.pdf`, `.docx`, `.txt`, `.png`, `.jpg`, `.jpeg`.

- **Postman Usage Example**:
  In Postman `form-data`, you can add multiple rows with Key `file` (Type: `File`) pointing to different documents and images:
  - `file`: `Python_RAG_Test_Document.pdf`
  - `file`: `WhatsApp Image.jpeg`
  - `file`: `IIT Patna AIML Project Guidelines.pdf`
  - `question`: `who created python and what is OCR and can you summarize the IIT Patna AIML project ?`

- **Sample Response**:
```json
{
  "status": true,
  "question": "who created python and what is OCR and can you summarize the IIT Patna AIML project ?",
  "answer": "Based on the provided documents:\n* Python was created by Guido van Rossum in the late 1980s [Python_RAG_Test_Document.pdf].\n* OCR stands for Optical Character Recognition [WhatsApp Image.jpeg].\n* IIT Patna AIML project 1 is a Multi-LLM Custom ChatGPT...",
  "processed_files": [
    "Python_RAG_Test_Document.pdf",
    "WhatsApp Image.jpeg",
    "IIT Patna AIML Project Guidelines.pdf"
  ],
  "citations": [
    {
      "chunk_id": 0,
      "source_file": "Python_RAG_Test_Document.pdf",
      "similarity_score": 0.7038,
      "text_snippet": "[Python_RAG_Test_Document.pdf] Python was created by Guido van Rossum..."
    },
    {
      "chunk_id": 4,
      "source_file": "WhatsApp Image.jpeg",
      "similarity_score": 0.6522,
      "text_snippet": "[WhatsApp Image.jpeg] OCR stands for Optical Character Recognition..."
    },
    {
      "chunk_id": 8,
      "source_file": "IIT Patna AIML Project Guidelines.pdf",
      "similarity_score": 0.6916,
      "text_snippet": "[IIT Patna AIML Project Guidelines.pdf] Project 1 Multi-LLM Custom ChatGPT..."
    }
  ]
}
```

---

### 2. Store Document: `POST /documents`
Stores a user's document into persistent storage.

- **Request Type**: `multipart/form-data`
- **Parameters**:
  - `file` (File): Document file (Max: 20MB)
  - `owner_email` (Text): Owner's email address

- **Sample Response**:
```json
{
  "id": "e3b0c442-98fc-1c14-9afb-4c8996fb9242",
  "owner_email": "user@example.com",
  "name": "annual_report.pdf",
  "content_type": "application/pdf",
  "size": 1048576,
  "created_at": "2026-09-16T04:20:00.000000+00:00"
}
```

---

### 3. List Documents: `GET /documents`
Returns all stored documents for an owner.

- **Query Parameters**:
  - `owner_email`: `user@example.com`

- **Sample Response**:
```json
[
  {
    "id": "e3b0c442-98fc-1c14-9afb-4c8996fb9242",
    "owner_email": "user@example.com",
    "name": "annual_report.pdf",
    "content_type": "application/pdf",
    "size": 1048576,
    "created_at": "2026-09-16T04:20:00.000000+00:00"
  }
]
```

---

### 4. Download Document: `GET /documents/{document_id}/download`
Streams and downloads the stored document file.

- **Path Parameter**: `document_id`
- **Query Parameter**: `owner_email`

---

### 5. Delete Document: `DELETE /documents/{document_id}`
Deletes the file and metadata for the specified document ID.

- **Path Parameter**: `document_id`
- **Query Parameter**: `owner_email`

- **Sample Response**:
```json
{
  "status": true,
  "id": "e3b0c442-98fc-1c14-9afb-4c8996fb9242"
}
```

---

### 6. Query Stored Document: `POST /documents/{document_id}/ask`
Executes RAG directly on a stored document without requiring re-upload.

- **Path Parameter**: `document_id`
- **Body / Form**:
  - `question`: Query text
  - `owner_email`: Owner's email address

- **Sample Response**:
```json
{
  "status": true,
  "document_id": "e3b0c442-98fc-1c14-9afb-4c8996fb9242",
  "fileName": "annual_report.pdf",
  "question": "What were the total sales?",
  "answer": "Total sales reached $15 million according to section 3.",
  "citations": [
    {
      "chunk_id": 2,
      "similarity_score": 0.8912,
      "text_snippet": "In fiscal year 2025, total sales reached $15 million..."
    }
  ]
}
```

---

### 7. Get Conversations: `GET /conversations`
Retrieves conversation history for a specific user.

- **Query Parameter**: `owner_email`

- **Sample Response**:
```json
[
  {
    "id": "conv-uuid-1234",
    "owner_email": "user@example.com",
    "fileName": "annual_report.pdf",
    "question": "What were the total sales?",
    "answer": "Total sales reached $15 million...",
    "citations": [],
    "created_at": "2026-09-17T16:00:00.000000+00:00"
  }
]
```

---

### 8. Save Conversation: `POST /conversations`
Appends a conversation entry to local persistent storage (`conversations.json`).

- **Body** (`application/json`):
```json
{
  "owner_email": "user@example.com",
  "fileName": "annual_report.pdf",
  "question": "What were the total sales?",
  "answer": "Total sales reached $15 million...",
  "citations": []
}
```

---

### 9. User Registration: `POST /register`
Registers a new user account with hashed password credentials.

- **Body** (`application/json`):
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

---

### 10. User Login: `POST /login`
Authenticates user credentials and verifies password.

- **Body** (`application/json`):
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

