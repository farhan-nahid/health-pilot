from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from patients.models import Patient

class Doctor(models.Model):
    SPECIALIZATION_CHOICES = (
        ('cardiologist', 'Cardiologist'),
        ('neurologist', 'Neurologist'),
        ('dermatologist', 'Dermatologist'),
        ('orthopedic', 'Orthopedic'),
        ('pediatrician', 'Pediatrician'),
        ('psychiatrist', 'Psychiatrist'),
        ('gynecologist', 'Gynecologist'),
        ('oncologist', 'Oncologist'),
        ('gastroenterologist', 'Gastroenterologist'),
        ('general_physician', 'General Physician'),
    )
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='doctors/profiles/', blank=True, null=True)
    experience_years = models.IntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialization}"

class DoctorAvailability(models.Model):
    DAYS_OF_WEEK = (
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    )
    
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('doctor', 'day_of_week', 'start_time')
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.doctor.user.get_full_name()} - {self.day_of_week} {self.start_time}-{self.end_time}"

class Review(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='reviews')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5"
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('doctor', 'patient')  # One review per patient per doctor
        
    def __str__(self):
        return f"Review for Dr. {self.doctor.user.last_name} by {self.patient.user.get_full_name()}"
