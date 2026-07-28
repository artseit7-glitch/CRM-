from django.conf import settings
from django.db import models

from apps.companies.models import Company
from apps.contacts.models import Contact


class Deal(models.Model):
    class Stage(models.TextChoices):
        NEW = "new", "New"
        QUALIFICATION = "qualification", "Qualification"
        PROPOSAL = "proposal", "Proposal"
        NEGOTIATION = "negotiation", "Negotiation"
        WON = "won", "Closed — Won"
        LOST = "lost", "Closed — Lost"

    title = models.CharField(max_length=255)
    contact = models.ForeignKey(
        Contact, on_delete=models.SET_NULL, null=True, blank=True, related_name="deals"
    )
    company = models.ForeignKey(
        Company, on_delete=models.SET_NULL, null=True, blank=True, related_name="deals"
    )
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    stage = models.CharField(max_length=20, choices=Stage.choices, default=Stage.NEW)
    probability = models.PositiveSmallIntegerField(default=20)
    expected_close_date = models.DateField(null=True, blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="deals"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
