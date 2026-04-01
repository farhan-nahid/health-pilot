from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "patient",
        "doctor",
        "appointment_date",
        "appointment_time",
        "status",
        "created_at",
    )
    list_filter = ("status", "appointment_date")
    search_fields = (
        "patient__user__email",
        "patient__user__first_name",
        "doctor__user__email",
        "doctor__user__first_name",
    )
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (
            "Appointment Info",
            {
                "fields": (
                    "patient",
                    "doctor",
                    "appointment_date",
                    "appointment_time",
                    "status",
                )
            },
        ),
        (
            "Medical Details",
            {
                "fields": (
                    "medical_report",
                    "symptoms",
                    "doctor_notes",
                    "rejection_reason",
                )
            },
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
