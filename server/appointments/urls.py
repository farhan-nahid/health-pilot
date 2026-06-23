from django.urls import path, include
from rest_framework.routers import DefaultRouter
from appointments import views

router = DefaultRouter()
router.register(r"appointments", views.AppointmentViewSet, basename="appointment")

urlpatterns = [
    path("", include(router.urls)),
    # Chat
    path(
        "chat/<int:appointment_id>/messages/",
        views.ChatMessageListView.as_view(),
        name="get_message",
    ),
    path("chat/send/", views.SendMessageView.as_view(), name="send_message"),
]
