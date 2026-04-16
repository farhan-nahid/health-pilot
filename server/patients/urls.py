from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DependentViewSet,
    MedicalReportViewSet,
    PatientViewSet,
    SymptomAssessmentViewSet,
)

router = DefaultRouter()
router.register(r"patients", PatientViewSet, basename="patient")
router.register(r"medical-reports", MedicalReportViewSet, basename="medical-report")
router.register(r"dependents", DependentViewSet, basename="dependent")
router.register(
    r"symptom-assessments", SymptomAssessmentViewSet, basename="symptom-assessment"
)


urlpatterns = [
    path("", include(router.urls)),
]
