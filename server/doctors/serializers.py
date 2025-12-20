from rest_framework import serializers
from .models import Doctor, DoctorAvailability

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ('id', 'day_of_week', 'start_time', 'end_time', 'is_available')
        read_only_fields = ('id',)

class DoctorSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    availabilities = DoctorAvailabilitySerializer(many=True, read_only=True)
    
    class Meta:
        model = Doctor
        fields = ('id', 'user', 'specialization', 'bio', 'profile_picture', 
                  'experience_years', 'consultation_fee', 'availabilities', 
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'phone': obj.user.phone,
        }

class DoctorUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ('specialization', 'bio', 'profile_picture', 'experience_years', 'consultation_fee')

class DoctorListSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = ('id', 'doctor_name', 'specialization', 'profile_picture', 
                  'experience_years', 'consultation_fee')
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"