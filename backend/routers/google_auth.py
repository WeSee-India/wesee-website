import os
import redis
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow
from config import settings
from database import get_db
from models import CalendarConnection, User
from dependencies import get_current_user

# Insecure transport is ONLY allowed in development
if settings.ENVIRONMENT == "development":
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

router = APIRouter(prefix="/api/auth/google", tags=["Calendar OAuth"])

SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
]

# Initialize Redis client (assuming default local port from Day 5)
redis_client = redis.Redis(host='127.0.0.1', port=6379, db=0, decode_responses=True)

def get_google_flow(state=None):
    client_config = {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
        }
    }
    flow = Flow.from_client_config(
        client_config, 
        scopes=SCOPES,
        state=state
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    return flow

@router.get("/login")
def login_google(current_user: User = Depends(get_current_user)):
    """Generates the Google Login URL and stores the PKCE verifier in Redis."""
    state = str(current_user.id)
    flow = get_google_flow(state=state)
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    
    # Store the PKCE verifier in Redis with a 5-minute expiration
    redis_client.setex(f"oauth_state:{state}", 300, flow.code_verifier)
    
    return {"auth_url": authorization_url}

@router.get("/callback")
def google_callback(request: Request, state: str, code: str, db: Session = Depends(get_db)):
    """Receives the code, retrieves the verifier from Redis, and fetches tokens."""
    try:
        flow = get_google_flow(state=state)
        
        # Retrieve the PKCE verifier from Redis
        stored_verifier = redis_client.get(f"oauth_state:{state}")
        if not stored_verifier:
            raise HTTPException(status_code=400, detail="OAuth state expired or invalid.")
            
        flow.code_verifier = stored_verifier
            
        flow.fetch_token(authorization_response=str(request.url))
        credentials = flow.credentials
        
        # Clean up the store
        redis_client.delete(f"oauth_state:{state}")
            
        user_id = int(state)
        
        connection = db.query(CalendarConnection).filter(CalendarConnection.user_id == user_id).first()
        if not connection:
            connection = CalendarConnection(user_id=user_id, provider="google")
            db.add(connection)
        
        connection.access_token = credentials.token
        if credentials.refresh_token:
            connection.refresh_token = credentials.refresh_token
        connection.expires_at = credentials.expiry
        
        db.commit()
        return {"message": "Google Calendar connected successfully!", "user_id": user_id}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth Flow Failed: {str(e)}")
