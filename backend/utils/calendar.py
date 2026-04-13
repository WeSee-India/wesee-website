import datetime
import pytz
import uuid
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request # Added for token refresh


from googleapiclient.discovery import build
from sqlalchemy.orm import Session
from models import CalendarConnection
from config import settings

def get_google_credentials(db: Session, user_id: int):
    """Reconstructs Google Credentials and auto-refreshes them if expired."""
    conn = db.query(CalendarConnection).filter(
        CalendarConnection.user_id == user_id, 
        CalendarConnection.provider == 'google'
    ).first()
    
    if not conn:
        return None
    
    creds = Credentials(
        token=conn.access_token,
        refresh_token=conn.refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
    )
    
    # Check if the token is expired or invalid
    if not creds.valid:
        if creds.expired and creds.refresh_token:
            try:
                # Request a new token from Google
                creds.refresh(Request())
                
                # Update the database vault with the fresh token and new expiry
                conn.access_token = creds.token
                conn.expires_at = creds.expiry
                db.commit()
            except Exception as e:
                # If the refresh fails (e.g., user revoked access), we can't proceed
                print(f"Token refresh failed for user {user_id}: {e}")
                return None
        else:
            # Token is invalid and we have no refresh token
            return None
            
    return creds


def get_google_busy_blocks(db: Session, user_id: int, date_str: str, timezone_str: str = "UTC"):
    """
    Fetches busy periods for a specific date (YYYY-MM-DD) from the user's primary calendar.
    Returns a list of dicts: [{'start': '...', 'end': '...'}]
    """
    creds = get_google_credentials(db, user_id)
    if not creds:
        raise Exception("No Google Calendar connected for this user.")

    # Build the Google Calendar API service
    service = build('calendar', 'v3', credentials=creds)

    tz = pytz.timezone(timezone_str)
    target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d")
    
    # Calculate exactly midnight to 11:59 PM in the target timezone
    time_min = tz.localize(datetime.datetime.combine(target_date, datetime.time.min)).isoformat()
    time_max = tz.localize(datetime.datetime.combine(target_date, datetime.time.max)).isoformat()

    body = {
        "timeMin": time_min,
        "timeMax": time_max,
        "timeZone": timezone_str,
        "items": [{"id": "primary"}]
    }

    # Query the freebusy endpoint
    events_result = service.freebusy().query(body=body).execute()
    busy_blocks = events_result['calendars']['primary']['busy']
    
    return busy_blocks

from typing import List, Dict

def generate_available_slots(date_str: str, timezone_str: str, busy_blocks: List[Dict[str, str]]) -> List[str]:
    """
    Calculates available 30-min slots based on 9-6 working hours, 
    a 1:30-2:30 break, and existing Google Calendar busy blocks.
    """
    tz = pytz.timezone(timezone_str)
    target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    now = datetime.datetime.now(tz)

    # Define working hours and break
    work_start = datetime.time(9, 0)
    break_start = datetime.time(13, 30)
    break_end = datetime.time(14, 30)
    work_end = datetime.time(18, 0)

    # Parse Google's UTC busy blocks to timezone-aware datetimes
    parsed_busy = []
    for block in busy_blocks:
        # Handle the 'Z' suffix for UTC if present
        start_str = block['start'].replace('Z', '+00:00')
        end_str = block['end'].replace('Z', '+00:00')
        start_dt = datetime.datetime.fromisoformat(start_str)
        end_dt = datetime.datetime.fromisoformat(end_str)
        parsed_busy.append((start_dt, end_dt))

    available_slots = []
    
    # Initialize the starting point in the requested timezone
    current_time = datetime.datetime.combine(target_date, work_start)
    current_time = tz.localize(current_time)
    end_time_dt = tz.localize(datetime.datetime.combine(target_date, work_end))

    while current_time < end_time_dt:
        slot_end = current_time + datetime.timedelta(minutes=30)
        
        # 1. Check if slot falls inside the lunch break
        time_only = current_time.time()
        if break_start <= time_only < break_end:
            current_time = slot_end
            continue

        # 2. Check if slot is already in the past
        if current_time <= now:
            current_time = slot_end
            continue

        # 3. Check for overlaps with Google busy blocks
        is_busy = False
        for busy_start, busy_end in parsed_busy:
            # Overlap condition: slot starts before busy ends AND slot ends after busy starts
            if current_time < busy_end and slot_end > busy_start:
                is_busy = True
                break

        if not is_busy:
            # Add clean string format, e.g., "09:00"
            available_slots.append(current_time.strftime("%H:%M"))

        current_time = slot_end

    return available_slots

def create_google_calendar_event(db: Session, user_id: int, summary: str, description: str, start_dt: datetime.datetime, end_dt: datetime.datetime, attendee_email: str):
    """
    Creates an event on the user's primary Google Calendar and generates a Meet link.
    Expects start_dt and end_dt to be timezone-aware datetime objects.
    """
    creds = get_google_credentials(db, user_id)
    if not creds:
        raise Exception("No Google Calendar connected for this user.")

    service = build('calendar', 'v3', credentials=creds)

    event_body = {
        'summary': summary,
        'description': description,
        'start': {
            'dateTime': start_dt.isoformat(),
        },
        'end': {
            'dateTime': end_dt.isoformat(),
        },
        'attendees': [
            {'email': attendee_email}
        ],
        'conferenceData': {
            'createRequest': {
                'requestId': f"{user_id}-{uuid.uuid4().hex[:8]}",
                'conferenceSolutionKey': {'type': 'hangoutsMeet'}
            }
        }
    }

    # conferenceDataVersion=1 is REQUIRED to auto-generate Google Meet links
    event = service.events().insert(
        calendarId='primary', 
        body=event_body, 
        sendUpdates='all', # Automatically emails the attendee
        conferenceDataVersion=1
    ).execute()
    
    return {
        "event_id": event.get('id'),
        "event_link": event.get('htmlLink'),
        "meet_link": event.get('hangoutLink')
    }

def update_google_calendar_event(db: Session, user_id: int, event_id: str, start_dt: datetime.datetime, end_dt: datetime.datetime):
    """Uses the Google Calendar PATCH method to update times without overwriting Meet links."""
    creds = get_google_credentials(db, user_id)
    if not creds:
        raise Exception("No Google Calendar connected for this user.")

    service = build('calendar', 'v3', credentials=creds)
    
    event_patch = {
        'start': {'dateTime': start_dt.isoformat()},
        'end': {'dateTime': end_dt.isoformat()}
    }
    
    updated_event = service.events().patch(
        calendarId='primary', 
        eventId=event_id, 
        body=event_patch, 
        sendUpdates='all' # Automatically emails the prospect about the time change
    ).execute()
    
    return updated_event



