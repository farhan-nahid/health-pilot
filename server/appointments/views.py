from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from .models import Appointment
from .serializers import (
    AppointmentSerializer,
    AppointmentCreateSerializer,
    AppointmentUpdateSerializer,
)
from datetime import datetime, time


class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["appointment_date", "appointment_time", "created_at", "status"]
    ordering = ["-created_at"]  # Default to newest created first

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Appointment.objects.none()

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

            return Appointment.objects.filter(
                models.Q(patient__user=user)  # My own
                | models.Q(dependent__patient__user=user)  # Managed dependent
                | models.Q(
                    patient__user__in=linked_users
                )  # Linked dependent's appointments
            ).distinct()

        elif user.user_type == "doctor":
            return Appointment.objects.filter(doctor__user=user)
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
        """Complete an appointment (doctor only)"""
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

        if appointment.status != "accepted":
            return Response(
                {"error": "Only accepted appointments can be marked as completed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment.status = "completed"
        appointment.doctor_notes = request.data.get(
            "doctor_notes", appointment.doctor_notes
        )
        appointment.save()

        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)

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
