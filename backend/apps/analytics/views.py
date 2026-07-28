from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.deals.models import Deal


def _deals_for(user):
    qs = Deal.objects.all()
    if not user.is_admin_role:
        qs = qs.filter(owner=user)
    return qs


class PipelineSummaryView(APIView):
    """Deal count + total amount per stage, and overall conversion rate."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        deals = _deals_for(request.user)
        by_stage = list(
            deals.values("stage").annotate(count=Count("id"), total_amount=Sum("amount")).order_by("stage")
        )
        total = deals.count()
        won = deals.filter(stage=Deal.Stage.WON).count()
        conversion_rate = round(won / total * 100, 1) if total else 0
        return Response({"by_stage": by_stage, "total_deals": total, "conversion_rate": conversion_rate})


class RevenueByMonthView(APIView):
    """Total won-deal revenue grouped by month (last 12 months)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        deals = _deals_for(request.user).filter(stage=Deal.Stage.WON)
        data = (
            deals.annotate(month=TruncMonth("updated_at"))
            .values("month")
            .annotate(revenue=Sum("amount"))
            .order_by("month")
        )
        return Response(list(data))


class ManagerActivityView(APIView):
    """Admin-only: deal count/revenue per manager."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin_role:
            return Response({"detail": "Admin only."}, status=403)
        data = (
            Deal.objects.values("owner__username")
            .annotate(deal_count=Count("id"), total_amount=Sum("amount"))
            .order_by("-total_amount")
        )
        return Response(list(data))
