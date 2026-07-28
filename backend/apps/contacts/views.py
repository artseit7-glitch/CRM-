from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.common.mixins import OwnerScopedQuerySetMixin
from apps.common.permissions import IsOwnerOrAdmin

from .models import Activity, Contact
from .serializers import ActivitySerializer, ContactDetailSerializer, ContactSerializer


class ContactViewSet(OwnerScopedQuerySetMixin, viewsets.ModelViewSet):
    queryset = Contact.objects.select_related("owner", "company").prefetch_related("activities")
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ["first_name", "last_name", "email", "phone"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ContactDetailSerializer
        return ContactSerializer


class ActivityViewSet(OwnerScopedQuerySetMixin, viewsets.ModelViewSet):
    queryset = Activity.objects.select_related("created_by", "contact", "deal")
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    owner_field = "created_by"
