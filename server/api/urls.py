from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from drf_yasg import openapi
from .views import health_check
from accounts.views import PasswordResetConfirmAPI

schema_view = get_schema_view(
    openapi.Info(
        title="API",
        default_version="v1",
        description="API documentation",
        contact=openapi.Contact(email="mominurrohman774@gmail.com"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Health check endpoint (no auth required)
    path("health/", health_check, name="health-check"),
    path("admin/", admin.site.urls),
    path(
        "api/docs/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    # Authentication URLs
    path("api/auth/password/reset/confirm/", PasswordResetConfirmAPI.as_view(), name="password_reset_confirm"),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/auth/", include("dj_rest_auth.urls")),
    # App URLs
    path("api/", include("accounts.urls")),
    path("api/", include("doctors.urls")),
    path("api/", include("patients.urls")),
    path("api/", include("appointments.urls")),
    path("api/", include("reviews.urls")),
]

# Serve static files in production (handled by WhiteNoise)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
