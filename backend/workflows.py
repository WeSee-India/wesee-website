from database import SessionLocal
from models import Workflow
def get_campaign_steps(campaign_name: str):
    """Fetches the workflow steps directly from the database."""
    db = SessionLocal()
    try:
        workflow = db.query(Workflow).filter(Workflow.name == campaign_name, Workflow.is_active == True).first()
        if not workflow:
            return []
        #list of dictionaries to maintain compatibility with celery_worker
        return [
            {
                "type": step.action_type,
                "template_name": step.template_name,
                "message_template": step.message_template,
                "subject": step.subject_template,
                "delay_seconds": step.delay_seconds
            }
            for step in workflow.steps
        ]
    finally:
        db.close()
