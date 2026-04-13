# seed_workflows.py
from database import SessionLocal
from models import Workflow, WorkflowStep

def seed_campaign(db, name, description, steps_data):
    """Helper function to cleanly insert workflows and their steps."""
    existing_wf = db.query(Workflow).filter(Workflow.name == name).first()
    if not existing_wf:
        wf = Workflow(name=name, description=description)
        db.add(wf)
        db.commit()
        db.refresh(wf)
        
        steps = [
            WorkflowStep(
                workflow_id=wf.id,
                step_order=idx,
                action_type=step["action_type"],
                template_name=step.get("template_name"),
                subject_template=step.get("subject_template"),
                message_template=step.get("message_template"),
                delay_seconds=step.get("delay_seconds", 0)
            ) for idx, step in enumerate(steps_data)
        ]
        db.add_all(steps)
        db.commit()
        print(f"Successfully seeded '{name}' workflow.")
    else:
        print(f"Workflow '{name}' already exists.")

def seed():
    db = SessionLocal()
    try:
        seed_campaign(db, "default_web_nurture", "Default Web Lead Nurture", [
            {"action_type": "whatsapp_template", "template_name": "hello_world", "delay_seconds": 0},
            {"action_type": "whatsapp_text", "message_template": "Hey {{ first_name }}, just checking in! Did you get a chance to look at our WeSee offering?", "delay_seconds": 60},
            {"action_type": "email", "subject_template": "Quick question for you, {{ first_name }}", "message_template": "Hi {{ first_name }},<br><br>Just wanted to float this to the top of your inbox. Let me know if you want to chat!<br><br>- WeSee", "delay_seconds": 60}
        ])

        seed_campaign(db, "b2b_cold_intro", "Aggressive B2B Cold Outreach", [
            {"action_type": "whatsapp_template", "template_name": "b2b_cold_intro", "delay_seconds": 0},
            {"action_type": "email", "subject_template": "Ideas for {{ company }}'s automation setup, {{ first_name }}", "message_template": "Hi {{ first_name }},<br><br>I reached out on WhatsApp earlier, but wanted to drop a quick note here. At WeSee, we've noticed that leaders in your space often struggle with lead drop-off.<br><br>I put together a quick 2-minute loom video showing how our Day 2 architecture could integrate directly into {{ company }}'s current stack.<br><br>Worth a watch?<br><br>Best,<br>WeSee", "delay_seconds": 7200}
        ])

        seed_campaign(db, "inbound_lead_magnet", "Fast delivery and WA follow-up", [
            {"action_type": "email", "subject_template": "Here is your WeSee AI guide, {{ first_name }}!", "message_template": "Hey {{ first_name }},<br><br>As promised, here is your link to the Automation Architecture brief: [Link]<br><br>Pay special attention to page 3—it outlines the exact Celery worker logic we use.<br><br>Let me know what you think!<br>- WeSee", "delay_seconds": 0},
            {"action_type": "whatsapp_text", "message_template": "Hey {{ first_name }}, just making sure the PDF came through to your email alright? Sometimes it gets caught in spam. Let me know if you have any questions on that Celery worker setup!", "delay_seconds": 3600}
        ])

        seed_campaign(db, "breakup_reengagement", "Breakup / Loss Aversion", [
            {"action_type": "email", "subject_template": "Closing your file, {{ first_name }}?", "message_template": "Hi {{ first_name }},<br><br>I haven't heard back from you, so I'm assuming improving {{ company }}'s automation isn't a priority right now.<br><br>I'll stop reaching out, but if things change, you know where to find me.<br><br>Thanks,<br>WeSee", "delay_seconds": 0},
            {"action_type": "whatsapp_text", "message_template": "Hey {{ first_name }}, closing out my pipeline for the month and crossing you off the list. Feel free to text me back here if you ever want to revive the automation project. Take care!", "delay_seconds": 86400}
        ])

    finally:
        db.close()

if __name__ == "__main__":
    seed()
