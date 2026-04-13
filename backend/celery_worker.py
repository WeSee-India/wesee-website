from datetime import datetime, timedelta, timezone
from celery import Celery
from celery.schedules import crontab
from celery.exceptions import MaxRetriesExceededError
from config import settings
from database import get_task_db
from models import Contact, Activity
from communications import send_whatsapp_template, send_whatsapp_message, send_email_outbound
from workflows import get_campaign_steps
from services import update_lead_score
import logging
from celery_app import celery_app
import tasks

logger = logging.getLogger(__name__)


celery_app.conf.timezone = 'Asia/Kolkata'
# bind=True gives us access to self.retry
@celery_app.task(bind=True, max_retries=4, default_retry_delay=60)
def execute_workflow_step(self, lead_id: int, campaign_id: str, step_index: int):
    """Universal interpreter with retries, CRM logging, and compliance checks."""
    with get_task_db() as db:
        lead = db.query(Contact).filter(Contact.id == lead_id).first()
        if not lead:
            logger.warning(f"Workflow Error: Lead {lead_id} not found.")
            return
        if not lead.is_subscribed:
            logger.info(f"Compliance Drop: Aborting {campaign_id} for Lead {lead_id} (Unsubscribed)")
            return
        if lead.status in ['replied', 'booked']:
            logger.info(f"Kill Switch: Aborting {campaign_id} at step {step_index + 1} for Lead {lead_id} (Engaged)")
            return
        campaign_steps = get_campaign_steps(campaign_id)
        if step_index >= len(campaign_steps):
            logger.info(f"Workflow {campaign_id} completed for Lead {lead_id}")
            return
        current_step = campaign_steps[step_index]
        lead_data = {
            "id": lead.id,
            "first_name": lead.first_name, 
            "email": lead.email,
            **(lead.custom_fields or {})
        }
        action_logged = False
        notes = ""
        try:
            if current_step["type"] == "whatsapp_template":
                if lead.phone:
                    if send_whatsapp_template(lead.phone, current_step["template_name"]):
                        action_logged = True
                        notes = f"System sent WhatsApp Template: '{current_step['template_name']}'"
                else:
                    logger.info(f"Skipping Step {step_index + 1} (WhatsApp) for Lead {lead_id}: No phone.")
                    
            elif current_step["type"] == "whatsapp_text":
                if lead.phone:
                    if send_whatsapp_message(lead.phone, current_step["message_template"], lead_data):
                        action_logged = True
                        notes = f"System sent WhatsApp Text: '{current_step['message_template'][:40]}...'"
                else:
                    logger.info(f"Skipping Step {step_index + 1} (WhatsApp Text) for Lead {lead_id}: No phone.")
                    
            elif current_step["type"] == "email":
                if lead.email:
                    if send_email_outbound(lead.email, current_step["subject"], current_step["message_template"], lead_data):
                        action_logged = True
                        notes = f"System sent Email. Subject: '{current_step['subject']}'"
                else:
                    logger.info(f"Skipping Step {step_index + 1} (Email) for Lead {lead_id}: No email.")

            if action_logged:
                new_activity = Activity(
                    contact_id=lead.id,
                    activity_type="outbound_message",
                    notes=notes
                )
                db.add(new_activity)
        except Exception as e:
            logger.error(f"API Dispatch Error for Lead {lead_id}: {e}")
            try:
                # Exponential Backoff Retry: 60s, 120s, 240s
                retry_delay = 60 * (2 ** self.request.retries)
                logger.info(f"Retrying step in {retry_delay} seconds...")
                raise self.retry(exc=e, countdown=retry_delay)
            except MaxRetriesExceededError:
                logger.error(f"FATAL: Max retries exceeded for Lead {lead_id}")
                # Log the permanent failure in the CRM
                failed_activity = Activity(
                    contact_id=lead_id,
                    activity_type="system_error",
                    notes=f"FAILED to send step {step_index + 1} of '{campaign_id}' after {self.max_retries} attempts. Error: {e}"
                )
                db.add(failed_activity)
        # --- SCHEDULE NEXT STEP ---
        next_step_index = step_index + 1
        if next_step_index < len(campaign_steps):
            next_delay = campaign_steps[next_step_index].get("delay_seconds", 86400)
            execute_workflow_step.apply_async((lead_id, campaign_id, next_step_index), countdown=next_delay)
# Keep backward compatibility
@celery_app.task
def send_initial_outreach(lead_id: int):
    execute_workflow_step.delay(lead_id, "default_web_nurture", 0)
@celery_app.task
def sweep_cold_leads():
    """Finds leads created >30 days ago that are still 'new' and drops them into a nurture sequence."""
    with get_task_db() as db:
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        # ORM Query: status='new' AND created_at <= today - 30 days
        cold_leads = db.query(Contact).filter(
            Contact.status == 'new',
            Contact.is_subscribed == True,
            Contact.created_at <= thirty_days_ago
        ).all()
        for lead in cold_leads:
            # Drop them into the default nurture (or a specific long-term campaign)
            execute_workflow_step.delay(lead.id, "default_web_nurture", 0)
            # Update status so we don't sweep them again tomorrow
            lead.status = 'nurturing'
        logger.info(f"Evening Sweep: Moved {len(cold_leads)} cold leads into nurture sequences.")
@celery_app.task
def sweep_stale_leads():
    """Finds leads inactive for >30 days and triggers the 'We Miss You' re-engagement campaign."""
    with get_task_db() as db:
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        # ORM Query: last_active <= today - 30 days
        stale_leads = db.query(Contact).filter(
            Contact.last_active <= thirty_days_ago,
            Contact.is_subscribed == True,
            Contact.status.notin_(['replied', 'booked', 'nurturing']) # Don't bother currently active/engaged leads
        ).all()
        for lead in stale_leads:
            # 1. Trigger the breakup campaign
            execute_workflow_step.delay(lead.id, "breakup_reengagement", 0)

            # 2. TRIGGER THE BRAIN: Apply the stale penalty (-20 points)
            # This will also auto-log a timeline event if they drop from Warm to Cold
            update_lead_score(db, lead.id, "stale")

            # 3. Reset the clock
            lead.last_active = datetime.now(timezone.utc)
        logger.info(f"Evening Sweep: Triggered re-engagement for {len(stale_leads)} stale leads.")
@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_bulk_email_task(self, lead_id: int, subject_template: str, content_template: str):
    """Executes a single email send from a bulk batch with retry logic."""
    with get_task_db() as db:
        lead = db.query(Contact).filter(Contact.id == lead_id).first()
        # Compliance & Safety checks
        if not lead or not lead.email or not lead.is_subscribed:
            return
        lead_data = {
            "id": lead.id,
            "first_name": lead.first_name,
            "email": lead.email,
            **(lead.custom_fields or {})
        }
        # Dispatch the email using our existing outbound engine (which injects tracking pixels)
        if send_email_outbound(lead.email, subject_template, content_template, lead_data):
            # Log the successful dispatch in the CRM
            activity = Activity(
                contact_id=lead.id,
                activity_type="bulk_email_sent",
                notes=f"Subject: '{subject_template}'"
            )
            db.add(activity)
