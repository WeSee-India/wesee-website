import datetime
import pytz
from typing import Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, Contact, Activity
from utils.calendar import get_google_busy_blocks, generate_available_slots, create_google_calendar_event, update_google_calendar_event
from utils.security import generate_reschedule_token, verify_reschedule_token
from tasks import send_appointment_reminder

router = APIRouter(prefix="/api/meetings", tags=["Meetings & Booking"])

class BookMeetingRequest(BaseModel):
    contact_id: int
    date: str # YYYY-MM-DD
    time: str # HH:MM (e.g., "14:30")
    tz: str = "Asia/Kolkata"
    duration_minutes: int = 30

class RescheduleRequest(BaseModel):
    date: str
    time: str
    tz: str = "Asia/Kolkata"
    duration_minutes: int = 30

@router.get("/{user_id}/slots")
def get_available_slots(
    user_id: int, 
    date: str = Query(..., description="Target date in YYYY-MM-DD format"),
    tz: str = Query("Asia/Kolkata", description="Timezone string, e.g., Asia/Kolkata"),
    db: Session = Depends(get_db)
):
    """Fetches available 30-minute booking slots for a specific sales rep."""
    
    # Verify the rep exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch busy blocks from Google
    try:
        busy_blocks = get_google_busy_blocks(db, user_id, date, tz)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calendar Sync Error: {str(e)}")

    # Calculate free slots based on 9-6 schedule and busy blocks
    try:
        slots = generate_available_slots(date, tz, busy_blocks)
        return {"date": date, "timezone": tz, "available_slots": slots}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Slot generation failed: {str(e)}")

@router.post("/{user_id}/book")
def book_meeting(user_id: int, req: BookMeetingRequest, db: Session = Depends(get_db)):
    """Books a meeting, invites the prospect, and logs it in the CRM."""
    
    # 1. Fetch User and Contact
    user = db.query(User).filter(User.id == user_id).first()
    contact = db.query(Contact).filter(Contact.id == req.contact_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Sales rep not found")
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # 2. Timezone Math: Convert requested date/time to timezone-aware datetimes
    tz = pytz.timezone(req.tz)
    try:
        target_date = datetime.datetime.strptime(req.date, "%Y-%m-%d").date()
        target_time = datetime.datetime.strptime(req.time, "%H:%M").time()
        
        start_dt = tz.localize(datetime.datetime.combine(target_date, target_time))
        end_dt = start_dt + datetime.timedelta(minutes=req.duration_minutes)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date or time format.")

    # 3. Write to Google Calendar
    summary = f"Discovery Call: {contact.first_name} & WeSee CRM"
    description = f"Automated booking via WeSee CRM.\n\nProspect Details:\nName: {contact.first_name}\nEmail: {contact.email}\nPhone: {contact.phone or 'N/A'}"
    
    try:
        gcal_result = create_google_calendar_event(
            db=db, 
            user_id=user.id, 
            summary=summary, 
            description=description, 
            start_dt=start_dt, 
            end_dt=end_dt, 
            attendee_email=contact.email
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to book calendar event: {str(e)}")

    # Generate 24-hour secure reschedule link
    token = generate_reschedule_token(gcal_result.get("event_id"), user.id, contact.id)
    # Using a relative path or configurable base URL is better, but following the prompt's request for localhost
    reschedule_link = f"http://localhost:8000/api/meetings/reschedule/{token}"
    gcal_result["reschedule_link"] = reschedule_link

    # 4. Log the Activity in the CRM (Mapped to correct schema fields)
    activity = Activity(
        contact_id=contact.id,
        activity_type="meeting_booked",
        notes=f"Meeting booked for {req.date} at {req.time} ({req.tz}).",
        data={
            "meet_link": gcal_result.get("meet_link"),
            "event_link": gcal_result.get("event_link"),
            "reschedule_link": reschedule_link
        }
    )
    db.add(activity)
    db.commit()

    # --- SCHEDULE CELERY ETA REMINDERS ---
    now_utc = datetime.datetime.utcnow()
    
    # Convert start_dt to naive UTC for consistent comparison and storage
    start_dt_utc = start_dt.astimezone(pytz.UTC).replace(tzinfo=None)
    
    # 24-Hour Reminder
    eta_24h = start_dt_utc - datetime.timedelta(hours=24)
    if eta_24h > now_utc:
        send_appointment_reminder.apply_async(
            args=[contact.email, contact.first_name, start_dt.strftime("%A at %I:%M %p"), "24h"],
            eta=eta_24h
        )
        
    # 2-Hour Reminder
    eta_2h = start_dt_utc - datetime.timedelta(hours=2)
    if eta_2h > now_utc:
        send_appointment_reminder.apply_async(
            args=[contact.email, contact.first_name, start_dt.strftime("%A at %I:%M %p"), "2h"],
            eta=eta_2h
        )

    return {

        "message": "Meeting booked successfully!",
        "meet_link": gcal_result.get("meet_link"),
        "reschedule_link": reschedule_link,
        "start_time": start_dt_utc.isoformat(),
        "end_time": (end_dt.astimezone(pytz.UTC).replace(tzinfo=None)).isoformat()
    }

@router.post("/reschedule/{token}")
def reschedule_meeting(token: str, req: RescheduleRequest, db: Session = Depends(get_db)):
    """Decodes a 24-hour token, validates it, and patches the Google Calendar event."""
    payload = verify_reschedule_token(token)
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired reschedule link.")
        
    user_id = payload['user_id']
    event_id = payload['event_id']
    contact_id = payload['contact_id']
    
    # Timezone Math
    tz = pytz.timezone(req.tz)
    try:
        target_date = datetime.datetime.strptime(req.date, "%Y-%m-%d").date()
        target_time = datetime.datetime.strptime(req.time, "%H:%M").time()
        start_dt = tz.localize(datetime.datetime.combine(target_date, target_time))
        end_dt = start_dt + datetime.timedelta(minutes=req.duration_minutes)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date or time format.")
        
    # Patch Google Calendar
    try:
        update_google_calendar_event(db, user_id, event_id, start_dt, end_dt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reschedule Google event: {str(e)}")
        
    # Log the Activity (Mapped to correct schema fields)
    activity = Activity(
        contact_id=contact_id,
        activity_type="meeting_rescheduled",
        notes=f"Meeting shifted to {req.date} at {req.time} ({req.tz}).",
        data={"event_id": event_id}
    )
    db.add(activity)
    db.commit()
    
    return {"message": "Meeting successfully rescheduled!", "new_start": start_dt.isoformat()}

@router.post("/{activity_id}/complete")
def complete_meeting(activity_id: int, notes: str = Query(None), db: Session = Depends(get_db)):
    """
    Marks a meeting as completed. 
    This prevents the automated No-Show task from triggering.
    """
    # Find the original booking activity
    booking = db.query(Activity).filter(Activity.id == activity_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found")

    # Log the completion activity
    completion = Activity(
        contact_id=booking.contact_id,
        activity_type="meeting_completed",
        notes=notes or "Meeting completed successfully.",
        data={"original_booking_id": activity_id}
    )
    db.add(completion)
    db.commit()
    
    return {"message": "Meeting marked as completed. No-show automation silenced."}

