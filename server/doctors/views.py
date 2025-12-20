from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Doctor, DoctorAvailability
from .serializers import (
    DoctorSerializer, DoctorUpdateSerializer, 
    DoctorAvailabilitySerializer, DoctorListSerializer
)
from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer

class DoctorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type == 'doctor':
            return Doctor.objects.filter(user=self.request.user)
        return Doctor.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'update' or self.action == 'partial_update':
            return DoctorUpdateSerializer
        if self.action == 'list':
            return DoctorListSerializer
        return DoctorSerializer
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current doctor's profile"""
        if request.user.user_type != 'doctor':
            return Response(
                {'error': 'Only doctors can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            doctor = request.user.doctor_profile
            serializer = DoctorSerializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Doctor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current doctor's profile"""
        if request.user.user_type != 'doctor':
            return Response(
                {'error': 'Only doctors can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
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
                {'error': 'Doctor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def by_specialization(self, request):
        """Get doctors by specialization"""
        specialization = request.query_params.get('specialization', None)
        if not specialization:
            return Response(
                {'error': 'Specialization parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        doctors = Doctor.objects.filter(specialization__icontains=specialization)
        serializer = DoctorListSerializer(doctors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def appointments(self, request):
        """Get appointments for the current doctor"""
        if request.user.user_type != 'doctor':
            return Response(
                {'error': 'Only doctors can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            doctor = request.user.doctor_profile
            appointments = Appointment.objects.filter(doctor=doctor)
            
            # Filter by status if provided
            status_filter = request.query_params.get('status', None)
            if status_filter:
                appointments = appointments.filter(status=status_filter)
            
            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Doctor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class DoctorAvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type == 'doctor':
            return DoctorAvailability.objects.filter(doctor__user=self.request.user)
        
        # For patients, get availability for specific doctor
        doctor_id = self.request.query_params.get('doctor_id', None)
        if doctor_id:
            return DoctorAvailability.objects.filter(doctor_id=doctor_id, is_available=True)
        
        return DoctorAvailability.objects.none()
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type != 'doctor':
            return Response(
                {'error': 'Only doctors can create availability slots'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            doctor = request.user.doctor_profile
            data = request.data.copy()
            
            # Support bulk creation
            if isinstance(data, list):
                created_slots = []
                for slot_data in data:
                    slot_data['doctor'] = doctor.id
                    serializer = self.get_serializer(data=slot_data)
                    if serializer.is_valid():
                        availability = serializer.save(doctor=doctor)
                        created_slots.append(serializer.data)
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                return Response(created_slots, status=status.HTTP_201_CREATED)
            else:
                serializer = self.get_serializer(data=data)
                if serializer.is_valid():
                    serializer.save(doctor=doctor)
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Doctor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )