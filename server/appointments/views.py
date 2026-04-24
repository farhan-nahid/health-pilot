from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models
from django.http import FileResponse
from .models import Appointment
from .serializers import (
    AppointmentSerializer,
    AppointmentCreateSerializer,
    AppointmentUpdateSerializer,
    AppointmentCompleteSerializer,
)
from .pdf import build_prescription_pdf


class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["appointment_date", "appointment_time", "created_at", "status"]
    ordering = ["-created_at"]  # Default to newest created first

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Appointment.objects.none()

        # Check for patient_id query parameter (for doctors/staff to filter by patient)
        patient_id = self.request.query_params.get("patient_id", None)

        if user.user_type == "patient":
            # 1. Own appointments
            # 2. Appointments of dependents (Managed) where dependent__patient__user is current user
            # 3. Appointments of linked dependents?
            # actually, if I am a guardian, I want to see appointments where:
            # a) patient__user == me
            # b) dependent__patient__user == me (Managed dependent appointment)
            # c) patient__user is one of my linked dependents (Linked account appointment)

            # Simplifying:
            # - Direct appointments match patient__user=user
            # - Managed dependent appointments match dependent__patient__user=user
            # - Linked Account appointments: The appointment has patient=LinkedPatient.
            #   We need to find if LinkedPatient is a dependent of CurrentUser.
            #   Dependent.objects.filter(patient__user=user, linked_user=appointment.patient.user).exists()

            from patients.models import Dependent

            # Get all users that are dependents of current user
            linked_users = Dependent.objects.filter(
                patient__user=user, linked_user__isnull=False
            ).values_list("linked_user", flat=True)

            queryset = Appointment.objects.filter(
                models.Q(patient__user=user)  # My own
                | models.Q(dependent__patient__user=user)  # Managed dependent
                | models.Q(
                    patient__user__in=linked_users
                )  # Linked dependent's appointments
            ).distinct()

            # If patient_id is provided, filter by it (for viewing specific patient's appointments)
            if patient_id:
                try:
                    from patients.models import Patient

                    patient = Patient.objects.get(id=patient_id)
                    # Only allow if this patient is related to current user
                    if (
                        patient.user == user
                        or linked_users.filter(id=patient.user.id).exists()
                    ):
                        queryset = Appointment.objects.filter(patient=patient)
                except Patient.DoesNotExist:
                    queryset = Appointment.objects.none()

            return queryset

        elif user.user_type == "doctor":
            queryset = Appointment.objects.filter(doctor__user=user)
            # If patient_id is provided, filter by it
            if patient_id:
                try:
                    from patients.models import Patient

                    queryset = queryset.filter(patient_id=patient_id)
                except Patient.DoesNotExist:
                    queryset = Appointment.objects.none()
            return queryset
        return Appointment.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return AppointmentCreateSerializer
        if self.action in ["update", "partial_update", "accept", "reject"]:
            return AppointmentUpdateSerializer
        return AppointmentSerializer

    def create(self, request, *args, **kwargs):
        """Create a new appointment (patient only)"""
        if request.user.user_type != "patient":
            return Response(
                {"error": "Only patients can book appointments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            appointment = serializer.save()
            return Response(
                AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        """Accept an appointment (doctor only)"""
        if request.user.user_type != "doctor":
            return Response(
                {"error": "Only doctors can accept appointments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        appointment = self.get_object()
        if appointment.doctor.user != request.user:
            return Response(
                {"error": "You can only accept your own appointments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        appointment.status = "accepted"
        appointment.doctor_notes = request.data.get("doctor_notes", "")
        appointment.save()

        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """Reject an appointment (doctor only)"""
        if request.user.user_type != "doctor":
            return Response(
                {"error": "Only doctors can reject appointments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        appointment = self.get_object()
        if appointment.doctor.user != request.user:
            return Response(
                {"error": "You can only reject your own appointments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        appointment.status = "rejected"
        appointment.rejection_reason = request.data.get("rejection_reason", "")
        appointment.save()

        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """Complete an appointment or update its prescription (doctor only)"""
        if request.user.user_type != "doctor":
            return Response(
                {"error": "Only doctors can complete appointments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        appointment = self.get_object()
        if appointment.doctor.user != request.user:
            return Response(
                {"error": "You can only complete your own appointments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Allow completion of accepted appointments or updating already completed appointments
        if appointment.status not in ["accepted", "completed"]:
            return Response(
                {"error": "Only accepted or completed appointments can be updated"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AppointmentCompleteSerializer(
            instance=appointment, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()

        # Only set to completed if it was previously accepted
        if appointment.status == "accepted":
            appointment.status = "completed"

        appointment.save()

        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=["get"])
    def prescription_pdf(self, request, pk=None):
        """Download a completed appointment prescription as PDF."""
        appointment = self.get_object()

        if request.user.user_type == "doctor":
            if appointment.doctor.user != request.user:
                return Response(
                    {"error": "You can only access your own prescriptions"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif request.user.user_type == "patient":
            if appointment.patient.user != request.user:
                return Response(
                    {"error": "You can only access your own prescriptions"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        else:
            return Response(
                {"error": "Only doctors or patients can download prescriptions"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if appointment.status != "completed":
            return Response(
                {
                    "error": "Prescription PDF is only available for completed appointments"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        pdf_buffer = build_prescription_pdf(appointment)
        filename = f"health-pilot-prescription-{appointment.id}.pdf"
        return FileResponse(
            pdf_buffer,
            as_attachment=True,
            filename=filename,
            content_type="application/pdf",
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel an appointment (patient only)"""
        if request.user.user_type != "patient":
            return Response(
                {"error": "Only patients can cancel appointments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        appointment = self.get_object()
        if appointment.patient.user != request.user:
            return Response(
                {"error": "You can only cancel your own appointments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if appointment.status in ["completed", "cancelled"]:
            return Response(
                {"error": "Cannot cancel completed or already cancelled appointments"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment.status = "cancelled"
        appointment.save()

        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def available_slots(self, request):
        """Get available appointment slots for a doctor on a specific date"""
        doctor_id = request.query_params.get("doctor_id")
        date_str = request.query_params.get("date")

        if not doctor_id or not date_str:
            return Response(
                {"error": "doctor_id and date parameters are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from doctors.models import Doctor, DoctorAvailability
            from datetime import datetime, timedelta

            doctor = Doctor.objects.get(id=doctor_id)
            appointment_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            day_name = appointment_date.strftime("%A").lower()

            # Get doctor's availability for this day
            availabilities = DoctorAvailability.objects.filter(
                doctor=doctor, day_of_week=day_name, is_available=True
            )

            if not availabilities.exists():
                return Response({"available_slots": []})

            # Get booked appointments for this day
            booked_appointments = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appointment_date,
                status__in=["pending", "accepted"],
            ).values_list("appointment_time", flat=True)

            # Generate available time slots (30-minute intervals)
            available_slots = []
            for availability in availabilities:
                current_time = datetime.combine(
                    appointment_date, availability.start_time
                )
                end_time = datetime.combine(appointment_date, availability.end_time)

                while current_time < end_time:
                    slot_time = current_time.time()
                    if slot_time not in booked_appointments:
                        available_slots.append(slot_time.strftime("%H:%M"))
                    current_time += timedelta(minutes=30)

            return Response({"available_slots": available_slots})

        except Doctor.DoesNotExist:
            return Response(
                {"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )
