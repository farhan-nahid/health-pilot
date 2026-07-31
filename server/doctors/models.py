from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from patients.models import Patient


class Doctor(models.Model):
    SPECIALIZATION_CHOICES = (
        ("cardiologist", "Cardiologist"),
        ("neurologist", "Neurologist"),
        ("dermatologist", "Dermatologist"),
        ("orthopedic", "Orthopedic"),
        ("pediatrician", "Pediatrician"),
        ("psychiatrist", "Psychiatrist"),
        ("gynecologist", "Gynecologist"),
        ("oncologist", "Oncologist"),
        ("gastroenterologist", "Gastroenterologist"),
        ("general_physician", "General Physician"),
    )

    VERIFICATION_STATUS_CHOICES = (
        ("pending", "Pending"),
        ("under_review", "Under Review"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="doctor_profile",
    )
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to="doctors/profiles/", blank=True, null=True
    )
    experience_years = models.IntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Verification
    bmdc_registration_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
    )
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default="pending",
    )
    verification_notes = models.TextField(blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.user.get_full_name():
            return f"Dr. {self.user.get_full_name()} - {self.specialization}"
        else:
            return self.user.email


class DoctorAvailability(models.Model):
    DAYS_OF_WEEK = (
        ("monday", "Monday"),
        ("tuesday", "Tuesday"),
        ("wednesday", "Wednesday"),
        ("thursday", "Thursday"),
        ("friday", "Friday"),
        ("saturday", "Saturday"),
        ("sunday", "Sunday"),
    )

    doctor = models.ForeignKey(
        Doctor, on_delete=models.CASCADE, related_name="availabilities"
    )
    day_of_week = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ("doctor", "day_of_week", "start_time")
        ordering = ["day_of_week", "start_time"]

    def __str__(self):
        return f"{self.doctor.user.get_full_name()} - {self.day_of_week} {self.start_time}-{self.end_time}"


class DoctorDocument(models.Model):
    DOCUMENT_TYPE_CHOICES = (
        ("bmdc_registration", "BM&DC Registration Certificate"),
        ("medical_degree", "Medical Degree Certificate"),
        ("internship", "Internship Certificate"),
        ("identity", "NID / Passport"),
        ("specialist_qualification", "Specialist Qualification"),
        ("additional_degree", "Additional Degree / Certificate"),
    )

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name="verification_documents",
    )
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to="doctors/verification_documents/")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
    reviewer_notes = models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["document_type", "-uploaded_at"]

    def __str__(self):
        return f"{self.doctor} - {self.get_document_type_display()}"
