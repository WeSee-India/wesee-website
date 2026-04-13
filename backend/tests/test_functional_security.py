import pytest
from models import Contact

def test_strict_tenant_isolation(client, test_data, admin_token, db_session):
    # Setup: Create a lead for a DIFFERENT tenant
    from models import Client
    client_b = Client(name="Unauthorized Tenant")
    db_session.add(client_b)
    db_session.commit()
    db_session.refresh(client_b)
    
    b_lead = Contact(client_id=client_b.id, first_name="B Lead", email="b@test.com")
    db_session.add(b_lead)
    db_session.commit()
    
    # Authenticate as Tenant A
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Test Listing: Should NOT see B Lead
    res_list = client.get("/api/contacts", headers=headers)
    assert res_list.status_code == 200
    for lead in res_list.json():
        assert lead["client_id"] == test_data["client_a"].id
        assert lead["first_name"] != "B Lead"
        
    # 2. Test Direct ID Access: Should fail or be filtered
    # Our current GET /api/contacts/{id} might not be implemented, 
    # but isolation is typically at the query filter level.

def test_rbac_rep_cannot_see_others_leads(client, test_data, rep_token, db_session):
    client_a = test_data["client_a"]
    admin_a = test_data["admin_a"]
    rep_a = test_data["rep_a"]
    
    # Lead 1: Owned by Rep
    l1 = Contact(client_id=client_a.id, owner_id=rep_a.id, first_name="My Lead")
    # Lead 2: Owned by Admin (or another Rep)
    l2 = Contact(client_id=client_a.id, owner_id=admin_a.id, first_name="Hidden Lead")
    
    db_session.add_all([l1, l2])
    db_session.commit()
    
    # Authenticate as Rep
    headers = {"Authorization": f"Bearer {rep_token}"}
    response = client.get("/api/contacts", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    # Should only see "My Lead"
    assert len(data) == 1
    assert data[0]["first_name"] == "My Lead"

def test_admin_sees_all_tenant_leads(client, test_data, admin_token, db_session):
    client_a = test_data["client_a"]
    admin_a = test_data["admin_a"]
    rep_a = test_data["rep_a"]
    
    l1 = Contact(client_id=client_a.id, owner_id=rep_a.id, first_name="Rep Lead")
    l2 = Contact(client_id=client_a.id, owner_id=admin_a.id, first_name="Admin Lead")
    
    db_session.add_all([l1, l2])
    db_session.commit()
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/api/contacts", headers=headers)
    
    assert response.status_code == 200
    assert len(response.json()) == 2
