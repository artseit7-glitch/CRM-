from rest_framework import serializers

from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source="owner.username")

    class Meta:
        model = Company
        fields = [
            "id", "name", "industry", "website", "phone", "notes",
            "owner", "owner_username", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]
