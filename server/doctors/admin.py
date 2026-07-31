from django.contrib import admin
from .models import Doctor, DoctorAvailability, DoctorDocument


class DoctorAvailabilityInline(admin.TabularInline):
    model = DoctorAvailability
    extra = 1


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = (
        "get_doctor_name",
        "specialization",
        "experience_years",
        "consultation_fee",
        "verification_status",
        "created_at",
    )
    list_filter = ("specialization", "experience_years")
    search_fields = ("user__email", "user__first_name", "user__last_name")
    inlines = [DoctorAvailabilityInline]

    def get_doctor_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"

    get_doctor_name.short_description = "Doctor Name"


@admin.register(DoctorAvailability)
class DoctorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ("doctor", "day_of_week", "start_time", "end_time", "is_available")
    list_filter = ("day_of_week", "is_available")
    search_fields = (
        "doctor__user__email",
        "doctor__user__first_name",
        "doctor__user__last_name",
    )


@admin.register(DoctorDocument)
class DoctorDocumentAdmin(admin.ModelAdmin):
    list_display = ("doctor", "document_type", "status", "uploaded_at")
