import os
from operator import itemgetter # <--- NEW IMPORT
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# --- CONFIGURATION ---
PDF_FILE = "sample.pdf"
DB_FOLDER = "./chroma_db"
EMBEDDING_MODEL = "mxbai-embed-large"
CHAT_MODEL = "llama3.2"

def main():
    # 1. Setup Embeddings
    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)
    
    # 2. Check or Create Database
    if os.path.exists(DB_FOLDER) and os.listdir(DB_FOLDER):
        print("💾 Database found! Loading existing data...")
        vectorstore = Chroma(persist_directory=DB_FOLDER, embedding_function=embeddings)
    else:
        print("📂 Database not found. Creating new one...")
        if not os.path.exists(PDF_FILE):
            print(f"❌ Error: File '{PDF_FILE}' not found.")
            return

        loader = PyPDFLoader(PDF_FILE)
        docs = loader.load()
        
        print("✂️  Splitting text...")
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)

        print("🧠 Creating embeddings...")
        vectorstore = Chroma.from_documents(
            documents=splits, 
            embedding=embeddings, 
            persist_directory=DB_FOLDER
        )
        print("✅ Database saved!")

    # 3. Setup Retriever
    retriever = vectorstore.as_retriever()
    
    # 4. Setup Chat Model
    llm = ChatOllama(model=CHAT_MODEL)

    # 5. Define the Prompt (Now with History!)
    template = """You are a helpful assistant.
    
    Here is the conversation history so far:
    {chat_history}

    Answer the question based ONLY on the following context:
    {context}
    
    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)

    # 6. Build the Chain
    # We use 'itemgetter' to grab specific keys from the input dictionary
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

    # 7. Loop for Chat
    # This variable holds the memory. It resets every time you restart the script.
    session_history = "" 

    while True:
        my_question = input("\n❓ Ask a question (or type 'exit'): ")
        if my_question.lower() == 'exit':
            break
        
        print("Thinking...")
        
        # We now pass a DICTIONARY containing both the question and the history
        response = rag_chain.invoke({
            "question": my_question,
            "chat_history": session_history
        })
        
        print(f"🤖 Answer: {response}")

        # Update the history for the next turn
        session_history += f"\nHuman: {my_question}\nAI: {response}\n"

if __name__ == "__main__":
    main()