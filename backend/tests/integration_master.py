import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add parent directory to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import SessionLocal
from models import Contact, ConversationSnapshot, User, Client

client = TestClient(app)

def setup_test_environment():
    db = SessionLocal()
    test_client = db.query(Client).filter(Client.name == "Test Client").first()
    if not test_client:
        test_client = Client(name="Test Client")
        db.add(test_client)
        db.commit()
        db.refresh(test_client)
    test_user = db.query(User).filter(User.email == "test@weseegpt.com").first()
    if not test_user:
        test_user = User(
            client_id=test_client.id, 
            email="test@weseegpt.com", 
            hashed_password="fakehash", 
            first_name="Test User",
            role="admin"
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
    u_id = test_user.id
    c_id = test_client.id
    db.close()
    return u_id, c_id
def test_full_lead_lifecycle():
    print("\n[1] Setting up Test Environment...")
    user_id, client_id = setup_test_environment()
    db = SessionLocal()
    import time
    test_email = f"lead_{int(time.time())}@example.com"
    test_phone = f"+1555{int(time.time()) % 10000000:07d}"
    print(f"\n[2] Simulating Meta Webhook Ingestion for {test_email}...")
    webhook_payload = {
        "client_id": client_id,
        "first_name": "Integration",
        "last_name": "TestLead",
        "email": test_email,
        "phone": test_phone,
        "ad_id": "test_ad_123",
        "campaign_name": "Master_Integration_Campaign"
    }
    response = client.post("/api/webhooks/meta", json=webhook_payload)
    assert response.status_code == 200
    assert response.json()["message"] == "Meta lead created"
    # Verify DB Insertion
    contact = db.query(Contact).filter(Contact.email == test_email).first()
    assert contact is not None
    print(f"✅ Lead Created in DB with ID: {contact.id}")
    print("\n[3] Triggering AI Chat - Simple Interaction...")
    chat_payload_1 = {
        "user_id": user_id,
        "contact_id": contact.id,
        "message": "Hi, I saw your ad. What do you do?"
    }
    chat_res_1 = client.post("/api/ai/chat", json=chat_payload_1)
    assert chat_res_1.status_code == 200
    data_1 = chat_res_1.json()
    print("AI Response:", data_1["response"])
    print("Reasoning Steps:", data_1["reasoning_steps"])
    assert "sentiment" in data_1["reasoning_steps"]
    print("\n[4] Triggering AI Chat - Tool Invocation (Calendar Booking)...")
    chat_payload_2 = {
        "user_id": user_id,
        "contact_id": contact.id,
        "message": "Can we schedule a call for tomorrow at 10:00 AM? My email is the one I signed up with."
    }
    chat_res_2 = client.post("/api/ai/chat", json=chat_payload_2)
    assert chat_res_2.status_code == 200
    data_2 = chat_res_2.json()
    print("AI Response:", data_2["response"])
    print("Reasoning Steps:", data_2["reasoning_steps"])
    print("\n[5] Verifying ConversationSnapshot Persistence...")
    snapshot = db.query(ConversationSnapshot).filter(
        ConversationSnapshot.contact_id == contact.id,
        ConversationSnapshot.user_id == user_id
    ).first()
    assert snapshot is not None
    assert snapshot.state_data is not None
    messages_str = snapshot.state_data.get("messages", "")
    assert "schedule a call" in messages_str
    print("✅ ConversationSnapshot Verified.")
    db.close()
    print("\n✅ Master Integration Test Passed: All Layers Operational.")
if __name__ == "__main__":
    test_full_lead_lifecycle()