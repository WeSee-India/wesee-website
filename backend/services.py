import redis
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models import Deal, Activity, Contact, User
from config import settings

# Initialize Redis client (we reuse the URL from Celery)
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

def get_next_sales_rep(db: Session, client_id: int) -> int:
    """
    Round-robin distributor using Redis LPOP/RPUSH.
    Active-user verification check to prevent routing to inactive reps.
    Fallback to a tenant Admin if the queue is empty or all reps are inactive.
    """
    queue_key = f"tenant:{client_id}:rep_queue"
    
    while True:
        # next rep from the front of the line
        rep_id = redis_client.lpop(queue_key)
        
        if not rep_id:
            break # Queue is empty, exit loop and fallback to admin
            
        # user actually exists and is active
        rep = db.query(User).filter(User.id == int(rep_id), User.is_active == True).first()
        
        if rep:
            # push back to the end of the line and return
            redis_client.rpush(queue_key, rep_id)
            return rep.id
        
        # If rep is inactive/deleted, the loop continues and pops the next person.

    # ADMIN FALLBACK: If queue is empty or no valid reps found
    admin = db.query(User).filter(
        User.client_id == client_id, 
        User.role == "admin",
        User.is_active == True
    ).first()
    
    return admin.id if admin else None

SCORE_WEIGHTS = {
    "email_opened": 10,
    "link_clicked": 20,
    "replied": 40,
    "booked": 60,
    "unsubscribed": -100,
    "no_show": -50,
    "email_bounce": -30,
    "stale": -20
}

def update_lead_score(db: Session, contact_id: int, event_type: str):
    """
    Updates lead score using Row-Level Locking (with_for_update) to prevent 
    race conditions from concurrent Celery tasks.
    """
    # Use with_for_update() to lock the row until this transaction commits!
    contact = db.query(Contact).filter(Contact.id == contact_id).with_for_update().first()
    if not contact:
        return None
        
    old_score = contact.lead_score or 0
    points = SCORE_WEIGHTS.get(event_type, 0)
    new_score = old_score + points
    
    if event_type not in ["unsubscribed", "email_bounce"] and new_score < 0:
        new_score = 0
        
    # Update the contact
    contact.lead_score = new_score
    contact.last_active = datetime.now(timezone.utc)
    
    # Check for Threshold Transitions
    old_label = "Hot" if old_score >= 60 else ("Warm" if old_score >= 20 else "Cold")
    new_label = "Hot" if new_score >= 60 else ("Warm" if new_score >= 20 else "Cold")
    
    if old_label != new_label:
        transition_log = Activity(
            contact_id=contact.id,
            activity_type="threshold_transition",
            notes=f"Lead temperature changed from {old_label} to {new_label}",
            data={"old_score": old_score, "new_score": new_score, "direction": "up" if new_score > old_score else "down"}
        )
        db.add(transition_log)
        
    db.commit()
    return contact

def move_deal(db: Session, deal_id: int, new_stage_id: int, user_id: int = None):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        return None
    
    old_stage_id = deal.stage_id
    deal.stage_id = new_stage_id
    
    log = Activity(
        contact_id=deal.contact_id,
        activity_type="stage_change",
        notes=f"Moved from stage {old_stage_id} to {new_stage_id}",
        data={"old": old_stage_id, "new": new_stage_id, "moved_by": user_id}
    )
    db.add(log)
    db.commit()
    return deal
