from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    ordering = ("email",)
    list_display = ("email", "user_type", "is_staff", "is_active")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("user_type", "phone")}),
        ("Permissions", {"fields": ("is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "is_staff", "is_superuser"),
        }),
    )

    search_fields = ("email",)