from rest_framework import serializers

from .models import Activity, Contact


class ActivitySerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField(source="created_by.username")

    class Meta:
        model = Activity
        fields = [
            "id", "contact", "deal", "type", "text",
            "created_by", "created_by_username", "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]


class ContactSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source="owner.username")
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Contact
        fields = [
            "id", "first_name", "last_name", "email", "phone", "position",
            "company", "company_name", "notes", "owner", "owner_username",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]

    def get_company_name(self, obj):
        return obj.company.name if obj.company else None


class ContactDetailSerializer(ContactSerializer):
    activities = ActivitySerializer(many=True, read_only=True)

    class Meta(ContactSerializer.Meta):
        fields = ContactSerializer.Meta.fields + ["activities"]
