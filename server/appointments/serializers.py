from rest_framework import serializers
from .models import Appointment
from doctors.serializers import DoctorListSerializer
from patients.models import Patient

class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ('doctor', 'medical_report', 'appointment_date', 'appointment_time', 'symptoms')
    
    def validate(self, data):
        # Check if the time slot is already booked
        existing = Appointment.objects.filter(
            doctor=data['doctor'],
            appointment_date=data['appointment_date'],
            appointment_time=data['appointment_time'],
            status__in=['pending', 'accepted']
        ).exists()
        
        if existing:
            raise serializers.ValidationError("This time slot is already booked.")
        
        # Validate that the appointment is for the requesting patient
        request = self.context.get('request')
        if request and hasattr(request.user, 'patient_profile'):
            data['patient'] = request.user.patient_profile
        else:
            raise serializers.ValidationError("Only patients can book appointments.")
        
        return data
    
    def create(self, validated_data):
        return Appointment.objects.create(**validated_data)

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_details = DoctorListSerializer(source='doctor', read_only=True)
    patient_details = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    medical_report_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = ('id', 'patient', 'patient_name', 'patient_details', 'doctor', 'doctor_details', 
                  'medical_report', 'medical_report_summary', 'appointment_date', 
                  'appointment_time', 'status', 'symptoms', 'doctor_notes', 
                  'rejection_reason', 'created_at', 'updated_at')
        read_only_fields = ('id', 'patient', 'created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()
    
    def get_medical_report_summary(self, obj):
        if obj.medical_report:
            return {
                'id': obj.medical_report.id,
                'ai_summary': obj.medical_report.ai_summary,
                'ai_specialization': obj.medical_report.ai_specialization,
            }
        return None

class AppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ('status', 'doctor_notes', 'rejection_reason')
    
    def validate_status(self, value):
        if value not in ['accepted', 'rejected', 'completed', 'cancelled']:
            raise serializers.ValidationError("Invalid status value.")
        return value