from import_export import fields, resources
from import_export.widgets import ForeignKeyWidget

from apps.companies.models import Company
from apps.contacts.models import Contact
from apps.deals.models import Deal


class OwnerAssigningResource(resources.ModelResource):
    """Stamps the importing user as owner on newly created rows, and
    auto-creates a Company by name if the row references one that doesn't
    exist yet (common when importing contacts/deals for a new company)."""

    def __init__(self, owner=None, **kwargs):
        super().__init__(**kwargs)
        self.owner = owner

    def before_import_row(self, row, **kwargs):
        company_name = row.get("company")
        if company_name and not Company.objects.filter(name=company_name).exists():
            Company.objects.create(name=company_name, owner=self.owner)

    def before_save_instance(self, instance, row, **kwargs):
        if self.owner and not getattr(instance, "owner_id", None):
            instance.owner = self.owner


class ContactResource(OwnerAssigningResource):
    company = fields.Field(
        column_name="company",
        attribute="company",
        widget=ForeignKeyWidget(Company, field="name"),
    )

    class Meta:
        model = Contact
        fields = (
            "id", "first_name", "last_name", "email", "phone",
            "position", "company", "notes",
        )
        export_order = fields


class DealResource(OwnerAssigningResource):
    company = fields.Field(
        column_name="company",
        attribute="company",
        widget=ForeignKeyWidget(Company, field="name"),
    )
    contact_email = fields.Field(
        column_name="contact_email",
        attribute="contact",
        widget=ForeignKeyWidget(Contact, field="email"),
    )

    class Meta:
        model = Deal
        fields = (
            "id", "title", "company", "contact_email", "amount",
            "stage", "probability", "expected_close_date",
        )
        export_order = fields
