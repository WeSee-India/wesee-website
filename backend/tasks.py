from celery_app import celery_app
import logging
from datetime import datetime, timedelta, timezone
from database import get_task_db
from models import Activity, Contact
from utils.security import generate_reschedule_token
from utils.prompts import SYSTEM_VOICE
from utils.ai_engine import ai_engine
from communications import send_email_outbound

logger = logging.getLogger(__name__)


@celery_app.task(name="send_appointment_reminder")
def send_appointment_reminder(contact_email: str, contact_name: str, meeting_time: str, reminder_type: str):
    """
    Simulates sending an Email/WhatsApp reminder to the prospect.
    reminder_type will be '24h' or '2h'.
    """
    # In the future, we will wire SendGrid or Twilio API here.
    message = f"[{reminder_type} REMINDER] Hey {contact_name}, just a reminder about our meeting at {meeting_time}."
    logger.info(message)
    print(f"DELIVERED: {message} to {contact_email}")
    return "Reminder sent"

@celery_app.task(name="tasks.send_no_show_email")
def send_no_show_email(contact_email: str, contact_name: str, reschedule_link: str):
    """Simulates sending the No-Show follow-up email."""
    message = f"Hi {contact_name}, looks like we missed each other. Reschedule here: {reschedule_link}"
    logger.info(f"[NO-SHOW] {message}")
    print(f"DELIVERED NO-SHOW EMAIL TO: {contact_email}")
    return "No-show email sent"

@celery_app.task(name="tasks.check_for_no_shows")
def check_for_no_shows():
    """Runs hourly to find meetings that ended 30+ mins ago without an outcome."""
    with get_task_db() as db:
        now_utc = datetime.now(timezone.utc)
        threshold_time = now_utc - timedelta(minutes=30)
        
        # 1. Find all booked meetings
        booked_activities = db.query(Activity).filter(
            Activity.activity_type == "meeting_booked"
        ).all()
        
        for activity in booked_activities:
            # Reconstruct the meeting start time from the data payload
            start_time_str = activity.data.get("start_time")
            if not start_time_str:
                continue
                
            try:
                start_dt = datetime.fromisoformat(start_time_str)
                # Normalise to UTC-aware; if naive, assume UTC
                if start_dt.tzinfo is None:
                    start_dt = start_dt.replace(tzinfo=timezone.utc)
                else:
                    start_dt = start_dt.astimezone(timezone.utc)
            except (ValueError, TypeError):
                continue
            
            # 2. Check if the meeting started more than 30 mins ago
            if start_dt < threshold_time:
                
                # 3. Check if an outcome was logged for this specific contact AFTER the meeting
                outcome_exists = db.query(Activity).filter(
                    Activity.contact_id == activity.contact_id,
                    Activity.activity_type == "meeting_completed", # Rep must log this manually in the CRM
                    Activity.created_at > start_dt
                ).first()
                
                if not outcome_exists:
                    # Guard: Check if we already sent a follow-up for this meeting
                    already_sent = db.query(Activity).filter(
                        Activity.contact_id == activity.contact_id,
                        Activity.activity_type == "no_show_followup_sent",
                        Activity.created_at > start_dt
                    ).first()
                    
                    if already_sent:
                        continue

                    # 4. It's a no-show. Generate a fresh reschedule link and fire the email.
                    contact = db.query(Contact).filter(Contact.id == activity.contact_id).first()
                    if contact:
                        event_id = activity.data.get("event_id", "unknown_event")
                        owner_id = contact.owner_id
                        if not owner_id:
                            continue

                        token = generate_reschedule_token(event_id, owner_id, contact.id)
                        reschedule_link = f"http://localhost:8000/api/meetings/reschedule/{token}"
                        
                        send_no_show_email.delay(contact.email, contact.first_name, reschedule_link)
                        
                        # Log that we sent the no-show
                        no_show_log = Activity(
                            contact_id=contact.id,
                            activity_type="no_show_followup_sent",
                            notes="Automated no-show sequence triggered."
                        )
                        db.add(no_show_log)

@celery_app.task(name="tasks.send_ai_followup_summary")
def send_ai_followup_summary(contact_id: int, notes: str):
    with get_task_db() as db:
        contact = db.query(Contact).filter(Contact.id == contact_id).first()
        if not contact:
            logger.error(f"Contact {contact_id} not found for follow-up summary.")
            return

        # Fetch last 3 activities for context (Memory)
        history = db.query(Activity).filter(Activity.contact_id == contact_id).order_by(Activity.created_at.desc()).limit(3).all()
        history_text = "\n".join([f"- {h.activity_type}: {h.notes}" for h in history])

        prompt = f"""
        {SYSTEM_VOICE}
        
        LEAD HISTORY:
        {history_text}
        
        NEW MEETING NOTES:
        {notes}
        
        TASK: Write a 3-sentence professional follow-up for {contact.first_name}. 
        Link the new notes to the history if it makes sense.
        """
        
        # Invoke Gemini via ai_engine.llm
        response = ai_engine.llm.invoke(prompt)
        final_content = response.content
        if isinstance(final_content, list):
            text_parts = [
                block.get("text", "") 
                for block in final_content 
                if isinstance(block, dict) and "text" in block
            ]
            followup_text = "".join(text_parts).strip()
        else:
            followup_text = str(final_content).strip()

        # Send the follow-up email
        lead_data = {
            "id": contact.id,
            "first_name": contact.first_name,
            "email": contact.email
        }
        send_email_outbound(
            contact.email, 
            "Next Steps: Recap of our Discussion", 
            followup_text, 
            lead_data
        )

        # Log Activity
        activity_log = Activity(
            contact_id=contact.id,
            activity_type="ai_followup_summary_sent",
            notes=f"AI-generated follow-up sent based on notes: {notes[:50]}..."
        )
        db.add(activity_log)
        
        logger.info(f"AI follow-up summary sent for contact {contact_id}")
        return "Follow-up summary sent"
