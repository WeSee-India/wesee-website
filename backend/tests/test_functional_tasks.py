import pytest
from unittest.mock import patch, MagicMock, ANY
from contextlib import contextmanager
from datetime import datetime, timedelta
from database import SessionLocal
from models import Contact, Activity, User, Client
from tasks import send_appointment_reminder, check_for_no_shows, send_ai_followup_summary
from sqlalchemy import text

# --- FIXTURES ---

@pytest.fixture
def mock_task_infra():
    """Mocks outbound comms and AI engine for task testing."""
    from utils.ai_engine import ai_engine
    
    with patch("tasks.send_no_show_email.delay") as mock_no_show_delay, \
         patch("tasks.send_email_outbound") as mock_email, \
         patch.object(ai_engine, "llm") as mock_llm:
        
        # Mock LLM response structure for Gemini
        mock_response = MagicMock()
        mock_response.content = "This is a professional AI-generated follow-up summary."
        mock_llm.invoke.return_value = mock_response
        
        yield {
            "no_show_delay": mock_no_show_delay,
            "email": mock_email,
            "llm": mock_llm
        }

# --- TESTS ---

def test_send_appointment_reminder_logging(caplog):
    """Verifies that the reminder task logs the expected message."""
    send_appointment_reminder("test@lead.com", "John", "2026-05-01 10:00 AM", "24h")
    assert "24h REMINDER" in caplog.text
    assert "John" in caplog.text

def test_no_show_detection_logic(db_session, test_data, mock_task_infra):
    """
    Verifies that the system identifies meetings that ended >30 mins ago 
    without an outcome and triggers follow-up.
    """
    import tasks
    client_a = test_data["client_a"]
    rep_a = test_data["rep_a"]
    
    # 1. Create a lead
    contact = Contact(
        client_id=client_a.id,
        first_name="No-Show-Nick",
        email="nick@noshow.com",
        owner_id=rep_a.id
    )
    db_session.add(contact)
    db_session.commit()
    
    # 2. Create a meeting_booked activity in the past (1 hour ago)
    # The task filters by activity_type="meeting_booked"
    meeting_time = (datetime.utcnow() - timedelta(hours=1)).isoformat()
    booked_act = Activity(
        contact_id=contact.id,
        activity_type="meeting_booked",
        data={"start_time": meeting_time, "event_id": "evt_abc_123"},
        notes="Scheduled discovery call."
    )
    db_session.add(booked_act)
    db_session.commit()
    
    # Force visibility
    db_session.expire_all()
    
    # 3. Mock get_task_db to yield our test session
    @contextmanager
    def mock_get_task_db():
        yield db_session
        db_session.commit()
        
    with patch("tasks.get_task_db", new=mock_get_task_db):
        tasks.check_for_no_shows.run()
        
    db_session.refresh(contact)
    
    # 4. Assertions
    # A 'no_show_followup_sent' activity should be created
    followup = db_session.query(Activity).filter(
        Activity.contact_id == contact.id,
        Activity.activity_type == "no_show_followup_sent"
    ).first()
    
    assert followup is not None
    assert "triggered" in followup.notes.lower()
    
    # The email delay should have been called
    mock_task_infra["no_show_delay"].assert_called_once()
    args, _ = mock_task_infra["no_show_delay"].call_args
    assert args[0] == "nick@noshow.com"
    assert "/api/meetings/reschedule/" in args[2]

def test_ai_followup_summary_generation(db_session, test_data, mock_task_infra):
    """Verifies that the AI follow-up generator pulls history and sends a recap."""
    import tasks
    client_a = test_data["client_a"]
    contact = Contact(client_id=client_a.id, first_name="Busy-Bob", email="bob@busy.com")
    db_session.add(contact)
    db_session.commit()
    
    # Seed history for AI context
    db_session.add(Activity(contact_id=contact.id, activity_type="email", notes="Sent pricing info."))
    db_session.commit()
    
    db_session.expire_all()
    
    # Run the task
    @contextmanager
    def mock_get_task_db():
        yield db_session
        db_session.commit()
        
    with patch("tasks.get_task_db", new=mock_get_task_db):
        tasks.send_ai_followup_summary.run(contact.id, "Talked about the Q3 plan.")
        
    db_session.refresh(contact)
    
    # Assert Activity Logged
    summary_act = db_session.query(Activity).filter(
        Activity.contact_id == contact.id,
        Activity.activity_type == "ai_followup_summary_sent"
    ).first()
    assert summary_act is not None
    assert "Q3 plan" in summary_act.notes
    
    # Assert Email Sent
    mock_task_infra["email"].assert_called()
    _, email_args, _ = mock_task_infra["email"].mock_calls[0]
    assert email_args[0] == "bob@busy.com"
    assert "Recap of our Discussion" in email_args[1]
    assert "This is a professional AI-generated follow-up summary." in email_args[2]

def test_no_show_guard_already_sent(db_session, test_data, mock_task_infra):
    """Verifies that no-show follow-up is not sent twice."""
    import tasks
    client_a = test_data["client_a"]
    rep_a = test_data["rep_a"]
    
    contact = Contact(client_id=client_a.id, first_name="Duo-Nick", email="nick@twiceshow.com", owner_id=rep_a.id)
    db_session.add(contact)
    db_session.commit()
    
    meeting_time = (datetime.utcnow() - timedelta(hours=1)).isoformat()
    db_session.add(Activity(
        contact_id=contact.id,
        activity_type="meeting_booked",
        data={"start_time": meeting_time}
    ))
    db_session.add(Activity(
        contact_id=contact.id,
        activity_type="no_show_followup_sent",
        created_at=datetime.utcnow() # Sent just now
    ))
    db_session.commit()
    
    @contextmanager
    def mock_get_task_db():
        yield db_session
        db_session.commit()
        
    with patch("tasks.get_task_db", new=mock_get_task_db):
        tasks.check_for_no_shows.run()
        
    # Should NOT have been called again
    assert mock_task_infra["no_show_delay"].call_count == 0
