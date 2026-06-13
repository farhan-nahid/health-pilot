from rest_framework import serializers
from .models import Appointment, ChatMessage
from doctors.serializers import DoctorListSerializer
from patients.models import Patient


class PrescriptionMedicineSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True)
    dose = serializers.CharField(required=False, allow_blank=True)
    when_to_take = serializers.CharField(required=False, allow_blank=True)
    duration = serializers.CharField(required=False, allow_blank=True)
    instructions = serializers.CharField(required=False, allow_blank=True)


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = (
            "doctor",
            "medical_report",
            "appointment_date",
            "appointment_time",
            "symptoms",
            "dependent_id",
        )

    dependent_id = serializers.IntegerField(required=False, write_only=True)

    def validate(self, data):
        # Check if the time slot is already booked
        existing = Appointment.objects.filter(
            doctor=data["doctor"],
            appointment_date=data["appointment_date"],
            appointment_time=data["appointment_time"],
            status__in=["pending", "accepted"],
        ).exists()

        if existing:
            raise serializers.ValidationError("This time slot is already booked.")

        # Validate that the appointment is for the requesting patient
        request = self.context.get("request")
        if request and hasattr(request.user, "patient_profile"):
            data["patient"] = request.user.patient_profile

            # Handle dependent
            dependent_id = data.get("dependent_id")
            if dependent_id:
                from patients.models import Dependent

                try:
                    dependent = Dependent.objects.get(
                        id=dependent_id, patient=request.user.patient_profile
                    )
                    data["dependent"] = dependent
                except Dependent.DoesNotExist:
                    raise serializers.ValidationError(
                        {"dependent_id": "Invalid dependent ID."}
                    )
        else:
            raise serializers.ValidationError("Only patients can book appointments.")

        return data

    def create(self, validated_data):
        dependent_id = validated_data.pop("dependent_id", None)
        return Appointment.objects.create(**validated_data)


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_details = DoctorListSerializer(source="doctor", read_only=True)
    patient_details = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    medical_report_summary = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = (
            "id",
            "patient",
            "patient_name",
            "patient_details",
            "doctor",
            "doctor_details",
            "medical_report",
            "medical_report_summary",
            "appointment_date",
            "appointment_time",
            "status",
            "symptoms",
            "doctor_notes",
            "prescription_data",
            "follow_up_required",
            "follow_up_date",
            "follow_up_notes",
            "rejection_reason",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "patient", "created_at", "updated_at")

    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer

        return PatientSerializer(obj.patient).data

    def get_patient_name(self, obj):
        if obj.dependent:
            return obj.dependent.name
        return obj.patient.user.get_full_name()

    def get_medical_report_summary(self, obj):
        if obj.medical_report:
            return {
                "id": obj.medical_report.id,
                "ai_summary": obj.medical_report.ai_summary,
                "ai_specialization": obj.medical_report.ai_specialization,
            }
        return None


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ("status", "doctor_notes", "rejection_reason")

    def validate_status(self, value):
        if value not in ["accepted", "rejected", "completed", "cancelled"]:
            raise serializers.ValidationError("Invalid status value.")
        return value


class AppointmentCompleteSerializer(serializers.ModelSerializer):
    medicines = PrescriptionMedicineSerializer(many=True, required=False)
    follow_up_date = serializers.DateField(required=False, allow_null=True)
    follow_up_required = serializers.BooleanField(required=False)
    follow_up_notes = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )

    class Meta:
        model = Appointment
        fields = (
            "doctor_notes",
            "medicines",
            "follow_up_required",
            "follow_up_date",
            "follow_up_notes",
        )

    def validate_medicines(self, medicines):
        cleaned_medicines = []
        for medicine in medicines:
            if not medicine:
                continue

            has_content = any(str(value or "").strip() for value in medicine.values())
            if not has_content:
                continue

            if not medicine.get("name", "").strip():
                raise serializers.ValidationError("Each medicine needs a name.")
            if not medicine.get("when_to_take", "").strip():
                raise serializers.ValidationError(
                    "Each medicine needs a time instruction."
                )
            if not medicine.get("duration", "").strip():
                raise serializers.ValidationError("Each medicine needs a duration.")

            cleaned_medicines.append(
                {
                    "name": medicine.get("name", "").strip(),
                    "dose": medicine.get("dose", "").strip(),
                    "when_to_take": medicine.get("when_to_take", "").strip(),
                    "duration": medicine.get("duration", "").strip(),
                    "instructions": medicine.get("instructions", "").strip(),
                }
            )

        return cleaned_medicines

    def validate(self, attrs):
        follow_up_required = attrs.get("follow_up_required", False)
        follow_up_date = attrs.get("follow_up_date")

        if follow_up_required and not follow_up_date:
            raise serializers.ValidationError(
                {"follow_up_date": "Please provide a follow-up date."}
            )

        return attrs

    def update(self, instance, validated_data):
        medicines = validated_data.pop("medicines", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if medicines is not None:
            instance.prescription_data = medicines

        instance.save()
        return instance


# Chat

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = "__all__"

    def validate(self, attrs):
        appointment = attrs["appointment"]

        if appointment.status not in ["accepted", "completed"]:
            raise serializers.ValidationError("Chat not allowed for this appointment")

        return attrs