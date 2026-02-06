from django.db import models
from django.conf import settings

class Patient(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_profile')
    date_of_birth = models.DateField(blank=True, null=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.user.get_full_name()

class MedicalReport(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_reports')
    dependent = models.ForeignKey('Dependent', on_delete=models.SET_NULL, null=True, blank=True, related_name='medical_reports')
    report_file = models.FileField(upload_to='medical_reports/')
    symptoms = models.TextField()
    ai_specialization = models.CharField(max_length=255, blank=True, null=True)
    ai_summary = models.TextField(blank=True, null=True)
    extracted_text = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Report for {self.patient.user.get_full_name()} - {self.uploaded_at}"


class Dependent(models.Model):
    RELATIONSHIP_CHOICES = (
        ('Son', 'Son'),
        ('Daughter', 'Daughter'),
        ('Spouse', 'Spouse'),
        ('Parent', 'Parent'),
        ('Other', 'Other'),
    )
    
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )

    BLOOD_GROUP_CHOICES = (
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    )

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='dependents')
    name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, blank=True, null=True)
    linked_user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='dependent_profile')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.relationship}) of {self.patient.user.get_full_name()}"
