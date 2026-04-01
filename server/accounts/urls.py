from django.urls import path
from .views import UserSettingsView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

urlpatterns = [
    path("user/settings/", UserSettingsView.as_view(), name="user-settings"),
]
urlpatterns += router.urls
