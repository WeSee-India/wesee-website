from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from models import Client, User
from schemas import CompanySignup, ForgotPassword, ResetPassword
from auth import get_password_hash, verify_password, create_access_token
from config import settings
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from utils.logger import logger
from utils.security_limiter import limiter
from fastapi.security import OAuth2PasswordRequestForm
from communications import send_email_outbound
from dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# Initialize itsdangerous serializer
serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
PASSWORD_RESET_SALT = "password-reset-salt"

@router.post("/login")
@limiter.limit("5/minute")
def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2 specifies 'username', but we map it to our 'email' field
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Embed the multi-tenant context directly into the JWT payload
    access_token = create_access_token(
        data={
            "sub": str(user.id), 
            "client_id": user.client_id, 
            "role": user.role
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Action 2: Current User Endpoint
    Returns the authenticated user's details.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "role": current_user.role,
        "client_id": current_user.client_id
    }

@router.post("/signup", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def signup(request: Request, payload: CompanySignup, db: Session = Depends(get_db)):
    """
    Action 1: Company Signup
    Creates a new Client and an Admin User in a single transaction.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == payload.admin_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    try:
        # Create Client
        new_client = Client(name=payload.company_name)
        db.add(new_client)
        db.flush() # Get the client.id without committing yet

        # Create Admin User
        hashed_pwd = get_password_hash(payload.password)
        new_user = User(
            client_id=new_client.id,
            email=payload.admin_email,
            hashed_password=hashed_pwd,
            role="admin",
            is_active=True
        )
        db.add(new_user)
        
        # Commit both in one shot
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"New company signed up: {payload.company_name} (Admin: {payload.admin_email})")
        return {"message": "Company and admin account created successfully.", "client_id": new_client.id}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Signup failed for {payload.admin_email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during signup."
        )

@router.post("/forgot-password")
def forgot_password(payload: ForgotPassword, db: Session = Depends(get_db)):
    """
    Action 3: Password Reset Logic (Part 1)
    Generates a secure token and mocks email dispatch.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    
    if user:
        token = serializer.dumps(user.email, salt=PASSWORD_RESET_SALT)
        reset_link = f"{settings.BASE_URL}/reset-password?token={token}"
        
        # PRODUCTION EMAIL DISPATCH
        subject = "Password Reset Request"
        body = f"""
        <h3>Password Reset Request</h3>
        <p>A password reset was requested for your WeSee account.</p>
        <p>Click the link below to set a new password. This link will expire in 1 hour.</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>If you did not request this, please ignore this email.</p>
        """
        # Fire production-grade email (empty lead_data for account management)
        send_email_outbound(user.email, subject, body, {})
        
    return {"message": "If this email is registered, a reset link has been sent."}

@router.post("/reset-password")
def reset_password(payload: ResetPassword, db: Session = Depends(get_db)):
    """
    Action 3: Password Reset Logic (Part 2)
    Validates the token and updates the password.
    """
    try:
        # Token valid for 1 hour (3600 seconds)
        email = serializer.loads(
            payload.token, 
            salt=PASSWORD_RESET_SALT, 
            max_age=3600
        )
    except SignatureExpired:
        raise HTTPException(status_code=400, detail="Token has expired.")
    except BadSignature:
        raise HTTPException(status_code=400, detail="Invalid token.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    
    logger.info(f"Password successfully reset for user: {email}")
    return {"message": "Password has been reset successfully."}
