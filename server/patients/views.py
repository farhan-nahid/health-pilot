from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Patient, MedicalReport, Dependent
from .serializers import PatientSerializer, PatientUpdateSerializer, MedicalReportSerializer, DependentSerializer
from .ai_service import AIService
from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer
from doctors.models import Doctor
from doctors.serializers import DoctorListSerializer

class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Patient.objects.none()
            
        if self.request.user.user_type == 'patient':
            return Patient.objects.filter(user=self.request.user)
        return Patient.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'update' or self.action == 'partial_update':
            return PatientUpdateSerializer
        return PatientSerializer
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current patient's profile"""
        if request.user.user_type != 'patient':
            return Response(
                {'error': 'Only patients can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            patient = request.user.patient_profile
            serializer = PatientSerializer(patient)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """Get consolidated dashboard summary for the current patient"""
        if request.user.user_type != 'patient':
            return Response(
                {'error': 'Only patients can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            patient = request.user.patient_profile
            
            # 1. Stats
            appointments = Appointment.objects.filter(patient=patient)
            reports = MedicalReport.objects.filter(patient=patient)
            
            stats = {
                'appointments_total': appointments.count(),
                'appointments_accepted': appointments.filter(status='accepted').count(),
                'appointments_completed': appointments.filter(status='completed').count(),
                'reports_total': reports.count(),
                'reports_analyzed': reports.exclude(ai_specialization__isnull=True).exclude(ai_specialization='').count(),
                'unique_specializations': list(reports.values_list('ai_specialization', flat=True).distinct().exclude(ai_specialization__isnull=True).exclude(ai_specialization=''))
            }
            
            # 2. Upcoming Consultations (Accepted ones)
            upcoming = appointments.filter(status='accepted').order_by('appointment_date', 'appointment_time')[:3]
            
            # 3. Recent Activity (Latest 5 items)
            # Combine latest appointments and reports
            recent_appointments = appointments.order_by('-updated_at')[:5]
            recent_reports = reports.order_by('-uploaded_at')[:5]
            
            activity_list = []
            for app in recent_appointments:
                activity_list.append({
                    'id': f'app-{app.id}',
                    'type': 'appointment',
                    'title': f'Appointment {app.status.capitalize()}',
                    'detail': f'With Dr. {app.doctor.user.get_full_name()}',
                    'date': app.updated_at,
                })
            
            for rep in recent_reports:
                activity_list.append({
                    'id': f'rep-{rep.id}',
                    'type': 'report',
                    'title': 'Medical Report Uploaded',
                    'detail': f'Analyzed as {rep.ai_specialization}' if rep.ai_specialization else 'Processing AI analysis...',
                    'date': rep.uploaded_at,
                })
            
            # Sort activity by date descending
            activity_list.sort(key=lambda x: x['date'], reverse=True)
            
            response_data = {
                'user': {
                    'name': request.user.get_full_name(),
                    'first_name': request.user.first_name,
                },
                'stats': stats,
                'upcoming_consultations': AppointmentSerializer(upcoming, many=True).data,
                'recent_activity': activity_list[:5]
            }
            
            return Response(response_data)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current patient's profile"""
        if request.user.user_type != 'patient':
            return Response(
                {'error': 'Only patients can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            patient = request.user.patient_profile
            serializer = PatientUpdateSerializer(patient, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(PatientSerializer(patient).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def appointments(self, request):
        """Get appointments for the current patient"""
        if request.user.user_type != 'patient':
            return Response(
                {'error': 'Only patients can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            patient = request.user.patient_profile
            appointments = Appointment.objects.filter(patient=patient)
            
            # Filter by status if provided
            status_filter = request.query_params.get('status', None)
            if status_filter:
                appointments = appointments.filter(status=status_filter)
            
            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class MedicalReportViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalReportSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['uploaded_at', 'ai_specialization']
    ordering = ['-uploaded_at']
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return MedicalReport.objects.none()
            
        if user.user_type == 'patient':
            # Similar logic to appointments
            # My reports OR reports of my dependents (managed or linked)
            
            linked_users = Dependent.objects.filter(patient__user=user, linked_user__isnull=False).values_list('linked_user', flat=True)
            
            from django.db import models
            return MedicalReport.objects.filter(
                models.Q(patient__user=user) |
                models.Q(dependent__patient__user=user) |
                models.Q(patient__user__in=linked_users)
            ).distinct()
            
        elif user.user_type == 'doctor':
            # Doctors can see reports from their appointments
            return MedicalReport.objects.filter(
                patient__appointments__doctor__user=user
            ).distinct()
        return MedicalReport.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Upload medical report and get AI analysis"""
        if request.user.user_type != 'patient':
            return Response(
                {'error': 'Only patients can upload medical reports'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            patient = request.user.patient_profile
            serializer = self.get_serializer(data=request.data)
            
            if serializer.is_valid():
                # Save the report first
                report_file = request.FILES.get('report_file')
                symptoms = request.data.get('symptoms', '')
                
                # Process with AI
                ai_service = AIService()
                try:
                    ai_results = ai_service.process_medical_report(report_file, symptoms)
                    
                    # Handle dependent
                    dependent_id = request.data.get('dependent_id')
                    dependent = None
                    if dependent_id:
                        try:
                            dependent = Dependent.objects.get(id=dependent_id, patient=patient)
                        except Dependent.DoesNotExist:
                            pass # Or raise error if strict validation needed

                    # Save report with AI analysis
                    medical_report = serializer.save(
                        patient=patient,
                        dependent=dependent,
                        extracted_text=ai_results['extracted_text'],
                        ai_specialization=ai_results['primary_specialization'],
                        ai_summary=ai_results['report_summary']
                    )
                    
                    # Get matching doctors
                    specialization_map = {
                        'Cardiologist': 'cardiologist',
                        'Neurologist': 'neurologist',
                        'Dermatologist': 'dermatologist',
                        'Orthopedic': 'orthopedic',
                        'Pediatrician': 'pediatrician',
                        'Psychiatrist': 'psychiatrist',
                        'Gynecologist': 'gynecologist',
                        'Oncologist': 'oncologist',
                        'Gastroenterologist': 'gastroenterologist',
                        'General Physician': 'general_physician',
                    }
                    
                    primary_spec = specialization_map.get(
                        ai_results['primary_specialization'], 
                        'general_physician'
                    )
                    
                    matching_doctors = Doctor.objects.filter(specialization=primary_spec)
                    
                    response_data = {
                        'report': MedicalReportSerializer(medical_report).data,
                        'ai_analysis': ai_results['symptom_analysis'],
                        'matching_doctors': DoctorListSerializer(matching_doctors, many=True).data
                    }
                    
                    return Response(response_data, status=status.HTTP_201_CREATED)
                
                except Exception as e:
                    return Response(
                        {'error': f'AI processing failed: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class DependentViewSet(viewsets.ModelViewSet):
    serializer_class = DependentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Dependent.objects.none()
            
        if self.request.user.user_type == 'patient':
            return Dependent.objects.filter(patient__user=self.request.user)
        return Dependent.objects.none()
    
    def perform_create(self, serializer):
        patient = self.request.user.patient_profile
        serializer.save(patient=patient)