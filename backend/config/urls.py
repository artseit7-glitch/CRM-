from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.companies.urls")),
    path("api/", include("apps.contacts.urls")),
    path("api/", include("apps.deals.urls")),
    path("api/", include("apps.tasks.urls")),
    path("api/", include("apps.analytics.urls")),
    path("api/", include("apps.imports_export.urls")),
]
