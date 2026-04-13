import pytest
from unittest.mock import patch, MagicMock
from contextlib import contextmanager
from datetime import datetime, timedelta
from models import Contact, Activity, Deal

@pytest.fixture
def mock_celery_infra():
    # Patch SessionLocal in celery_worker to return our db_session
    # We use a context manager inside the test to avoid leakages
    with patch("celery_worker.execute_workflow_step.delay") as mock_delay, \
         patch("celery_worker.update_lead_score") as mock_score_fn:
        yield {
            "delay": mock_delay,
            "update_score": mock_score_fn
        }


def test_analytics_timeline_sorting(client, test_data, admin_token, db_session):
    client_a = test_data["client_a"]
    l = Contact(client_id=client_a.id, first_name="Timeline Lead", email="time@test.com")
    db_session.add(l)
    db_session.commit()
    db_session.refresh(l)
    
    now = datetime.utcnow()
    a1 = Activity(contact_id=l.id, activity_type="call", notes="Day 1", created_at=now - timedelta(days=2))
    a2 = Activity(contact_id=l.id, activity_type="email", notes="Day 2", created_at=now - timedelta(days=1))
    a3 = Activity(contact_id=l.id, activity_type="meeting", notes="Day 3", created_at=now)
    
    db_session.add_all([a1, a2, a3])
    db_session.commit()
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get(f"/api/contacts/{l.id}/timeline", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["notes"] == "Day 3"
    assert data[1]["notes"] == "Day 2"
    assert data[2]["notes"] == "Day 1"

def test_analytics_attribution_math(client, test_data, admin_token, db_session):
    client_a = test_data["client_a"]
    
    l1 = Contact(client_id=client_a.id, utm_source="google_ads", email="g1@t.com")
    l2 = Contact(client_id=client_a.id, utm_source="google_ads", email="g2@t.com")
    l3 = Contact(client_id=client_a.id, utm_source="linkedin", email="li@t.com")
    
    db_session.add_all([l1, l2, l3])
    db_session.commit()
    
    db_session.add_all([
        Deal(contact_id=l1.id, stage_id=1),
        Deal(contact_id=l2.id, stage_id=1),
        Deal(contact_id=l3.id, stage_id=1)
    ])
    db_session.commit()
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/api/reports/attribution", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    counts = {r["source"]: r["deals"] for r in data}
    
    assert counts["google_ads"] == 2
    assert counts["linkedin"] == 1


def test_sweep_cold_leads_transition(db_session):
    import celery_worker
    from sqlalchemy import text
    from datetime import datetime
    
    cold_lead = Contact(client_id=1, status="new", is_subscribed=True)
    db_session.add(cold_lead)
    db_session.commit()
    
    db_session.execute(text(f"UPDATE contacts SET created_at='2000-01-01 00:00:00', status='new', is_subscribed=1 WHERE id={cold_lead.id}"))
    db_session.commit()
    db_session.expire_all()
    
    @contextmanager
    def mock_get_task_db():
        yield db_session
        db_session.commit()

    with patch("celery_worker.get_task_db", new=mock_get_task_db), \
         patch("celery_worker.execute_workflow_step.delay") as mock_delay:
        celery_worker.sweep_cold_leads.run()
        
    db_session.refresh(cold_lead)
    assert cold_lead.status == "nurturing"
    assert mock_delay.called

def test_sweep_stale_leads_penalty(db_session):
    import celery_worker
    from sqlalchemy import text
    from datetime import datetime
    
    # Stale lead
    stale_lead = Contact(client_id=1, lead_score=50, status="new", is_subscribed=True)
    db_session.add(stale_lead)
    db_session.commit()
    
    db_session.execute(text(f"UPDATE contacts SET last_active='2000-01-01 00:00:00', is_subscribed=1, status='new' WHERE id={stale_lead.id}"))
    db_session.commit()
    db_session.expire_all()
    
    @contextmanager
    def mock_get_task_db():
        yield db_session
        db_session.commit()

    with patch("celery_worker.get_task_db", new=mock_get_task_db), \
         patch("celery_worker.update_lead_score") as mock_score:
        celery_worker.sweep_stale_leads.run()
        
    db_session.refresh(stale_lead)
    assert stale_lead.last_active.year > 2000
    assert mock_score.called
