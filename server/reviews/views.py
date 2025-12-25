from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Filter by doctor_id if provided in query params
        doctor_id = self.request.query_params.get('doctor_id', None)
        if doctor_id:
            return Review.objects.filter(doctor_id=doctor_id)

        # Filter by patient_id if provided
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id:
            return Review.objects.filter(patient_id=patient_id)
        
        # If user is a patient, show their reviews? OR just all reviews?
        # Requirement: "patient also see this all review"
        # Usually list endpoint should probably filtered. 
        # But per current logic in original view, it returns all unless filtered.
        return Review.objects.all()

    def create(self, request, *args, **kwargs):
        if request.user.user_type != 'patient':
            return Response(
                {'error': 'Only patients can leave reviews'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            patient = request.user.patient_profile
            data = request.data.copy()
            
            # If doctor is not provided in data, we can't create. 
            # Validating doctor existence happens in serializer or here.
            
            # Check for existing review
            doctor_id = data.get('doctor')
            if Review.objects.filter(doctor_id=doctor_id, patient=patient).exists():
                return Response(
                    {'error': 'You have already reviewed this doctor'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save(patient=patient)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except AttributeError:
             return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def update(self, request, *args, **kwargs):
        # Only allow patients to update their own reviews
        instance = self.get_object()
        if request.user.user_type != 'patient' or instance.patient.user != request.user:
             return Response(
                {'error': 'You can only edit your own reviews'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Only allow patients to delete their own reviews
        instance = self.get_object()
        if request.user.user_type != 'patient' or instance.patient.user != request.user:
             return Response(
                {'error': 'You can only delete your own reviews'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
