from django.urls import path

from .views import ContactExportView, ContactImportView, DealExportView, DealImportView

urlpatterns = [
    path("import-export/contacts/import/", ContactImportView.as_view(), name="contacts-import"),
    path("import-export/contacts/export/", ContactExportView.as_view(), name="contacts-export"),
    path("import-export/deals/import/", DealImportView.as_view(), name="deals-import"),
    path("import-export/deals/export/", DealExportView.as_view(), name="deals-export"),
]
