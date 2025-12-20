from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import UserSettingsSerializer
from .models import UserSettings

class UserSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSettingsSerializer
    
    def get_object(self):
        settings, created = UserSettings.objects.get_or_create(user=self.request.user)
        return settings
