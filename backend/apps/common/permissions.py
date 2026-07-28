from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_role)


class IsOwnerOrAdmin(BasePermission):
    """Admins can act on any object; managers only on objects they own.

    Looks up the owner field name from the view (`owner_field` attribute,
    same one used by OwnerScopedQuerySetMixin) so a single permission class
    works for models that use "owner" as well as "created_by", etc.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_role:
            return True
        owner_field = getattr(view, "owner_field", "owner")
        owner = getattr(obj, owner_field, None)
        return owner == request.user


class ReadOnlyOrIsAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_role)
