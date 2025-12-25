from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import User

class CustomRegisterSerializer(RegisterSerializer):
    username = None
    user_type = serializers.ChoiceField(choices=User.USER_TYPE_CHOICES)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    phone = serializers.CharField(required=False)
    
    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['user_type'] = self.validated_data.get('user_type', '')
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        data['phone'] = self.validated_data.get('phone', '')
        return data
    
    def save(self, request):
        user = super().save(request)
        user.user_type = self.validated_data.get('user_type')
        user.first_name = self.validated_data.get('first_name')
        user.last_name = self.validated_data.get('last_name')
        user.phone = self.validated_data.get('phone', '')
        user.save()
        
        if user.user_type == 'patient':
            from patients.models import Patient
            Patient.objects.create(user=user)
        elif user.user_type == 'doctor':
            from doctors.models import Doctor
            Doctor.objects.create(user=user, specialization='general_physician')
        
        return user

class UserSerializer(serializers.ModelSerializer):
    patient_profile = serializers.SerializerMethodField()
    doctor_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'user_type', 'phone', 'patient_profile', 'doctor_profile')
        read_only_fields = ('id', 'email')

    def get_patient_profile(self, obj):
        if hasattr(obj, 'patient_profile'):
            return {'id': obj.patient_profile.id}
        return None

    def get_doctor_profile(self, obj):
        if hasattr(obj, 'doctor_profile'):
            return {'id': obj.doctor_profile.id}
        return None


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import UserSettings
        model = UserSettings
        fields = ('appointment_reminders', 'health_tips', 'security_alerts', 'two_factor_auth')
