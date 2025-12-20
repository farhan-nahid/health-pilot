from django.db import models
from doctors.models import Doctor
from patients.models import Patient

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    medical_report = models.ForeignKey('patients.MedicalReport', on_delete=models.SET_NULL, null=True, blank=True)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    symptoms = models.TextField()
    doctor_notes = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-appointment_date', '-appointment_time']
        unique_together = ('doctor', 'appointment_date', 'appointment_time')
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} -> Dr. {self.doctor.user.get_full_name()} on {self.appointment_date}"