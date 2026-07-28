from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.companies.models import Company
from apps.contacts.models import Contact
from apps.deals.models import Deal
from apps.tasks.models import Task


class Command(BaseCommand):
    help = "Creates demo admin/manager users and sample contacts/deals/tasks for local development."

    def handle(self, *args, **options):
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={"email": "admin@example.com", "role": User.Role.ADMIN, "is_staff": True, "is_superuser": True},
        )
        if created:
            admin.set_password("admin12345")
            admin.save()
            self.stdout.write("Created admin / admin12345")

        manager, created = User.objects.get_or_create(
            username="manager1",
            defaults={"email": "manager1@example.com", "role": User.Role.MANAGER},
        )
        if created:
            manager.set_password("manager12345")
            manager.save()
            self.stdout.write("Created manager1 / manager12345")

        if not Company.objects.exists():
            acme = Company.objects.create(name="Acme LLC", industry="Manufacturing", owner=manager)
            beta = Company.objects.create(name="Beta Inc", industry="Software", owner=manager)

            ivan = Contact.objects.create(
                first_name="Ivan", last_name="Petrov", email="ivan@acme.com",
                company=acme, owner=manager,
            )
            maria = Contact.objects.create(
                first_name="Maria", last_name="Sidorova", email="maria@beta.com",
                company=beta, owner=manager,
            )

            deal1 = Deal.objects.create(
                title="Acme Q3 renewal", contact=ivan, company=acme,
                amount=15000, stage=Deal.Stage.PROPOSAL, owner=manager,
                expected_close_date=timezone.now().date() + timedelta(days=14),
            )
            Deal.objects.create(
                title="Beta onboarding", contact=maria, company=beta,
                amount=8000, stage=Deal.Stage.NEW, owner=manager,
                expected_close_date=timezone.now().date() + timedelta(days=30),
            )

            Task.objects.create(
                title="Follow up on proposal", due_date=timezone.now() + timedelta(days=2),
                deal=deal1, assignee=manager,
            )
            self.stdout.write(self.style.SUCCESS("Seeded demo companies, contacts, deals, and tasks."))
        else:
            self.stdout.write("Demo data already present, skipping.")
