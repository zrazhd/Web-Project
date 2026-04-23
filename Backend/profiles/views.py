from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Profile, ProfilePhoto
from .serializers import ProfileSerializer, ProfileUpdateSerializer, ProfilePhotoSerializer


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
    profiles = Profile.objects.select_related('user').prefetch_related('additional_photos').exclude(user=request.user)
    serializer = ProfileSerializer(profiles, many=True, context={'request': request})
    return Response(serializer.data)

class ProfilePhotoView(APIView):
    """
    Handle additional profile photos.
    POST /api/profile/photos/ - Upload new photo
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        if profile.additional_photos.count() >= 5:
            return Response({'error': 'Maximum of 5 additional photos allowed.'}, status=status.HTTP_400_BAD_REQUEST)

        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)

        photo = ProfilePhoto.objects.create(profile=profile, image=image)
        serializer = ProfilePhotoSerializer(photo, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProfilePhotoDetailView(APIView):
    """
    Handle specific additional profile photo operations.
    DELETE /api/profile/photos/<pk>/ - Delete photo
    POST /api/profile/photos/<pk>/set_main/ - Swap with main Profile.photo
    """
    permission_classes = [IsAuthenticated]

    def get_photo(self, user, pk):
        try:
            profile = user.profile
            return get_object_or_404(ProfilePhoto, pk=pk, profile=profile)
        except Profile.DoesNotExist:
            return None

    def delete(self, request, pk):
        photo = self.get_photo(request.user, pk)
        if not photo:
            return Response({'error': 'Photo not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        photo.image.delete(save=False)
        photo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_main_photo(request, pk):
    try:
        profile = request.user.profile
        photo = get_object_or_404(ProfilePhoto, pk=pk, profile=profile)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Swap images
    temp_image = profile.photo
    profile.photo = photo.image
    photo.image = temp_image
    
    profile.save()
    if photo.image:
        photo.save()
    else:
        # If the main avatar was empty, the additional photo loses its image and we should just delete it
        photo.delete()

    return Response({'message': 'Main photo updated', 'photo_url': request.build_absolute_uri(profile.photo.url) if profile.photo else None})
