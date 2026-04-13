import logging
import datetime
from fastapi import FastAPI, Depends, Request, Query, HTTPException, status
from fastapi.responses import PlainTextResponse, Response, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from database import engine, get_db
from models import Contact, Activity, Pipeline, DealStage, Deal
from schemas import WebLead, MetaWebhook, WhatsAppWebhook, GoogleWebhook, LeadFilterRequest, BulkEmailRequest
from utils import normalize_phone, handle_duplicate_prevention, verify_unsubscribe_token, verify_click_token
from config import settings
from celery_worker import send_initial_outreach, send_bulk_email_task
from communications import send_email_outbound
from models import User
from dependencies import get_current_user
from services import update_lead_score, get_next_sales_rep, move_deal
from sqlalchemy import func
from routers import google_auth, meetings, ai_agent, auth, admin
from utils.logger import setup_logging, logger

from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from utils.security_limiter import limiter

# 1. Initialize Enterprise Logging
setup_logging()

META_VERIFY_TOKEN = settings.META_VERIFY_TOKEN

tags_metadata = [
    {"name": "Webhooks", "description": "Endpoints for lead ingestion from Meta, WhatsApp, and Google Ads."},
    {"name": "AI Agent", "description": "Core generative intelligence for sales chat and marketing content."},
    {"name": "Meetings", "description": "Calendar integration and appointment scheduling logic."},
    {"name": "Leads", "description": "CRM operations, dynamic segmentation, and contact management."},
]

app = FastAPI(
    title="WeSee AI Automation Platform",
    description="""
    ## The Prime Capstone Architecture
    WeSee is an enterprise-grade AI engine designed to automate the high-bandwidth sales and marketing operations.
    
    ### Core Capabilities:
    * **Agentic State Machines**: Reasoning-aware chat powered by LangGraph.
    * **Multi-Tenant Isolation**: Secure, isolated data structures for global scalability.
    * **Hybrid Engagement**: Seamless integration between Meta/WhatsApp webhooks and AI agents.
    """,
    version="1.0.0",
    openapi_tags=tags_metadata
)

# Add CORS Middleware with explicit whitelist
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wire up the rate limit handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(google_auth.router)
app.include_router(meetings.router)
app.include_router(ai_agent.router)
app.include_router(auth.router)
app.include_router(admin.router)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/")
def dashboard(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="index.html", 
        context={}
    )

@app.get("/api/test/leads", tags=["Leads"])
def get_test_leads_for_dashboard(db: Session = Depends(get_db)):
    """Unauthenticated quick fetch for the Glass Box Dashboard"""
    logger.info("Test lead fetch triggered from dashboard.")
    return db.query(Contact).order_by(Contact.created_at.desc()).limit(20).all()

@app.get("/api/webhooks/meta", response_class=PlainTextResponse, tags=["Webhooks"])
def verify_meta_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
):
    if hub_mode == "subscribe" and hub_verify_token == META_VERIFY_TOKEN:
        logger.info("Meta Webhook verified successfully.")
        return hub_challenge
    raise HTTPException(status_code=403, detail="Invalid verification token")

@app.get("/api/webhooks/whatsapp", response_class=PlainTextResponse, tags=["Webhooks"])
def verify_whatsapp_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
):
    if hub_mode == "subscribe" and hub_verify_token == META_VERIFY_TOKEN:
        logger.info("WhatsApp Webhook verified successfully.")
        return hub_challenge
    raise HTTPException(status_code=403, detail="Invalid verification token")

