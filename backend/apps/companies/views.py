from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.common.mixins import OwnerScopedQuerySetMixin
from apps.common.permissions import IsOwnerOrAdmin

from .models import Company
from .serializers import CompanySerializer


class CompanyViewSet(OwnerScopedQuerySetMixin, viewsets.ModelViewSet):
    queryset = Company.objects.select_related("owner").all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "industry", "website"]
