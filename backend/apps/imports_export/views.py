import tablib
from django.http import HttpResponse
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.companies.models import Company
from apps.contacts.models import Contact
from apps.deals.models import Deal

from .resources import ContactResource, DealResource


def _load_dataset(uploaded_file) -> tablib.Dataset:
    dataset = tablib.Dataset()
    name = uploaded_file.name.lower()
    content = uploaded_file.read()
    if name.endswith(".xlsx"):
        dataset.load(content, format="xlsx")
    else:
        dataset.load(content.decode("utf-8"), format="csv")
    return dataset


class BaseImportView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    resource_class = None

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"detail": "No file provided (field name: file)."}, status=400)
        dataset = _load_dataset(uploaded_file)
        resource = self.resource_class(owner=request.user)
        result = resource.import_data(dataset, dry_run=False, raise_errors=False)
        return Response(
            {
                "total_rows": result.total_rows,
                "totals": result.totals,
                "errors": [str(row.errors) for row in result.rows if row.errors],
                "has_errors": result.has_errors(),
            }
        )


class BaseExportView(APIView):
    permission_classes = [IsAuthenticated]
    resource_class = None
    queryset = None
    filename = "export"

    def get(self, request):
        # named "filetype", not "format" — DRF reserves the "format" query
        # param for its own content-negotiation/renderer-suffix mechanism.
        fmt = request.query_params.get("filetype", "csv")
        qs = self.queryset
        if not request.user.is_admin_role:
            qs = qs.filter(owner=request.user)
        dataset = self.resource_class().export(qs)
        if fmt == "xlsx":
            content = dataset.xlsx
            content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ext = "xlsx"
        else:
            content = dataset.csv
            content_type = "text/csv"
            ext = "csv"
        response = HttpResponse(content, content_type=content_type)
        response["Content-Disposition"] = f'attachment; filename="{self.filename}.{ext}"'
        return response


class ContactImportView(BaseImportView):
    resource_class = ContactResource


class ContactExportView(BaseExportView):
    resource_class = ContactResource
    queryset = Contact.objects.select_related("owner", "company")
    filename = "contacts"


class DealImportView(BaseImportView):
    resource_class = DealResource


class DealExportView(BaseExportView):
    resource_class = DealResource
    queryset = Deal.objects.select_related("owner", "company", "contact")
    filename = "deals"
