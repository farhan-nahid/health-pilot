from rest_framework import serializers
from .models import Doctor, DoctorAvailability
from reviews.serializers import ReviewSerializer


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ("id", "day_of_week", "start_time", "end_time", "is_available")
        read_only_fields = ("id",)

    def validate(self, data):
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        day_of_week = data.get("day_of_week")

        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError("End time must be after start time.")

        # Get doctor from context or request user
        request = self.context.get("request")
        if request and hasattr(request.user, "doctor_profile"):
            doctor = request.user.doctor_profile

            # Check for overlapping slots
            # Note: This checks for EXACT match or overlaps for this doctor
            # A slot overlaps if (new_start < existing_end) AND (new_end > existing_start)
            overlapping = DoctorAvailability.objects.filter(
                doctor=doctor,
                day_of_week=day_of_week,
                start_time__lt=end_time,
                end_time__gt=start_time,
            )

            # If we are updating an existing instance, exclude it from overlap check
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)

            if overlapping.exists():
                raise serializers.ValidationError(
                    f"This time slot conflicts with an existing availability on {day_of_week.capitalize()}."
                )

        return data


class DoctorSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    availabilities = DoctorAvailabilitySerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Doctor
        fields = (
            "id",
            "user",
            "specialization",
            "bio",
            "profile_picture",
            "experience_years",
            "consultation_fee",
            "availabilities",
            "average_rating",
            "total_reviews",
            "reviews",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "email": obj.user.email,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
            "phone": obj.user.phone,
        }


class DoctorUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = (
            "specialization",
            "bio",
            "profile_picture",
            "experience_years",
            "consultation_fee",
        )


class DoctorListSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)

    class Meta:
        model = Doctor
        fields = (
            "id",
            "doctor_name",
            "specialization",
            "profile_picture",
            "experience_years",
            "consultation_fee",
            "average_rating",
            "total_reviews",
        )

    def get_doctor_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"
