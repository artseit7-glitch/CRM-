from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.common.mixins import OwnerScopedQuerySetMixin
from apps.common.permissions import IsOwnerOrAdmin

from .models import Deal
from .serializers import DealSerializer


class DealViewSet(OwnerScopedQuerySetMixin, viewsets.ModelViewSet):
    queryset = Deal.objects.select_related("owner", "contact", "company")
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    filterset_fields = ["stage", "company", "contact"]
