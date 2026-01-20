import os
import shutil
import uuid
from typing import List, Dict

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# LangChain Imports
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from operator import itemgetter

app = FastAPI()

# Add CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION ---
DB_FOLDER = "./chroma_db_server"
EMBEDDING_MODEL = "mxbai-embed-large"
CHAT_MODEL = "llama3.2"

# Global "Memory" for chat sessions (In production, use Redis or Postgres)
# Structure: { "session_id": "Human: hi\nAI: hello\n..." }
chat_histories: Dict[str, str] = {}

# Initialize Embeddings once (efficient)
embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)

# --- DATA MODELS ---
class OrgCreate(BaseModel):
    name: str

class ChatRequest(BaseModel):
    organization_id: str
    session_id: str
    question: str

# --- ENDPOINT 1: REGISTER ORGANIZATION ---
@app.post("/organizations")
async def create_organization(org: OrgCreate):
    """
    Creates a unique ID for a new organization.
    In a real app, you would save this 'org_id' to your SQL database.
    """
    # Generate a clean, simple ID (e.g., "tesla_1234")
    clean_name = org.name.lower().replace(" ", "_")
    org_id = f"{clean_name}_{uuid.uuid4().hex[:8]}"
    
    return {
        "message": "Organization created", 
        "organization_id": org_id,
        "note": "Save this ID! You need it to upload docs and chat."
    }

# --- ENDPOINT 2: UPLOAD & PROCESS DOCUMENT ---
@app.post("/upload")
async def upload_document(organization_id: str, file: UploadFile = File(...)):
    """
    1. Saves the PDF temporarily.
    2. Splits and Embeds it.
    3. Stores it in a ChromaDB collection SPECIFIC to this Org ID.
    """
    temp_filename = f"temp_{file.filename}"
    
    # 1. Save file to disk temporarily
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 2. Load & Split
        loader = PyPDFLoader(temp_filename)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)

        # 3. Store in specific Collection (This isolates data!)
        # We use the 'organization_id' as the collection name
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=embeddings,
            persist_directory=DB_FOLDER,
            collection_name=organization_id  # <--- MAGIC SAUCE: Separate data per org
        )
        
    finally:
        # Cleanup: Delete the temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

    return {"message": "Document processed successfully", "chunks_added": len(splits)}
# --- ENDPOINT 3: CHAT ---
@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Chat with a specific organization's knowledge base.
    """
    # 1. Load the specific collection for this Org
    vectorstore = Chroma(
        persist_directory=DB_FOLDER, 
        embedding_function=embeddings,
        collection_name=request.organization_id
    )
    retriever = vectorstore.as_retriever()

    # 2. Retrieve History (Fix: Ensure it exists in the dictionary)
    if request.session_id not in chat_histories:
        chat_histories[request.session_id] = ""
    
    history = chat_histories[request.session_id]

    # 3. Build Chain
    llm = ChatOllama(model=CHAT_MODEL)
    
    template = """You are a helpful assistant for this organization.
    
    History:
    {chat_history}

    Context from documents:
    {context}
    
    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)

    rag_chain = (
        {
            "context": itemgetter("question") | retriever,
            "question": itemgetter("question"),
            "chat_history": itemgetter("chat_history"),
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    # 4. Run AI
    print(f"Thinking for Session {request.session_id}...")
    try:
        response = rag_chain.invoke({
            "question": request.question,
            "chat_history": history
        })
    except Exception as e:
        print(f"ERROR during AI generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # 5. Update History (Fix: Now safe because we initialized it in Step 2)
    chat_histories[request.session_id] += f"\nHuman: {request.question}\nAI: {response}\n"

    return {"answer": response}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)