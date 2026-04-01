from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from doctors.models import Doctor
from patients.models import Patient


class Review(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="reviews")
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name="reviews"
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5",
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("doctor", "patient")  # One review per patient per doctor

    def __str__(self):
        # We need to handle potential access issues if related objects are deleted,
        # though on_delete=CASCADE should handle it.
        # Added safety for string representation
        doctor_name = (
            self.doctor.user.last_name
            if self.doctor and self.doctor.user
            else "Unknown"
        )
        patient_name = (
            self.patient.user.get_full_name()
            if self.patient and self.patient.user
            else "Unknown"
        )
        return f"Review for Dr. {doctor_name} by {patient_name}"
