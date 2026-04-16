from django.contrib import admin
from .models import MedicalReport, Patient, SymptomAssessment


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("get_patient_name", "date_of_birth", "blood_group", "created_at")
    list_filter = ("blood_group",)
    search_fields = ("user__email", "user__first_name", "user__last_name")

    def get_patient_name(self, obj):
        return obj.user.get_full_name()

    get_patient_name.short_description = "Patient Name"


@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):
    list_display = ("patient", "ai_specialization", "uploaded_at")
    list_filter = ("ai_specialization", "uploaded_at")
    search_fields = ("patient__user__email", "patient__user__first_name", "symptoms")
    readonly_fields = (
        "extracted_text",
        "ai_specialization",
        "ai_summary",
        "uploaded_at",
    )


@admin.register(SymptomAssessment)
class SymptomAssessmentAdmin(admin.ModelAdmin):
    list_display = ("patient", "recommended_specialization", "created_at")
    list_filter = ("recommended_specialization", "created_at")
    search_fields = ("patient__user__email", "patient__user__first_name", "symptoms")
    readonly_fields = (
        "recommended_specialization",
        "probable_conditions",
        "medication_guidance",
        "home_care_suggestions",
        "red_flags",
        "ai_summary",
        "disclaimer",
        "created_at",
    )
