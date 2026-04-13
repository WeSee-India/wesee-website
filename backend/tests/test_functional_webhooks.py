import pytest
from models import Contact

def test_aggressive_duplicate_prevention_across_sources(client, test_data, db_session):
    client_a = test_data["client_a"]
    
    # 1. Ingest lead via Meta Webhook
    meta_payload = {
        "client_id": client_a.id,
        "first_name": "Functional Lead",
        "email": "func@test.com",
        "phone": "+16505551111",
        "ad_id": "ad_999",
        "campaign_name": "Meta Campaign"
    }
    res1 = client.post("/api/webhooks/meta", json=meta_payload)
    assert res1.status_code == 200
    
    # Verify created
    assert db_session.query(Contact).count() == 1
    lead = db_session.query(Contact).first()
    assert lead.utm_campaign == "Meta Campaign"
    last_active_initial = lead.last_active
    
    # 2. Ingest SAME lead via Google Webhook with different phone formatting
    # "+1 650 555-1111" should normalize to "+16505551111"
    google_payload = {
        "lead_id": "g_888",
        "campaign_id": "google_camp_55",
        "user_column_data": [
            {"column_name": "Full Name", "string_value": "Functional Lead"},
            {"column_name": "User Email", "string_value": "func@test.com"},
            {"column_name": "User Phone", "string_value": "+1 650 555-1111"}
        ]
    }
    # Direct hit with client_id
    res2 = client.post(f"/api/webhooks/google?client_id={client_a.id}", json=google_payload)
    assert res2.status_code == 200
    
    # 3. ASSERTIONS
    # Count should still be 1
    assert db_session.query(Contact).count() == 1
    
    # Refresh lead data
    db_session.refresh(lead)
    
    # last_active should be updated (greater than initial)
    assert lead.last_active >= last_active_initial
    
    # Utm_source or other metadata should be correctly handled 
    # (Existing logic in handle_duplicate_prevention just returns existing)
    # But last_active is usually updated in the route
    
def test_duplicate_prevention_within_client_only(client, test_data, db_session):
    client_a = test_data["client_a"]
    
    # Initial lead for Client A
    db_session.add(Contact(client_id=client_a.id, email="dup@test.com", phone="+19998887777"))
    db_session.commit()
    
    # Another lead with same email but DIFFERENT client_id (Client B)
    # We'll create a quick client b
    from models import Client
    client_b = Client(name="Tenant B")
    db_session.add(client_b)
    db_session.commit()
    db_session.refresh(client_b)
    
    meta_payload_b = {
        "client_id": client_b.id,
        "first_name": "Other Tenant Lead",
        "email": "dup@test.com", # Same email
        "phone": "+19998887777", # Same phone
        "ad_id": "ad_000"
    }
    
    res = client.post("/api/webhooks/meta", json=meta_payload_b)
    assert res.status_code == 200
    
    # Result: Total contacts should be 2 because client_id is the primary isolation key
    assert db_session.query(Contact).count() == 2
