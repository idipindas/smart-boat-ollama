import requests
import sys

# --- CONFIGURATION ---
BASE_URL = "http://localhost:8000"
PDF_FILE = "sample_policy_and_procedures_manual.pdf"  # Make sure this file exists!

def main():
    print("🚀 Starting Client Test...\n")

    # 1. Register a new Organization
    print("1️⃣  Registering new Organization...")
    org_response = requests.post(f"{BASE_URL}/organizations", json={"name": "Tech Corp"})
    
    if org_response.status_code != 200:
        print(f"❌ Failed to create org: {org_response.text}")
        return

    org_data = org_response.json()
    org_id = org_data["organization_id"]
    print(f"✅ Organization Created! ID: {org_id}\n")

    # 2. Upload the Document
    print(f"2️⃣  Uploading '{PDF_FILE}' for {org_id}...")
    try:
        with open(PDF_FILE, "rb") as f:
            files = {"file": f}
            # Note: We send organization_id as a query parameter
            upload_response = requests.post(
                f"{BASE_URL}/upload", 
                params={"organization_id": org_id}, 
                files=files
            )
            
        if upload_response.status_code == 200:
            print(f"✅ Upload Success: {upload_response.json()}\n")
        else:
            print(f"❌ Upload Failed: {upload_response.text}")
            return
    except FileNotFoundError:
        print(f"❌ Error: Could not find '{PDF_FILE}'. Please put a PDF in this folder.")
        return

    # 3. Chat Loop
    print("3️⃣  Starting Chat Session (Type 'exit' to quit)...")
    session_id = "user_session_1"
    
    while True:
        question = input("\n❓ You: ")
        if question.lower() in ["exit", "quit"]:
            break
            
        payload = {
            "organization_id": org_id,
            "session_id": session_id,
            "question": question
        }
        
        try:
            chat_response = requests.post(f"{BASE_URL}/chat", json=payload)
            if chat_response.status_code == 200:
                answer = chat_response.json()["answer"]
                print(f"🤖 AI: {answer}")
            else:
                print(f"❌ Error: {chat_response.text}")
        except requests.exceptions.ConnectionError:
            print("❌ Error: Could not connect to server. Is 'server.py' running?")
            break

if __name__ == "__main__":
    main()