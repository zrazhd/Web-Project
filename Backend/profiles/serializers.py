from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    """
    ModelSerializer — used for READ operations (GET).
    Includes user's name and a full photo URL.
    """
    name = serializers.CharField(source='user.name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    photo_url = serializers.SerializerMethodField()
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'name', 'email',
            'photo_url', 'bio', 'city',
            'gender', 'gender_display', 'birthdate',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_photo_url(self, obj) -> str | None:
        """Return absolute URL for the photo, or None if no photo."""
        if not obj.photo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.photo.url)
        return obj.photo.url


class ProfileUpdateSerializer(serializers.Serializer):
    """
    Plain Serializer — used for WRITE operations (POST / PUT).
    Accepts multipart/form-data (photo as file upload).
    """
    photo = serializers.ImageField(required=False, allow_null=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    gender = serializers.ChoiceField(
        choices=['M', 'F', 'O', ''],
        required=False,
        allow_blank=True,
    )
    birthdate = serializers.DateField(required=False, allow_null=True)

    def update(self, instance, validated_data):
        instance.bio = validated_data.get('bio', instance.bio)
        instance.city = validated_data.get('city', instance.city)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.birthdate = validated_data.get('birthdate', instance.birthdate)
        # Only update photo if a new file was provided
        if 'photo' in validated_data:
            instance.photo = validated_data['photo']
        instance.save()
        return instance

    def create(self, validated_data):
        user = self.context['request'].user
        return Profile.objects.create(user=user, **validated_data)
