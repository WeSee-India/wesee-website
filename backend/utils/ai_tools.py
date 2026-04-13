from langchain.tools import tool
from utils.calendar import generate_available_slots, get_google_busy_blocks, create_google_calendar_event
from utils.security import generate_reschedule_token
from models import Contact, Activity
from database import SessionLocal
import datetime
import pytz

@tool
def check_calendar_availability(date_str: str, user_id: int) -> str:
    """
    Checks available 30-minute slots for a specific user on a given date (YYYY-MM-DD).
    """
    db = SessionLocal()
    try:
        # Defaulting to IST for now as per project standard
        busy_blocks = get_google_busy_blocks(db, user_id, date_str, "Asia/Kolkata")
        slots = generate_available_slots(date_str, "Asia/Kolkata", busy_blocks)
        return f"Available slots for {date_str}: {', '.join(slots)}"
    except Exception as e:
        print(f"DEBUG: Availability Tool Exception: {str(e)}")
        return f"Failed to check availability: {str(e)}"
    finally:
        db.close()

@tool
def book_appointment(user_id: int, contact_email: str, contact_name: str, date_str: str, time_str: str, client_id: int, owner_id: int) -> str:
    """
    Books a meeting on the calendar. 
    MUST have the prospect's email, name, date (YYYY-MM-DD), time (HH:MM), client_id, and owner_id.
    """
    db = SessionLocal()
    try:
        # 1. Find or create the contact
        contact = db.query(Contact).filter(Contact.email == contact_email).first()
        if not contact:
            # Basic fallback if they give a single name
            parts = contact_name.split(" ", 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""
            contact = Contact(
                email=contact_email, 
                first_name=first_name, 
                last_name=last_name,
                client_id=client_id,
                owner_id=owner_id
            )
            # The prompt provided:
            # contact = Contact(email=contact_email, first_name=first_name, last_name=last_name)
            db.add(contact)
            db.commit()
            db.refresh(contact)

        # 2. Time Math (Defaulting to IST)
        tz = pytz.timezone("Asia/Kolkata")
        target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        target_time = datetime.datetime.strptime(time_str, "%H:%M").time()
        start_dt = tz.localize(datetime.datetime.combine(target_date, target_time))
        end_dt = start_dt + datetime.timedelta(minutes=30)

        # 3. Book on Google Calendar
        gcal_result = create_google_calendar_event(db, user_id, "Intro Meeting", f"Meeting with {contact_name}", start_dt, end_dt, contact.email)

        # 4. Generate Reschedule Link
        token = generate_reschedule_token(gcal_result.get("event_id"), user_id, contact.id)
        reschedule_link = f"http://localhost:8000/api/meetings/reschedule/{token}"
        gcal_result["reschedule_link"] = reschedule_link

        # 5. Log Activity
        activity = Activity(
            contact_id=contact.id,
            activity_type="meeting_booked",
            notes=f"AI booked meeting for {date_str} at {time_str}",
            data=gcal_result
        )
        db.add(activity)
        db.commit()

        return f"Successfully booked for {date_str} at {time_str}. Google Meet link generated."
    except Exception as e:
        print(f"DEBUG: Booking Tool Exception: {str(e)}") # This will show in dhruv's terminal
        return f"Failed to book meeting: {str(e)}"
    finally:
        db.close()

@tool
def get_lead_score(contact_email: str) -> str:
    """
    Retrieves the lead score and health label for a specific contact email.
    Use this to tailor your communication based on how 'Hot' or 'Cold' the lead is.
    """
    db = SessionLocal()
    try:
        contact = db.query(Contact).filter(Contact.email == contact_email).first()
        if not contact:
            return f"Contact with email {contact_email} not found."
        
        return f"Lead Score: {contact.lead_score} - Label: {contact.lead_label}"
    except Exception as e:
        return f"Error fetching lead score: {str(e)}"
    finally:
        db.close()
