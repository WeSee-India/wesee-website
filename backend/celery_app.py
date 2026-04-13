from celery import Celery
from celery.schedules import crontab
from config import settings


# Initialize Celery using our centralized Redis URL from settings
celery_app = Celery(
    "wesee_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata", # Set to Asia/Kolkata to match existing worker config
    enable_utc=True,
)

celery_app.conf.beat_schedule = {
    "check-no-shows-hourly": {
        "task": "tasks.check_for_no_shows",
        "schedule": crontab(minute=0), # Runs at the top of every hour
    },
    "run-daily-nurture-sweep-at-6pm": {
        "task": "celery_worker.sweep_cold_leads",
        "schedule": crontab(hour=18, minute=0), 
    },
    "run-daily-reengagement-sweep-at-6pm": {
        "task": "celery_worker.sweep_stale_leads",
        "schedule": crontab(hour=18, minute=15),
    },
}

celery_app.autodiscover_tasks(['tasks', 'celery_worker'])

