from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import List, Dict
from sqlalchemy.orm import Session
from database import get_db
from models import Contact, Activity, User
from utils.ai_engine import ai_engine
from utils.logger import logger
from utils.security_limiter import limiter

router = APIRouter(prefix="/api/ai", tags=["AI Agent"])

class ChatRequest(BaseModel):
    contact_id: int
    user_id: int
    message: str

class ContentRequest(BaseModel):
    contact_id: int
    user_id: int
    platform: str = "LinkedIn"

class ChatResponse(BaseModel):
    response: str
    reasoning_steps: List[str]

@router.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
def ai_chat(request: Request, payload: ChatRequest, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == payload.contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Lead not found in database.")
        
    logger.info("AI Chat triggered", extra={"user_id": payload.user_id, "contact_id": payload.contact_id})
    
    response_text, reasoning_path = ai_engine.chat_to_book(
        user_id=payload.user_id,
        contact_id=payload.contact_id,
        user_message=payload.message,
        db=db
    )
    return ChatResponse(
        response=response_text,
        reasoning_steps=reasoning_path
    )

@router.post("/generate-content", response_model=ChatResponse)
def create_marketing_content(payload: ContentRequest, db: Session = Depends(get_db)):
    # 1. Fetch user for first-person context
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 2. Fetch contact and safety-limited history (Last 20)
    contact = db.query(Contact).filter(Contact.id == payload.contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    history = db.query(Activity).filter(
        Activity.contact_id == contact.id
    ).order_by(Activity.created_at.desc()).limit(20).all()
    
    logger.info("Content Generation triggered", extra={"user_id": payload.user_id, "contact_id": payload.contact_id, "platform": payload.platform})
    
    # 3. Stringify the history context
    history_text = "\n".join([f"- {h.activity_type}: {h.notes}" for h in history])
    context = f"Contact: {contact.first_name}\nHistory:\n{history_text}"
    
    # 4. Invoke Engine
    generated_post = ai_engine.generate_content(
        context_text=context,
        user_name=user.first_name,
        target_platform=payload.platform
    )
    
    return ChatResponse(response=generated_post)
