from itsdangerous import URLSafeTimedSerializer
from config import settings

def generate_reschedule_token(event_id: str, user_id: int, contact_id: int) -> str:
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    payload = {"event_id": event_id, "user_id": user_id, "contact_id": contact_id}
    # Salt namespaces the token so it can't be used elsewhere
    return serializer.dumps(payload, salt='reschedule-salt')

def verify_reschedule_token(token: str, max_age: int = 86400): 
    # 86400 seconds = exactly 24 hours
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    try:
        payload = serializer.loads(token, salt='reschedule-salt', max_age=max_age)
        return payload
    except Exception:
        return None
