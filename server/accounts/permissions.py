from rest_framework import permissions


class IsDoctor(permissions.BasePermission):
    """
    Custom permission to only allow doctors to access certain views.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type == "doctor"
        )


class IsPatient(permissions.BasePermission):
    """
    Custom permission to only allow patients to access certain views.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type == "patient"
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner
        if hasattr(obj, "user"):
            return obj.user == request.user
        return False


class IsDoctorOwner(permissions.BasePermission):
    """
    Custom permission to only allow the doctor who owns the profile to edit it.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.user_type == "doctor" and obj.user == request.user


class IsPatientOwner(permissions.BasePermission):
    """
    Custom permission to only allow the patient who owns the profile to edit it.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.user_type == "patient" and obj.user == request.user
