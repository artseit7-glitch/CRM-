from rest_framework.routers import DefaultRouter

from .views import ActivityViewSet, ContactViewSet

router = DefaultRouter()
router.register("contacts", ContactViewSet, basename="contact")
router.register("activities", ActivityViewSet, basename="activity")

urlpatterns = router.urls
