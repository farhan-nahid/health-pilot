from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"doctors", views.DoctorViewSet, basename="doctor")

router.register(
    r"doctor-availability", views.DoctorAvailabilityViewSet, basename="doctor-availability"
)
router.register(
    r"doctor-documents", views.DoctorDocumentViewSet, basename="doctor-document",
)

urlpatterns = [
    path("", include(router.urls)),
]
