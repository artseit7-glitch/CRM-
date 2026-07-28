from django.db.models.signals import pre_save
from django.dispatch import receiver

from apps.common.tasks import send_notification_email

from .models import Deal


@receiver(pre_save, sender=Deal)
def notify_on_stage_change(sender, instance: Deal, **kwargs):
    if not instance.pk:
        return
    try:
        previous = Deal.objects.get(pk=instance.pk)
    except Deal.DoesNotExist:
        return
    if previous.stage == instance.stage:
        return
    send_notification_email.delay(
        subject=f'Deal "{instance.title}" moved to {instance.get_stage_display()}',
        message=(
            f'Deal "{instance.title}" changed stage from '
            f"{previous.get_stage_display()} to {instance.get_stage_display()}."
        ),
        recipient_email=instance.owner.email,
    )
