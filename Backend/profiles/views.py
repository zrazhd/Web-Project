from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Profile
from .serializers import ProfileSerializer, ProfileUpdateSerializer


class ProfileView(APIView):
    """
    CBV: Full CRUD for the current user's profile.

    GET    /api/profile/  — retrieve own profile
    POST   /api/profile/  — create profile (multipart/form-data)
    PUT    /api/profile/  — update profile (multipart/form-data)
    DELETE /api/profile/  — delete profile
    """
    permission_classes = [IsAuthenticated]

    def _get_profile_or_none(self, user):
        """Return the profile for user, or None if it doesn't exist."""
        try:
            return user.profile
        except Profile.DoesNotExist:
            return None

    def get(self, request):
        profile = self._get_profile_or_none(request.user)
        if profile is None:
            return Response(
                {'error': 'Profile not found. Please create one.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        # Prevent creating a second profile
        if self._get_profile_or_none(request.user) is not None:
            return Response(
                {'error': 'Profile already exists. Use PUT to update.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ProfileUpdateSerializer(
            data=request.data, context={'request': request}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        profile = serializer.save()
        return Response(
            ProfileSerializer(profile, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    def put(self, request):
        profile = self._get_profile_or_none(request.user)
        if profile is None:
            return Response(
                {'error': 'Profile not found. Use POST to create one first.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ProfileUpdateSerializer(
            profile, data=request.data, partial=True, context={'request': request}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        profile = serializer.save()
        return Response(ProfileSerializer(profile, context={'request': request}).data)

    def delete(self, request):
        profile = self._get_profile_or_none(request.user)
        if profile is None:
            return Response(
                {'error': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        profile.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def browse_profiles(request):
    """
    FBV: GET /api/profiles/browse/
    Returns profiles of all users EXCEPT the current user.
    """
    profiles = Profile.objects.select_related('user').exclude(user=request.user)
    serializer = ProfileSerializer(profiles, many=True, context={'request': request})
    return Response(serializer.data)
