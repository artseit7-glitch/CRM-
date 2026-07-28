from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import IsOwnerOrAdmin

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """Tasks are scoped by assignee: managers see/act on tasks assigned to them,
    admins see everything and can assign tasks to any user."""

    queryset = Task.objects.select_related("assignee", "deal", "contact")
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    owner_field = "assignee"
    filterset_fields = ["status", "assignee", "deal", "contact"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_admin_role:
            return qs
        return qs.filter(assignee=user)

    def perform_create(self, serializer):
        # Managers may only assign tasks to themselves; admins can assign to anyone.
        assignee = serializer.validated_data.get("assignee")
        if not self.request.user.is_admin_role and assignee not in (None, self.request.user):
            serializer.save(assignee=self.request.user)
        else:
            serializer.save(assignee=assignee or self.request.user)
