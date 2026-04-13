from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate
from dependencies import require_admin
from auth import get_password_hash
from utils.logger import logger

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_internal_user(
    payload: UserCreate, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Action 2: Internal User Management
    Allows admins to create new users within their own client/tenant.
    Automatically injects the requester's client_id to prevent cross-tenant creation.
    """
    # Check if email already exists
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    # SECURE INJECTION: Forced client_id from the authenticated admin
    new_user = User(
        client_id=current_admin.client_id,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        first_name=payload.first_name,
        role=payload.role,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(
        f"Admin {current_admin.email} created new user: {payload.email} "
        f"for Client ID: {current_admin.client_id}"
    )
    
    return {
        "message": "User created successfully", 
        "user_id": new_user.id,
        "client_id": new_user.client_id
    }

@router.get("/users")
def list_team_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Utility: List all users in the admin's tenant.
    """
    users = db.query(User).filter(User.client_id == current_admin.client_id).all()
    return users
