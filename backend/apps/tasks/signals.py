from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.common.tasks import send_notification_email

from .models import Task


@receiver(post_save, sender=Task)
def notify_on_task_created(sender, instance: Task, created, **kwargs):
    if not created:
        return
    send_notification_email.delay(
        subject=f'New task assigned: "{instance.title}"',
        message=f'You have been assigned task "{instance.title}", due {instance.due_date:%Y-%m-%d %H:%M}.',
        recipient_email=instance.assignee.email,
    )
