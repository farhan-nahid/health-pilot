from rest_framework import viewsets, status, filters, pagination
from django.db import IntegrityError
from django.db.models import Avg, Count
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Doctor, DoctorAvailability
from .serializers import (
    DoctorSerializer,
    DoctorUpdateSerializer,
    DoctorAvailabilitySerializer,
    DoctorListSerializer,
)
from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer


class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class DoctorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ["user__first_name", "user__last_name", "specialization", "bio"]
    ordering_fields = ["experience_years", "consultation_fee", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Doctor.objects.annotate(
            average_rating=Avg("reviews__rating"), total_reviews=Count("reviews")
        )

        # Filter by specialization if provided
        specialization = self.request.query_params.get("specialization", None)
        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)

        if self.request.user.user_type == "doctor":
            return queryset.filter(user=self.request.user)
        return queryset

    def get_serializer_class(self):
        if self.action == "update" or self.action == "partial_update":
            return DoctorUpdateSerializer
        if self.action == "list":
            return DoctorListSerializer
        return DoctorSerializer

    @action(detail=False, methods=["get"])
    def profile(self, request):
        """Get current doctor's profile"""
        if request.user.user_type != "doctor":
            return Response(
                {"error": "Only doctors can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            doctor = request.user.doctor_profile
            serializer = DoctorSerializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["put", "patch"])
    def update_profile(self, request):
        """Update current doctor's profile"""
        if request.user.user_type != "doctor":
            return Response(
                {"error": "Only doctors can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            doctor = request.user.doctor_profile
            serializer = DoctorUpdateSerializer(doctor, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(DoctorSerializer(doctor).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Doctor.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"])
    def by_specialization(self, request):
        """Get doctors by specialization"""
        specialization = request.query_params.get("specialization", None)
        if not specialization:
            return Response(
                {"error": "Specialization parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        doctors = Doctor.objects.filter(specialization__icontains=specialization)
        serializer = DoctorListSerializer(doctors, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def appointments(self, request):
        """Get appointments for the current doctor"""
        if request.user.user_type != "doctor":
            return Response(
                {"error": "Only doctors can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            doctor = request.user.doctor_profile
            appointments = Appointment.objects.filter(doctor=doctor)

            # Filter by status if provided
            status_filter = request.query_params.get("status", None)
            if status_filter:
                appointments = appointments.filter(status=status_filter)

            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"])
    def dashboard_summary(self, request):
        """Get consolidated dashboard summary for the current doctor"""
        if request.user.user_type != "doctor":
            return Response(
                {"error": "Only doctors can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            doctor = request.user.doctor_profile

            # 1. Stats
            appointments = Appointment.objects.filter(doctor=doctor)

            # Count unique patients
            unique_patients_count = appointments.values("patient").distinct().count()

            # Estimate revenue from completed appointments
            consultation_fee = float(doctor.consultation_fee)
            completed_count = appointments.filter(status="completed").count()
            estimated_revenue = completed_count * consultation_fee

            stats = {
                "appointments_total": appointments.count(),
                "appointments_pending": appointments.filter(status="pending").count(),
                "appointments_accepted": appointments.filter(status="accepted").count(),
                "appointments_completed": completed_count,
                "patients_total": unique_patients_count,
                "revenue_estimated": estimated_revenue,
            }

            # 2. Upcoming Consultations (Accepted ones)
            upcoming = appointments.filter(status="accepted").order_by(
                "appointment_date", "appointment_time"
            )[:3]

            # 3. Recent Activity (Latest 5 items)
            recent_appointments = appointments.order_by("-updated_at")[:5]

            activity_list = []
            for app in recent_appointments:
                activity_list.append(
                    {
                        "id": f"app-{app.id}",
                        "type": "appointment",
                        "title": f"Appointment {app.status.capitalize()}",
                        "detail": f"With patient {app.patient.user.get_full_name()}",
                        "date": app.updated_at,
                    }
                )

            # Sort activity by date descending
            activity_list.sort(key=lambda x: x["date"], reverse=True)

            response_data = {
                "user": {
                    "name": f"Dr. {request.user.get_full_name()}",
                    "first_name": request.user.first_name,
                },
                "stats": stats,
                "upcoming_consultations": AppointmentSerializer(
                    upcoming, many=True
                ).data,
                "recent_activity": activity_list[:5],
            }

            return Response(response_data)
        except Doctor.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"])
    def activity(self, request):
        """Get paginated activity feed for the current doctor"""
        if request.user.user_type != "doctor":
            return Response(
                {"error": "Only doctors can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            doctor = request.user.doctor_profile
            appointments = (
                Appointment.objects.filter(doctor=doctor)
                .select_related("patient__user")
                .only(
                    "id",
                    "status",
                    "updated_at",
                    "patient__user__first_name",
                    "patient__user__last_name",
                )
                .order_by("-updated_at")
            )

            page = self.paginate_queryset(appointments)
            if page is not None:
                activity_list = [
                    {
                        "id": f"app-{app.id}",
                        "type": "appointment",
                        "title": f"Appointment {app.status.capitalize()}",
                        "detail": f"With patient {app.patient.user.get_full_name()}",
                        "date": app.updated_at,
                    }
                    for app in page
                ]
                return self.get_paginated_response(activity_list)

            return Response([])
        except Doctor.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found"}, status=status.HTTP_404_NOT_FOUND
            )


class DoctorAvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["day_of_week", "start_time"]

    def get_queryset(self):
        if self.request.user.user_type == "doctor":
            return DoctorAvailability.objects.filter(doctor__user=self.request.user)

        # For patients, get availability for specific doctor
        doctor_id = self.request.query_params.get("doctor_id", None)
        if doctor_id:
            return DoctorAvailability.objects.filter(
                doctor_id=doctor_id, is_available=True
            )

        return DoctorAvailability.objects.none()

    def create(self, request, *args, **kwargs):
        if request.user.user_type != "doctor":
            return Response(
                {"error": "Only doctors can create availability slots"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            doctor = request.user.doctor_profile
            data = request.data.copy()

            if isinstance(data, list):
                created_slots = []
                for slot_data in data:
                    slot_data["doctor"] = doctor.id
                    serializer = self.get_serializer(data=slot_data)
                    if serializer.is_valid():
                        try:
                            serializer.save(doctor=doctor)
                            created_slots.append(serializer.data)
                        except IntegrityError:
                            return Response(
                                {
                                    "error": "A slot with this day and start time already exists."
                                },
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                    else:
                        return Response(
                            serializer.errors, status=status.HTTP_400_BAD_REQUEST
                        )
                return Response(created_slots, status=status.HTTP_201_CREATED)
            else:
                serializer = self.get_serializer(data=data)
                if serializer.is_valid():
                    try:
                        serializer.save(doctor=doctor)
                        return Response(serializer.data, status=status.HTTP_201_CREATED)
                    except IntegrityError:
                        return Response(
                            {
                                "error": "A slot with this day and start time already exists."
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Doctor.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found"}, status=status.HTTP_404_NOT_FOUND
            )
