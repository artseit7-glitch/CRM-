from django.contrib import admin

from .models import Activity, Contact


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "company", "owner")
    search_fields = ("first_name", "last_name", "email")
    list_filter = ("company",)


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ("type", "contact", "deal", "created_by", "created_at")
    list_filter = ("type",)
