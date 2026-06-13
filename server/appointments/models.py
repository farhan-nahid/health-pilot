from django.db import models
from doctors.models import Doctor
from patients.models import Patient
from django.core.exceptions import ValidationError


class Appointment(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )

    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name="appointments"
    )
    dependent = models.ForeignKey(
        "patients.Dependent",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments",
    )
    doctor = models.ForeignKey(
        Doctor, on_delete=models.CASCADE, related_name="appointments"
    )
    medical_report = models.ForeignKey(
        "patients.MedicalReport", on_delete=models.SET_NULL, null=True, blank=True
    )
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    symptoms = models.TextField()
    doctor_notes = models.TextField(blank=True, null=True)
    prescription_data = models.JSONField(default=list, blank=True)
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateField(blank=True, null=True)
    follow_up_notes = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-appointment_date", "-appointment_time"]
        unique_together = ("doctor", "appointment_date", "appointment_time")

    def __str__(self):
        return f"{self.patient.user.get_full_name()} -> Dr. {self.doctor.user.get_full_name()} on {self.appointment_date}"


class ChatMessage(models.Model):
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    message = models.TextField()
    attachment = models.FileField(upload_to="chat_files/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)