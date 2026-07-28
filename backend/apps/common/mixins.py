class OwnerScopedQuerySetMixin:
    """Restricts queryset to the request user's own records unless they are admin."""

    owner_field = "owner"

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_admin_role:
            return qs
        return qs.filter(**{self.owner_field: user})

    def perform_create(self, serializer):
        serializer.save(**{self.owner_field: self.request.user})
