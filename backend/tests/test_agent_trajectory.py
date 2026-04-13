import os
import sys
import json
import pytest

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import ConversationSnapshot, Contact
from utils.ai_engine import ai_engine

def load_dataset():
    filepath = os.path.join(os.path.dirname(__file__), "eval_dataset.json")
    with open(filepath, "r") as f:
        data = json.load(f)
    return data["adversarial_cases"]

@pytest.mark.parametrize("case", load_dataset(), ids=lambda c: c["name"])
def test_agentic_reasoning_trajectory(case, client, test_data, db_session):
    admin_a = test_data["admin_a"]
    
    # Create an evaluation contact specifically for this test
    test_contact = Contact(
        client_id=admin_a.client_id,
        owner_id=admin_a.id,
        first_name="Eval Lead",
        email=f"eval_{case['name'].replace(' ', '_').lower()}@example.com",
        phone="+19999999998"
    )
    db_session.add(test_contact)
    db_session.commit()
    db_session.refresh(test_contact)
    
    user_id = admin_a.id
    contact_id = test_contact.id
    
    message = case["message"]
    expected_nodes = case["expected_nodes"]
    
    print(f"\n--- Output for {case['name']} ---")
    response, reasoning_path = ai_engine.chat_to_book(
        user_id=user_id,
        contact_id=contact_id,
        user_message=message,
        db=db_session
    )
    
    print(f"User: {message}")
    print(f"Agent Response: {response}")
    print(f"Actual Trajectory: {reasoning_path}")
    print(f"Expected Minimum Sub-Path: {expected_nodes}")
    
    # Assert that all expected nodes executed
    for expected_node in expected_nodes:
        assert expected_node in reasoning_path, f"Expected node '{expected_node}' not found against {case['name']} trajectory {reasoning_path}"
