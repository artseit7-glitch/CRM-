from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    assignee_username = serializers.ReadOnlyField(source="assignee.username")
    deal_title = serializers.SerializerMethodField()
    contact_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id", "title", "description", "due_date", "status",
            "deal", "deal_title", "contact", "contact_name",
            "assignee", "assignee_username", "reminder_sent",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "reminder_sent", "created_at", "updated_at"]
        extra_kwargs = {"assignee": {"required": False}}

    def get_contact_name(self, obj):
        return str(obj.contact) if obj.contact else None

    def get_deal_title(self, obj):
        return obj.deal.title if obj.deal else None
