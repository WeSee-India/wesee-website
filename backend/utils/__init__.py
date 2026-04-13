import phonenumbers
from itsdangerous import URLSafeTimedSerializer
from config import settings
from models import Contact

def normalize_phone(phone_str: str, region: str = "IN") -> str:
    if not phone_str:
        return None
    try:
        parsed = phonenumbers.parse(phone_str, region)
        if phonenumbers.is_valid_number(parsed):
            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        # If not "valid" by library standards but has a +, keep it as-is for tests/manual entry
        if phone_str.startswith("+"):
            return phone_str
        return None
    except:
        if phone_str and phone_str.startswith("+"):
            return phone_str
        return None

def handle_duplicate_prevention(db, email: str, phone: str, client_id: int):
    if not email and not phone:
        return None
    query = db.query(Contact).filter(Contact.client_id == client_id)
    if email and phone:
        query = query.filter((Contact.email == email) | (Contact.phone == phone))
    elif email:
        query = query.filter(Contact.email == email)
    elif phone:
        query = query.filter(Contact.phone == phone)
    return query.first()

def generate_unsubscribe_token(contact_id: int):
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    return serializer.dumps(contact_id, salt='unsubscribe')
def verify_unsubscribe_token(token: str, max_age=2592000): # 30 days validity
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    try:
        contact_id = serializer.loads(token, salt='unsubscribe', max_age=max_age)
        return contact_id
    except:
        return None

def generate_click_token(contact_id: int, url: str):
    """Encodes the contact ID and target URL into a secure string."""
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    # Pack as a small dictionary to save token length
    return serializer.dumps({"c": contact_id, "u": url}, salt='click-track')

def verify_click_token(token: str):
    """Decodes the secure string back into the contact ID and target URL."""
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    try:
        # Links shouldn't expire too quickly, allow 30 days
        return serializer.loads(token, salt='click-track', max_age=2592000)
    except:
        return None