@app.post("/api/leads/web", tags=["Leads"])
def create_web_lead(lead: WebLead, db: Session = Depends(get_db)):
    phone = normalize_phone(lead.phone)
    existing = handle_duplicate_prevention(db, lead.email, phone, lead.client_id)
    
    if existing:
        existing.last_active = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        logger.info(f"Existing web lead updated: {existing.id}")
        return {"message": "Existing lead updated"}

    # Determine final source: if QR code 'source' is passed, prioritize it, otherwise use utm_source
    final_source = lead.source if lead.source else lead.utm_source

    owner_id = get_next_sales_rep(db, lead.client_id)
    new_contact = Contact(
        client_id=lead.client_id,
        owner_id=owner_id,
        first_name=lead.first_name,
        email=lead.email,
        phone=phone,
        utm_source=final_source,
        utm_campaign=lead.utm_campaign,
        custom_fields=lead.custom_fields
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    send_initial_outreach.delay(new_contact.id)
    logger.info("New web lead created", extra={"client_id": lead.client_id, "source": final_source})
    return {"message": "New lead created"}

@app.post("/api/webhooks/meta", tags=["Webhooks"])
@limiter.limit("100/minute")
def meta_webhook(request: Request, payload: MetaWebhook, db: Session = Depends(get_db)):
    phone = normalize_phone(payload.phone)
    existing = handle_duplicate_prevention(db, payload.email, phone, payload.client_id)
    
    if existing:
        logger.info(f"Duplicate meta lead ignored: {payload.email} for client {payload.client_id}")
        return {"message": "Duplicate meta lead ignored/updated"}
        
    owner_id = get_next_sales_rep(db, payload.client_id)
    new_contact = Contact(
        client_id=payload.client_id, 
        owner_id=owner_id,
        first_name=payload.first_name, 
        email=payload.email, 
        phone=phone, 
        utm_campaign=payload.campaign_name
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    send_initial_outreach.delay(new_contact.id)
    logger.info("Meta lead created", extra={"email": payload.email, "client_id": payload.client_id})
    return {"message": "Meta lead created"}

@app.post("/api/webhooks/google", tags=["Webhooks"])
@limiter.limit("100/minute")
def google_webhook(request: Request, payload: GoogleWebhook, client_id: int, db: Session = Depends(get_db)):
    extracted_data = {column.column_name.lower(): column.string_value for column in payload.user_column_data}
    
    # Fuzzy extraction: look for common Google field names
    phone_raw = next((v for k, v in extracted_data.items() if 'phone' in k), None)
    email = next((v for k, v in extracted_data.items() if 'email' in k), None)
    first_name = next((v for k, v in extracted_data.items() if 'name' in k), "Unknown")

    phone = normalize_phone(phone_raw)

    # CRITICAL: If we couldn't extract an email OR a phone, don't even check for duplicates
    # This prevents matching existing 'Null' records in the DB
    if not email and not phone:
        logger.error(f"Google Webhook failed to extract identifiers for client {client_id}")
        return {"message": "Incomplete lead data", "status": "error"}

    existing = handle_duplicate_prevention(db, email, phone, client_id)
    if existing:
        existing.last_active = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        logger.info(f"Duplicate Google lead updated for {email or phone}")
        return {"message": "Duplicate Google lead updated"}
        
    owner_id = get_next_sales_rep(db, client_id)
    new_contact = Contact(
        client_id=client_id, 
        owner_id=owner_id,
        first_name=first_name, 
        email=email, 
        phone=phone, 
        utm_source="google_ads",
        utm_campaign=payload.campaign_id
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    send_initial_outreach.delay(new_contact.id)
    logger.info("Google lead created", extra={"email": email or phone, "client_id": client_id})
    return {"message": "Google lead created"}

@app.post("/api/webhooks/whatsapp", tags=["Webhooks"])
@limiter.limit("100/minute")
def whatsapp_webhook(request: Request, payload: WhatsAppWebhook, db: Session = Depends(get_db)):
    phone = normalize_phone(payload.phone)
    existing = handle_duplicate_prevention(db, None, phone, payload.client_id)
    
    if not existing:
        owner_id = get_next_sales_rep(db, payload.client_id)
        new_contact = Contact(client_id=payload.client_id, owner_id=owner_id, phone=phone)
        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)
        send_initial_outreach.delay(new_contact.id)
        logger.info(f"New WhatsApp lead created: {phone} for client {payload.client_id}")
    else:
        logger.info(f"WhatsApp lead already exists: {phone} for client {payload.client_id}")
    
    return {"message": "WhatsApp processed"}

@app.post("/api/webhooks/incoming_msg", tags=["Webhooks"])
@limiter.limit("100/minute")
def incoming_msg_webhook(request: Request, payload: WhatsAppWebhook, db: Session = Depends(get_db)):
    phone = normalize_phone(payload.phone)
    contact = db.query(Contact).filter(Contact.phone == phone, Contact.client_id == payload.client_id).first()

    if contact:
        contact.status = 'replied'
        db.commit()
        logger.info(f"Lead status updated to replied: {phone} for client {payload.client_id}")

        # --- SALES REP NOTIFICATION ---
        # Alert the assigned rep that a lead has engaged and the bot is disabled
        admin_email = "admin@weseegpt.com" # In production, this would be lead.owner.email
        alert_subject = f"🚨 Hot Lead Reply: {contact.first_name}"
        alert_body = f"""
        <h3>Hot Lead Alert</h3>
        <p><b>{contact.first_name}</b> just replied to the automated sequence on WhatsApp.</p>
        <p><b>Message:</b> <i>"{payload.message_body}"</i></p>
        <p>The automation Kill Switch has been engaged. Log into the CRM to take over the conversation.</p>
        """
        # Fire internal alert (pass empty dict for lead_data since it's an internal admin email)
        send_email_outbound(admin_email, alert_subject, alert_body, {})
        
        # Update Lead Score for Replied event
        update_lead_score(db, contact.id, "replied")
        
        # Auto-Stage Transition
        deal = db.query(Deal).filter(Deal.contact_id == contact.id).first()
        if deal:
            # Move to stage 2 (Discovery Call)
            move_deal(db, deal.id, 2)


    return {"status": "replied"}

@app.get("/api/track/click/{token}")
def track_link_click(token: str, db: Session = Depends(get_db)):
    data = verify_click_token(token)
    if not data:
        raise HTTPException(status_code=400, detail="Invalid or expired link.")

    contact_id = data.get("c")
    target_url = data.get("u")

    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if contact:
        activity = Activity(
            contact_id=contact.id, 
            activity_type="link_clicked", 
            notes=f"Clicked URL: {target_url}"
        )
        db.add(activity)
        db.commit()
        
        # Update Lead Score for Link Clicked event
        update_lead_score(db, contact.id, "link_clicked")

    # Bounce the user to their actual destination seamlessly
    return RedirectResponse(url=target_url)

@app.get("/api/track/open/{contact_id}")
def track_email_open(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if contact:
        # Log the open event in the CRM Activity ledger
        activity = Activity(
            contact_id=contact.id, 
            activity_type="email_opened", 
            notes="Lead opened an outbound email."
        )
        db.add(activity)
        db.commit()
        
        # Update Lead Score for Email Opened event
        update_lead_score(db, contact.id, "email_opened")

    # Return a 1x1 transparent GIF pixel
    pixel = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
    return Response(content=pixel, media_type="image/gif")

@app.get("/api/unsubscribe/{token}")
def unsubscribe(token: str, db: Session = Depends(get_db)):
    contact_id = verify_unsubscribe_token(token)
    if not contact_id:
        raise HTTPException(status_code=400, detail="Invalid or expired unsubscribe link.")
        
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if contact:
        contact.is_subscribed = False # Trip the Kill Switch!
        
        activity = Activity(
            contact_id=contact.id, 
            activity_type="unsubscribed", 
            notes="Lead clicked the secure unsubscribe link."
        )
        db.add(activity)
        db.commit()
        
        # Update Lead Score for Unsubscribed event
        update_lead_score(db, contact.id, "unsubscribed")
        return PlainTextResponse("You have been successfully unsubscribed. You will no longer receive automated messages.")
    
    raise HTTPException(status_code=404, detail="User not found.")

# --- DAY 4: SECURED ENDPOINTS (RBAC & MULTI-TENANCY) ---
@app.get("/api/contacts", tags=["Leads"])
def get_secure_contacts(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # The Gatekeeper
):
    """
    Fetches contacts while strictly enforcing Tenant Isolation and RBAC.
    """
    # 1. STRICT ISOLATION: Always filter by the user's client_id (Tenant)
    query = db.query(Contact).filter(Contact.client_id == current_user.client_id)
    
    # 2. RBAC VISIBILITY: Sales reps only see leads explicitly assigned to them
    if current_user.role == "sales_rep":
        query = query.filter(Contact.owner_id == current_user.id)
        
    # Admins bypass the owner_id filter and see all leads in the tenant.
    
    contacts = query.order_by(Contact.created_at.desc()).offset(skip).limit(limit).all()
    return contacts

# --- DAY 4: DYNAMIC SEGMENTATION ENGINE ---
@app.post("/api/leads/segment", tags=["Leads"])
def segment_leads(
    payload: LeadFilterRequest,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts a JSON array of filters and dynamically queries the database.
    Strictly protected by Multi-tenant RLS and RBAC.
    """
    # 1. THE BOUNCER: Apply Strict Isolation & RBAC FIRST
    query = db.query(Contact).filter(Contact.client_id == current_user.client_id)
    if current_user.role == "sales_rep":
        query = query.filter(Contact.owner_id == current_user.id)

    # 2. DYNAMIC FILTERS: Map JSON strings to SQLAlchemy operators
    for rule in payload.filters:
        # Safety check: Ensure the requested column actually exists on the Contact model
        if not hasattr(Contact, rule.field):
            continue 
            
        column = getattr(Contact, rule.field)
        
        # Apply the correct operator
        if rule.op == "==":
            query = query.filter(column == rule.value)
        elif rule.op == ">=":
            query = query.filter(column >= rule.value)
        elif rule.op == "<=":
            query = query.filter(column <= rule.value)
        elif rule.op == "in":
            # Expects rule.value to be a list
            query = query.filter(column.in_(rule.value))
        elif rule.op == "ilike":
            # Expects rule.value to be a string
            query = query.filter(column.ilike(f"%{rule.value}%"))

    # Execute the dynamically built query
    contacts = query.order_by(Contact.created_at.desc()).offset(skip).limit(limit).all()
    return contacts

# --- DAY 4: BULK EMAIL ENGINE ---
@app.post("/api/leads/bulk-email", tags=["Leads"])
def bulk_email_dispatch(
    payload: BulkEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts a filter payload and email templates. 
    Securely segments the database and queues Celery tasks for dispatch.
    """
    # 1. RLS and RBAC
    query = db.query(Contact).filter(Contact.client_id == current_user.client_id)
    if current_user.role == "sales_rep":
        query = query.filter(Contact.owner_id == current_user.id)

    # 2. Dynamic Filtering
    for rule in payload.filters:
        if not hasattr(Contact, rule.field):
            continue 
        column = getattr(Contact, rule.field)
        if rule.op == "==":
            query = query.filter(column == rule.value)
        elif rule.op == ">=":
            query = query.filter(column >= rule.value)
        elif rule.op == "<=":
            query = query.filter(column <= rule.value)
        elif rule.op == "in":
            query = query.filter(column.in_(rule.value))
        elif rule.op == "ilike":
            query = query.filter(column.ilike(f"%{rule.value}%"))

    # 3. Compliance Sweep: Only email subscribed leads who actually have an email address
    query = query.filter(Contact.is_subscribed == True, Contact.email != None)
    
    targets = query.all()

    if not targets:
        return {"message": "No valid targets found for these filters.", "count": 0}

    # 4. Celery Fan-Out
    for lead in targets:
        send_bulk_email_task.delay(lead.id, payload.subject_template, payload.content_template)

    return {"message": "Bulk email batch queued successfully.", "count": len(targets)}


# --- DAY 5: KANBAN API ---
@app.get("/api/pipelines/{pipeline_id}/kanban", tags=["Leads"])
def get_kanban_board(
    pipeline_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Fetch stages for this pipeline
    stages = db.query(DealStage).filter(DealStage.pipeline_id == pipeline_id).order_by(DealStage.stage_order).all()
    
    board = []
    for stage in stages:
        # Filter deals by tenant AND (if sales_rep) by owner_id
        deal_query = db.query(Deal).filter(Deal.stage_id == stage.id)
        
        # Apply the Day 4 Security Rules
        if current_user.role == "sales_rep":
            deal_query = deal_query.filter(Deal.owner_id == current_user.id)
            
        stage_data = {
            "id": stage.id,
            "name": stage.name,
            "deals": deal_query.limit(100).all()
        }
        board.append(stage_data)
        
    return board

# --- DAY 5: TIMELINE API ---
@app.get("/api/contacts/{contact_id}/timeline", tags=["Leads"])
def get_contact_timeline(
    contact_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure the contact belongs to the user's tenant (RLS)
    contact = db.query(Contact).filter(
        Contact.id == contact_id, 
        Contact.client_id == current_user.client_id
    ).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    activities = db.query(Activity).filter(Activity.contact_id == contact_id).order_by(Activity.created_at.desc()).all()
    return activities

# --- DAY 5: CAMPAIGN ATTRIBUTION (ROI REPORTING) ---
@app.get("/api/reports/attribution", tags=["Leads"])
def get_campaign_attribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates an ROI report by joining Deals and Contacts.
    Groups the pipeline by the original UTM Source.
    """
    # SQL: SELECT utm_source, COUNT(deals.id) FROM contacts JOIN deals ... GROUP BY utm_source
    results = db.query(
        Contact.utm_source,
        func.count(Deal.id).label("total_deals")
    ).join(Deal, Deal.contact_id == Contact.id)\
     .filter(Contact.client_id == current_user.client_id)\
     .group_by(Contact.utm_source).all()
     
    # Format for the frontend charting library
    return [{"source": r[0] or "organic/direct", "deals": r[1]} for r in results]
