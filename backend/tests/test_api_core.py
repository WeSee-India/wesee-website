import pytest
from models import Contact

def test_login_success(client, test_data):
    response = client.post("/api/auth/login", data={
        "username": "admin@tenant-a.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure(client):
    response = client.post("/api/auth/login", data={
        "username": "admin@tenant-a.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_contacts_rbac_admin_v_rep(client, test_data, admin_token, rep_token, db_session):
    # Setup leads
    admin_a = test_data["admin_a"]
    rep_a = test_data["rep_a"]
    
    l1 = Contact(client_id=admin_a.client_id, owner_id=admin_a.id, first_name="Admin Lead", email="a@l.com")
    # Lead assigned to Rep
    l2 = Contact(client_id=rep_a.client_id, owner_id=rep_a.id, first_name="Rep Lead", email="r@l.com")
    
    db_session.add_all([l1, l2])
    db_session.commit()
    
    res_admin = client.get("/api/contacts", headers={"Authorization": f"Bearer {admin_token}"})
    assert len(res_admin.json()) == 2
    
    res_rep = client.get("/api/contacts", headers={"Authorization": f"Bearer {rep_token}"})
    assert len(res_rep.json()) == 1
    assert res_rep.json()[0]["first_name"] == "Rep Lead"

def test_segmentation_logic(client, test_data, admin_token, db_session):
    admin_a = test_data["admin_a"]
    l1 = Contact(client_id=admin_a.client_id, first_name="Hot Lead", email="h@l.com", lead_score=90)
    l2 = Contact(client_id=admin_a.client_id, first_name="Cold Lead", email="c@l.com", lead_score=10)
    db_session.add_all([l1, l2])
    db_session.commit()
    
    payload = {
        "filters": [
            {"field": "lead_score", "op": ">=", "value": 50}
        ]
    }
    
    response = client.post(
        "/api/leads/segment", 
        json=payload, 
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["first_name"] == "Hot Lead"
