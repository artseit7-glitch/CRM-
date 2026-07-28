from django.contrib import admin
from django.urls import include, path, re_path

from apps.common.views import spa_index

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.companies.urls")),
    path("api/", include("apps.contacts.urls")),
    path("api/", include("apps.deals.urls")),
    path("api/", include("apps.tasks.urls")),
    path("api/", include("apps.analytics.urls")),
    path("api/", include("apps.imports_export.urls")),
    # SPA fallback: any other route serves the React app so client-side
    # routing (e.g. refreshing on /deals) works. WhiteNoise (WHITENOISE_ROOT)
    # already intercepts real asset files like /assets/*.js before this runs.
    re_path(r"^.*$", spa_index),
]
