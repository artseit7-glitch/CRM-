from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from apps.common.tasks import send_notification_email

from .models import Task


@shared_task
def send_due_task_reminders():
    """Runs periodically (see config/settings.py CELERY_BEAT_SCHEDULE below via
    apps/tasks/apps.py); emails assignees for open tasks due within the next hour
    that haven't been reminded about yet."""
    soon = timezone.now() + timedelta(hours=1)
    due_soon = Task.objects.filter(
        status=Task.Status.OPEN, reminder_sent=False, due_date__lte=soon
    ).select_related("assignee")
    for task in due_soon:
        send_notification_email.delay(
            subject=f'Reminder: task "{task.title}" is due soon',
            message=f'Task "{task.title}" is due at {task.due_date:%Y-%m-%d %H:%M}.',
            recipient_email=task.assignee.email,
        )
    due_soon.update(reminder_sent=True)
