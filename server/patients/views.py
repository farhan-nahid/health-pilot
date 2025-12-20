from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Patient, MedicalReport
from .serializers import PatientSerializer, PatientUpdateSerializer, MedicalReportSerializer
from .ai_service import AIService
from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer
from doctors.models import Doctor
from doctors.serializers import DoctorListSerializer

class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
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
    
    def get_queryset(self):
        if self.request.user.user_type == 'patient':
            return MedicalReport.objects.filter(patient__user=self.request.user)
        elif self.request.user.user_type == 'doctor':
            # Doctors can see reports from their appointments
            return MedicalReport.objects.filter(
                patient__appointments__doctor__user=self.request.user
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
                    
                    # Save report with AI analysis
                    medical_report = serializer.save(
                        patient=patient,
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