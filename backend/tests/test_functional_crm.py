import pytest
from models import Contact

def test_dynamic_segmentation_logic(client, test_data, admin_token, db_session):
    client_a = test_data["client_a"]
    
    # 1. Seed 5 leads with various scores
    scores = [10, 30, 50, 70, 90]
    for i, s in enumerate(scores):
        c = Contact(
            client_id=client_a.id,
            first_name=f"Lead {s}",
            email=f"s{s}@test.com",
            lead_score=s
        )
        db_session.add(c)
    db_session.commit()
    
    # 2. Test POST /api/leads/segment with >= 50
    payload = {
        "filters": [
            {"field": "lead_score", "op": ">=", "value": 50}
        ]
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post("/api/leads/segment", json=payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    # Assert result set [50, 70, 90]
    assert len(data) == 3
    for lead in data:
        assert lead["lead_score"] >= 50

def test_kanban_status_transition_via_webhook(client, test_data, db_session):
    client_a = test_data["client_a"]
    
    # Create new lead
    l = Contact(client_id=client_a.id, first_name="Status Lead", phone="+15551110000", status="new")
    db_session.add(l)
    db_session.commit()
    
    # Verify initial
    assert l.status == "new"
    
    # Simulate incoming message (Engagement)
    payload = {
        "client_id": client_a.id,
        "phone": "+15551110000",
        "message_body": "I want to talk!"
    }
    
    # Global mock was added to conftest.py in previous lockdowns for send_email_outbound
    response = client.post("/api/webhooks/incoming_msg", json=payload)
    assert response.status_code == 200
    
    db_session.refresh(l)
    assert l.status == "replied"

def test_segmentation_operator_ilike(client, test_data, admin_token, db_session):
    client_a = test_data["client_a"]
    l1 = Contact(client_id=client_a.id, first_name="Apple Inc", email="a@test.com")
    l2 = Contact(client_id=client_a.id, first_name="Banana Corp", email="b@test.com")
    db_session.add_all([l1, l2])
    db_session.commit()
    
    payload = {
        "filters": [
            {"field": "first_name", "op": "ilike", "value": "%apple%"}
        ]
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post("/api/leads/segment", json=payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["first_name"] == "Apple Inc"
