from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    patient_image = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            "id",
            "doctor",
            "patient",
            "patient_name",
            "patient_image",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "patient", "created_at", "updated_at")

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()

    def get_patient_image(self, obj):
        # This assumes we might have profile pics for patients later, or just return None
        return None
