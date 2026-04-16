from rest_framework import serializers
from .models import Dependent, MedicalReport, Patient, SymptomAssessment


class PatientSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = (
            "id",
            "user",
            "date_of_birth",
            "blood_group",
            "address",
            "emergency_contact",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "email": obj.user.email,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
            "phone": obj.user.phone,
        }


class PatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ("date_of_birth", "blood_group", "address", "emergency_contact")


class MedicalReportSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = MedicalReport
        fields = (
            "id",
            "patient",
            "patient_name",
            "report_file",
            "symptoms",
            "ai_specialization",
            "ai_summary",
            "extracted_text",
            "uploaded_at",
        )
        read_only_fields = (
            "id",
            "patient",
            "ai_specialization",
            "ai_summary",
            "extracted_text",
            "uploaded_at",
        )

    def get_patient_name(self, obj):
        if obj.dependent:
            return obj.dependent.name
        return obj.patient.user.get_full_name()

    def validate_report_file(self, value):
        if not value.name.endswith(".pdf"):
            raise serializers.ValidationError("Only PDF files are allowed.")
        if value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("File size cannot exceed 10MB.")
        return value


class DependentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependent
        fields = (
            "id",
            "name",
            "relationship",
            "date_of_birth",
            "gender",
            "blood_group",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class SymptomAssessmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = SymptomAssessment
        fields = (
            "id",
            "patient",
            "patient_name",
            "dependent",
            "symptoms",
            "recommended_specialization",
            "probable_conditions",
            "medication_guidance",
            "home_care_suggestions",
            "red_flags",
            "ai_summary",
            "disclaimer",
            "created_at",
        )
        read_only_fields = (
            "id",
            "patient",
            "patient_name",
            "recommended_specialization",
            "probable_conditions",
            "medication_guidance",
            "home_care_suggestions",
            "red_flags",
            "ai_summary",
            "disclaimer",
            "created_at",
        )

    def get_patient_name(self, obj):
        if obj.dependent:
            return obj.dependent.name
        return obj.patient.user.get_full_name()


class SymptomAssessmentCreateSerializer(serializers.Serializer):
    symptoms = serializers.CharField(min_length=10)
    dependent_id = serializers.IntegerField(required=False)
