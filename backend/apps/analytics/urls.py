from django.urls import path

from .views import ManagerActivityView, PipelineSummaryView, RevenueByMonthView

urlpatterns = [
    path("analytics/pipeline/", PipelineSummaryView.as_view(), name="analytics-pipeline"),
    path("analytics/revenue-by-month/", RevenueByMonthView.as_view(), name="analytics-revenue"),
    path("analytics/manager-activity/", ManagerActivityView.as_view(), name="analytics-manager-activity"),
]
