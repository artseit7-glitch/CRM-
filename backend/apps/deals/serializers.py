from rest_framework import serializers

from .models import Deal


class DealSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source="owner.username")
    contact_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    stage_display = serializers.ReadOnlyField(source="get_stage_display")

    class Meta:
        model = Deal
        fields = [
            "id", "title", "contact", "contact_name", "company", "company_name",
            "amount", "stage", "stage_display", "probability", "expected_close_date",
            "owner", "owner_username", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]

    def get_contact_name(self, obj):
        return str(obj.contact) if obj.contact else None

    def get_company_name(self, obj):
        return obj.company.name if obj.company else None
