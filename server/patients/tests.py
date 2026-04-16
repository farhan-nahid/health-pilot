from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from patients.models import Patient, SymptomAssessment


class SymptomAssessmentCreateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="patient-tests@example.com",
            password="Pass12345!",
            user_type="patient",
            first_name="Patient",
            last_name="Tester",
        )
        self.patient = Patient.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)
        self.url = reverse("symptom-assessment-list")

    @patch("patients.ai_service.AIService._hf_generate")
    def test_create_symptom_assessment_with_truncated_ai_json_still_succeeds(
        self, mock_hf_generate
    ):
        mock_hf_generate.side_effect = [
            '{"probable_conditions": [{"name": "Influenza"',
            '{"probable_conditions": [{"name": "Viral URI", "likelihood": "medium", "reasoning": "Fever and sore throat are common."}], "recommended_specialization": "General Physician", "medication_guidance": [{"name": "Paracetamol", "purpose": "Fever relief", "dosage_note": "Use as directed", "warning": "Avoid overdose"}], "home_care_suggestions": ["Hydrate", "Rest"], "red_flags": ["Breathing difficulty"], "summary": "Likely viral illness.", "disclaimer": "This is educational guidance only and not a medical diagnosis."}',
        ]

        response = self.client.post(
            self.url,
            {
                "symptoms": "I have had fever, sore throat, and body ache for two days.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("assessment", response.data)
        self.assertEqual(SymptomAssessment.objects.count(), 1)

    @patch(
        "patients.ai_service.AIService._hf_generate",
        side_effect=Exception("provider timeout"),
    )
    def test_create_symptom_assessment_with_provider_failure_uses_fallback(
        self, _mock_hf_generate
    ):
        response = self.client.post(
            self.url,
            {
                "symptoms": "I have had fever, sore throat, and body ache for two days.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("assessment", response.data)
        self.assertEqual(
            response.data["assessment"]["recommended_specialization"],
            "General Physician",
        )
        self.assertEqual(SymptomAssessment.objects.count(), 1)
