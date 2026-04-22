from django.db import models
from django.db.models.functions import Coalesce
from rest_framework import viewsets, status, filters, pagination
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Dependent, MedicalReport, Patient, SymptomAssessment
from .serializers import (
    DependentSerializer,
    PatientSerializer,
    PatientUpdateSerializer,
    MedicalReportSerializer,
    SymptomAssessmentCreateSerializer,
    SymptomAssessmentSerializer,
)
from .ai_service import AIService
from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer
from doctors.models import Doctor
from doctors.serializers import DoctorListSerializer


class ActivityPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = ActivityPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ["user__first_name", "user__last_name", "user__email"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Patient.objects.none()

        if self.request.user.user_type == "patient":
            return Patient.objects.filter(user=self.request.user)

        # For doctors, only show patients who have booked appointments with them
        if self.request.user.user_type == "doctor":
            try:
                doctor = self.request.user.doctor_profile
                # Get all appointments for this doctor
                appointments = Appointment.objects.filter(doctor=doctor)
                # Get unique patients from those appointments
                patient_ids = appointments.values_list("patient", flat=True).distinct()
                return Patient.objects.filter(id__in=patient_ids)
            except Doctor.DoesNotExist:
                return Patient.objects.none()

        return Patient.objects.all()

    def get_serializer_class(self):
        if self.action == "update" or self.action == "partial_update":
            return PatientUpdateSerializer
        return PatientSerializer

    @action(detail=False, methods=["get"])
    def profile(self, request):
        """Get current patient's profile"""
        if request.user.user_type != "patient":
            return Response(
                {"error": "Only patients can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            patient = request.user.patient_profile
            serializer = PatientSerializer(patient)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"])
    def dashboard_summary(self, request):
        """Get consolidated dashboard summary for the current patient"""
        if request.user.user_type != "patient":
            return Response(
                {"error": "Only patients can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            patient = request.user.patient_profile

            # 1. Stats
            appointments = Appointment.objects.filter(patient=patient)
            reports = MedicalReport.objects.filter(patient=patient)
            symptom_assessments = SymptomAssessment.objects.filter(patient=patient)

            reports_total = reports.count() + symptom_assessments.count()
            reports_analyzed = (
                reports.exclude(ai_specialization__isnull=True)
                .exclude(ai_specialization="")
                .count()
                + symptom_assessments.exclude(recommended_specialization__isnull=True)
                .exclude(recommended_specialization="")
                .count()
            )

            unique_specializations = set(
                reports.values_list("ai_specialization", flat=True)
                .exclude(ai_specialization__isnull=True)
                .exclude(ai_specialization="")
            )
            unique_specializations.update(
                symptom_assessments.values_list("recommended_specialization", flat=True)
                .exclude(recommended_specialization__isnull=True)
                .exclude(recommended_specialization="")
            )

            stats = {
                "appointments_total": appointments.count(),
                "appointments_accepted": appointments.filter(status="accepted").count(),
                "appointments_completed": appointments.filter(
                    status="completed"
                ).count(),
                "reports_total": reports_total,
                "reports_analyzed": reports_analyzed,
                "unique_specializations": sorted(unique_specializations),
            }

            # 2. Upcoming Consultations (Accepted ones)
            upcoming = appointments.filter(status="accepted").order_by(
                "appointment_date", "appointment_time"
            )[:3]

            # 3. Recent Activity (Latest 5 items)
            # Combine latest appointments and reports
            recent_appointments = appointments.order_by("-updated_at")[:5]
            recent_reports = reports.order_by("-uploaded_at")[:5]
            recent_symptom_assessments = symptom_assessments.order_by("-created_at")[:5]

            activity_list = []
            for app in recent_appointments:
                activity_list.append(
                    {
                        "id": f"app-{app.id}",
                        "type": "appointment",
                        "title": f"Appointment {app.status.capitalize()}",
                        "detail": f"With Dr. {app.doctor.user.get_full_name()}",
                        "date": app.updated_at,
                    }
                )

            for rep in recent_reports:
                activity_list.append(
                    {
                        "id": f"rep-{rep.id}",
                        "type": "report",
                        "title": "Medical Report Uploaded",
                        "detail": f"Analyzed as {rep.ai_specialization}"
                        if rep.ai_specialization
                        else "Processing AI analysis...",
                        "date": rep.uploaded_at,
                    }
                )

            for assessment in recent_symptom_assessments:
                activity_list.append(
                    {
                        "id": f"rep-sa-{assessment.id}",
                        "type": "report",
                        "title": "AI Symptom Assessment Generated",
                        "detail": f"Recommended {assessment.recommended_specialization}"
                        if assessment.recommended_specialization
                        else "AI triage guidance generated",
                        "date": assessment.created_at,
                    }
                )

            # Sort activity by date descending
            activity_list.sort(key=lambda x: x["date"], reverse=True)

            response_data = {
                "user": {
                    "name": request.user.get_full_name(),
                    "first_name": request.user.first_name,
                },
                "stats": stats,
                "upcoming_consultations": AppointmentSerializer(
                    upcoming, many=True
                ).data,
                "recent_activity": activity_list[:5],
            }

            return Response(response_data)
        except Patient.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"])
    def activity(self, request):
        """Get paginated activity feed for the current patient"""
        if request.user.user_type != "patient":
            return Response(
                {"error": "Only patients can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            patient = request.user.patient_profile

            appointment_activity = (
                Appointment.objects.filter(patient=patient)
                .annotate(
                    activity_date=models.F("updated_at"),
                    activity_kind=models.Value(
                        "appointment", output_field=models.CharField()
                    ),
                    activity_ref_id=models.F("id"),
                    activity_status=models.F("status"),
                    counterpart_first_name=models.F("doctor__user__first_name"),
                    counterpart_last_name=models.F("doctor__user__last_name"),
                    activity_specialization=models.Value(
                        "", output_field=models.CharField()
                    ),
                )
                .values(
                    "activity_date",
                    "activity_kind",
                    "activity_ref_id",
                    "activity_status",
                    "counterpart_first_name",
                    "counterpart_last_name",
                    "activity_specialization",
                )
            )

            report_activity = (
                MedicalReport.objects.filter(patient=patient)
                .annotate(
                    activity_date=models.F("uploaded_at"),
                    activity_kind=models.Value(
                        "medical_report", output_field=models.CharField()
                    ),
                    activity_ref_id=models.F("id"),
                    activity_status=models.Value("", output_field=models.CharField()),
                    counterpart_first_name=models.Value(
                        "", output_field=models.CharField()
                    ),
                    counterpart_last_name=models.Value(
                        "", output_field=models.CharField()
                    ),
                    activity_specialization=Coalesce(
                        "ai_specialization",
                        models.Value("", output_field=models.CharField()),
                    ),
                )
                .values(
                    "activity_date",
                    "activity_kind",
                    "activity_ref_id",
                    "activity_status",
                    "counterpart_first_name",
                    "counterpart_last_name",
                    "activity_specialization",
                )
            )

            symptom_activity = (
                SymptomAssessment.objects.filter(patient=patient)
                .annotate(
                    activity_date=models.F("created_at"),
                    activity_kind=models.Value(
                        "symptom_assessment", output_field=models.CharField()
                    ),
                    activity_ref_id=models.F("id"),
                    activity_status=models.Value("", output_field=models.CharField()),
                    counterpart_first_name=models.Value(
                        "", output_field=models.CharField()
                    ),
                    counterpart_last_name=models.Value(
                        "", output_field=models.CharField()
                    ),
                    activity_specialization=Coalesce(
                        "recommended_specialization",
                        models.Value("", output_field=models.CharField()),
                    ),
                )
                .values(
                    "activity_date",
                    "activity_kind",
                    "activity_ref_id",
                    "activity_status",
                    "counterpart_first_name",
                    "counterpart_last_name",
                    "activity_specialization",
                )
            )

            activity_queryset = appointment_activity.union(
                report_activity, symptom_activity, all=True
            ).order_by("-activity_date")

            page = self.paginate_queryset(activity_queryset)
            if page is not None:
                activity_list = []
                for activity in page:
                    if activity["activity_kind"] == "appointment":
                        doctor_name = (
                            f"{activity['counterpart_first_name']} {activity['counterpart_last_name']}"
                        ).strip()
                        activity_list.append(
                            {
                                "id": f"app-{activity['activity_ref_id']}",
                                "type": "appointment",
                                "title": f"Appointment {activity['activity_status'].capitalize()}",
                                "detail": f"With Dr. {doctor_name}",
                                "date": activity["activity_date"],
                            }
                        )
                    elif activity["activity_kind"] == "medical_report":
                        specialization = activity["activity_specialization"]
                        activity_list.append(
                            {
                                "id": f"rep-{activity['activity_ref_id']}",
                                "type": "report",
                                "title": "Medical Report Uploaded",
                                "detail": f"Analyzed as {specialization}"
                                if specialization
                                else "Processing AI analysis...",
                                "date": activity["activity_date"],
                            }
                        )
                    else:
                        specialization = activity["activity_specialization"]
                        activity_list.append(
                            {
                                "id": f"rep-sa-{activity['activity_ref_id']}",
                                "type": "report",
                                "title": "AI Symptom Assessment Generated",
                                "detail": f"Recommended {specialization}"
                                if specialization
                                else "AI triage guidance generated",
                                "date": activity["activity_date"],
                            }
                        )

                return self.get_paginated_response(activity_list)

            return Response([])
        except Patient.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["put", "patch"])
    def update_profile(self, request):
        """Update current patient's profile"""
        if request.user.user_type != "patient":
            return Response(
                {"error": "Only patients can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            patient = request.user.patient_profile
            serializer = PatientUpdateSerializer(
                patient, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(PatientSerializer(patient).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Patient.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"])
    def appointments(self, request):
        """Get appointments for the current patient"""
        if request.user.user_type != "patient":
            return Response(
                {"error": "Only patients can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            patient = request.user.patient_profile
            appointments = Appointment.objects.filter(patient=patient)

            # Filter by status if provided
            status_filter = request.query_params.get("status", None)
            if status_filter:
                appointments = appointments.filter(status=status_filter)

            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )


class MedicalReportViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalReportSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["uploaded_at", "ai_specialization"]
    ordering = ["-uploaded_at"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return MedicalReport.objects.none()

        if user.user_type == "patient":
            # Similar logic to appointments
            # My reports OR reports of my dependents (managed or linked)

            linked_users = Dependent.objects.filter(
                patient__user=user, linked_user__isnull=False
            ).values_list("linked_user", flat=True)

            return MedicalReport.objects.filter(
                models.Q(patient__user=user)
                | models.Q(dependent__patient__user=user)
                | models.Q(patient__user__in=linked_users)
            ).distinct()

        elif user.user_type == "doctor":
            # Doctors can see reports from their appointments
            return MedicalReport.objects.filter(
                patient__appointments__doctor__user=user
            ).distinct()
        return MedicalReport.objects.none()

    def create(self, request, *args, **kwargs):
        """Upload medical report and get AI analysis"""
        if request.user.user_type != "patient":
            return Response(
                {"error": "Only patients can upload medical reports"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            patient = request.user.patient_profile
            serializer = self.get_serializer(data=request.data)

            if serializer.is_valid():
                # Save the report first
                report_file = request.FILES.get("report_file")
                symptoms = request.data.get("symptoms", "")

                # Process with AI
                ai_service = AIService()
                try:
                    ai_results = ai_service.process_medical_report(
                        report_file, symptoms
                    )

                    # Handle dependent
                    dependent_id = request.data.get("dependent_id")
                    dependent = None
                    if dependent_id:
                        try:
                            dependent = Dependent.objects.get(
                                id=dependent_id, patient=patient
                            )
                        except Dependent.DoesNotExist:
                            pass  # Or raise error if strict validation needed

                    # Save report with AI analysis
                    medical_report = serializer.save(
                        patient=patient,
                        dependent=dependent,
                        extracted_text=ai_results["extracted_text"],
                        ai_specialization=ai_results["primary_specialization"],
                        ai_summary=ai_results["report_summary"],
                    )

                    # Get matching doctors
                    specialization_map = {
                        "Cardiologist": "cardiologist",
                        "Neurologist": "neurologist",
                        "Dermatologist": "dermatologist",
                        "Orthopedic": "orthopedic",
                        "Pediatrician": "pediatrician",
                        "Psychiatrist": "psychiatrist",
                        "Gynecologist": "gynecologist",
                        "Oncologist": "oncologist",
                        "Gastroenterologist": "gastroenterologist",
                        "General Physician": "general_physician",
                    }

                    primary_spec = specialization_map.get(
                        ai_results["primary_specialization"], "general_physician"
                    )

                    matching_doctors = Doctor.objects.filter(
                        specialization=primary_spec
                    )

                    response_data = {
                        "report": MedicalReportSerializer(medical_report).data,
                        "ai_analysis": ai_results["symptom_analysis"],
                        "matching_doctors": DoctorListSerializer(
                            matching_doctors, many=True
                        ).data,
                    }

                    return Response(response_data, status=status.HTTP_201_CREATED)

                except Exception as e:
                    return Response(
                        {"error": f"AI processing failed: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Patient.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )


class DependentViewSet(viewsets.ModelViewSet):
    serializer_class = DependentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Dependent.objects.none()

        if self.request.user.user_type == "patient":
            return Dependent.objects.filter(patient__user=self.request.user)
        return Dependent.objects.none()

    def perform_create(self, serializer):
        patient = self.request.user.patient_profile
        serializer.save(patient=patient)


class SymptomAssessmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "recommended_specialization"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return SymptomAssessmentCreateSerializer
        return SymptomAssessmentSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return SymptomAssessment.objects.none()

        if user.user_type == "patient":
            linked_users = Dependent.objects.filter(
                patient__user=user, linked_user__isnull=False
            ).values_list("linked_user", flat=True)

            return SymptomAssessment.objects.filter(
                models.Q(patient__user=user)
                | models.Q(dependent__patient__user=user)
                | models.Q(patient__user__in=linked_users)
            ).distinct()

        if user.user_type == "doctor":
            return SymptomAssessment.objects.filter(
                patient__appointments__doctor__user=user
            ).distinct()

        return SymptomAssessment.objects.none()

    def create(self, request, *args, **kwargs):
        if request.user.user_type != "patient":
            return Response(
                {"error": "Only patients can submit symptoms for AI analysis"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            patient = request.user.patient_profile
        except Patient.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        symptoms = serializer.validated_data["symptoms"]
        dependent_id = serializer.validated_data.get("dependent_id")
        dependent = None
        if dependent_id:
            try:
                dependent = Dependent.objects.get(id=dependent_id, patient=patient)
            except Dependent.DoesNotExist:
                return Response(
                    {"error": "Selected dependent was not found"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            ai_service = AIService()
            ai_results = ai_service.analyze_symptoms_only(symptoms)
        except Exception as e:
            return Response(
                {"error": f"AI analysis failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        specialization_map = {
            "Cardiologist": "cardiologist",
            "Neurologist": "neurologist",
            "Dermatologist": "dermatologist",
            "Orthopedic": "orthopedic",
            "Pediatrician": "pediatrician",
            "Psychiatrist": "psychiatrist",
            "Gynecologist": "gynecologist",
            "Oncologist": "oncologist",
            "Gastroenterologist": "gastroenterologist",
            "General Physician": "general_physician",
        }

        required_fields = [
            "recommended_specialization",
            "probable_conditions",
            "medication_guidance",
            "home_care_suggestions",
            "red_flags",
            "summary",
            "disclaimer",
        ]
        missing_fields = [field for field in required_fields if field not in ai_results]
        if missing_fields:
            return Response(
                {
                    "error": "AI analysis response is missing required fields",
                    "missing_fields": missing_fields,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        recommended_specialization = ai_results["recommended_specialization"]
        matching_doctors = Doctor.objects.filter(
            specialization=specialization_map.get(
                recommended_specialization, "general_physician"
            )
        )

        assessment = SymptomAssessment.objects.create(
            patient=patient,
            dependent=dependent,
            symptoms=symptoms,
            recommended_specialization=recommended_specialization,
            probable_conditions=ai_results["probable_conditions"],
            medication_guidance=ai_results["medication_guidance"],
            home_care_suggestions=ai_results["home_care_suggestions"],
            red_flags=ai_results["red_flags"],
            ai_summary=ai_results["summary"],
            disclaimer=ai_results["disclaimer"],
        )

        response_data = {
            "assessment": SymptomAssessmentSerializer(assessment).data,
            "matching_doctors": DoctorListSerializer(matching_doctors, many=True).data,
        }
        return Response(response_data, status=status.HTTP_201_CREATED)
