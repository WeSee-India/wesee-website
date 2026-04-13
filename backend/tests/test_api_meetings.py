import pytest
from unittest.mock import patch
from models import Contact, Activity

# Mocking Google Calendar utilities to prevent actual API calls
@pytest.fixture
def mock_calendar_utils():
    with patch("routers.meetings.get_google_busy_blocks") as mock_busy, \
         patch("routers.meetings.generate_available_slots") as mock_slots, \
         patch("routers.meetings.create_google_calendar_event") as mock_create:
        
        mock_busy.return_value = []
        mock_slots.return_value = ["10:00", "10:30", "11:00"]
        mock_create.return_value = {
            "event_id": "test_event_123",
            "meet_link": "https://meet.google.com/test",
            "event_link": "https://calendar.google.com/test"
        }
        yield {
            "busy": mock_busy,
            "slots": mock_slots,
            "create": mock_create
        }

def test_get_available_slots(client, test_data, mock_calendar_utils):
    rep_a = test_data["rep_a"]
    response = client.get(f"/api/meetings/{rep_a.id}/slots?date=2026-05-10&tz=Asia/Kolkata")
    assert response.status_code == 200
    assert "available_slots" in response.json()
    assert response.json()["available_slots"] == ["10:00", "10:30", "11:00"]

def test_book_meeting_success(client, test_data, db_session, mock_calendar_utils):
    rep_a = test_data["rep_a"]
    # Create contact
    l = Contact(client_id=test_data["client_a"].id, first_name="Booker", email="book@test.com")
    db_session.add(l)
    db_session.commit()
    
    payload = {
        "contact_id": l.id,
        "date": "2026-05-10",
        "time": "10:00",
        "tz": "Asia/Kolkata"
    }
    
    # We also need to mock Celery apply_async since it's called on success
    with patch("routers.meetings.send_appointment_reminder.apply_async") as mock_celery:
        response = client.post(f"/api/meetings/{rep_a.id}/book", json=payload)
        assert response.status_code == 200
        assert "meet_link" in response.json()
        assert "reschedule_link" in response.json()
        
    # Verify Activity creation
    activity = db_session.query(Activity).filter(Activity.contact_id == l.id, Activity.activity_type == "meeting_booked").first()
    assert activity is not None

def test_reschedule_invalid_token(client):
    payload = {
        "date": "2026-05-11",
        "time": "14:00"
    }
    response = client.post("/api/meetings/reschedule/fake_token_123", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid or expired reschedule link."

def test_complete_meeting(client, test_data, db_session):
    # Create a contact and a booking activity
    l = Contact(client_id=test_data["client_a"].id, first_name="Finisher", email="finish@test.com")
    db_session.add(l)
    db_session.commit()
    
    act = Activity(contact_id=l.id, activity_type="meeting_booked", notes="Initial Session")
    db_session.add(act)
    db_session.commit()
    
    response = client.post(f"/api/meetings/{act.id}/complete?notes=Great session!")
    assert response.status_code == 200
    
    # Verify completion activity
    completion = db_session.query(Activity).filter(Activity.contact_id == l.id, Activity.activity_type == "meeting_completed").first()
    assert completion is not None
    assert completion.notes == "Great session!"
