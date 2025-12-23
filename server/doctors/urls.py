from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DoctorViewSet, DoctorAvailabilityViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'doctor-availability', DoctorAvailabilityViewSet, basename='doctor-availability')

urlpatterns = [
    path('', include(router.urls)),
]
