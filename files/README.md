# Smart Boat Ollama - AI Support Engine

A multi-tenant RAG (Retrieval Augmented Generation) chatbot API built with FastAPI, LangChain, and Ollama. Each organization gets isolated document storage and can chat with their own knowledge base.

## Features

- **Multi-tenant Architecture**: Each organization has isolated document storage
- **PDF Document Processing**: Upload and process PDF documents
- **RAG-based Chat**: Context-aware responses using document retrieval
- **Chat History**: Session-based conversation memory
- **Local LLM**: Powered by Ollama (no external API calls)

## Tech Stack

- **FastAPI** - Web framework
- **LangChain** - LLM orchestration
- **Ollama** - Local LLM inference
- **ChromaDB** - Vector database
- **PyPDF** - PDF processing

## Screenshots

### Organization Setup
Create your organization to get started with your AI-powered support engine.

![Organization Setup](./screenshots/ai-engine.png)

### Upload Documents
Upload PDF documents to build your AI knowledge base (up to 50MB per file).

![Upload Documents - Empty State](./screenshots/ai-1.png)

![Upload Documents - File Selected](./screenshots/ai-2.png)

### AI Chat Interface
Ask questions about your uploaded documents and get intelligent, context-aware responses.

![AI Chat Interface](./screenshots/ai-chat.png)

## Prerequisites

- Python 3.10+
- [Ollama](https://ollama.ai/) installed and running
- Required Ollama models:
  ```bash
  ollama pull llama3.2
  ollama pull mxbai-embed-large
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd smart-boat-ollama
   ```

2. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows
   ```

3. Install dependencies:
   ```bash
   pip install fastapi uvicorn langchain-community langchain-text-splitters langchain-ollama langchain-chroma pypdf python-multipart
   ```

4. Run the server:
   ```bash
   python server.py
   ```

The server will start at `http://localhost:8000`

## API Endpoints

### 1. Create Organization

Creates a new organization and returns a unique ID.

```http
POST /organizations
```

**Request Body:**
```json
{
  "name": "My Company"
}
```

**Response:**
```json
{
  "message": "Organization created",
  "organization_id": "my_company_a1b2c3d4",
  "note": "Save this ID! You need it to upload docs and chat."
}
```

### 2. Upload Document

Upload a PDF document to an organization's knowledge base.

```http
POST /upload?organization_id={org_id}
```

**Request:** Multipart form with PDF file

**Response:**
```json
{
  "message": "Document processed successfully",
  "chunks_added": 42
}
```

### 3. Chat

Chat with an organization's knowledge base.

```http
POST /chat
```

**Request Body:**
```json
{
  "organization_id": "my_company_a1b2c3d4",
  "session_id": "user123",
  "question": "What is the refund policy?"
}
```

**Response:**
```json
{
  "answer": "Based on the documents, the refund policy states..."
}
```

## Configuration

Edit these variables in `server.py` to customize:

```python
DB_FOLDER = "./chroma_db_server"       # Vector DB storage path
EMBEDDING_MODEL = "mxbai-embed-large"  # Ollama embedding model
CHAT_MODEL = "llama3.2"                # Ollama chat model
```

## Project Structure

```
smart-boat-ollama/
├── server.py              # Main FastAPI application
├── chroma_db_server/      # Vector database storage (auto-created)
├── screenshots/           # Application screenshots
│   ├── ai-engine.png
│   ├── ai-1.png
│   ├── ai-2.png
│   └── ai-chat.png
├── venv/                  # Virtual environment
└── README.md
```

## Usage Flow

1. **Create Organization** → Get your unique organization ID
2. **Upload Documents** → Build your knowledge base with PDF files
3. **Start Chatting** → Ask questions and get AI-powered answers

## License

MIT
