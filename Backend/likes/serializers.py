from rest_framework import serializers
from .models import Like, Match
from django.contrib.auth import get_user_model

User = get_user_model()


class UserShortSerializer(serializers.ModelSerializer):
    photoUrl = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    additional_photos = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'age', 'city', 'photoUrl', 'bio', 'additional_photos']

    def get_photoUrl(self, obj) -> str | None:
        try:
            profile = getattr(obj, 'profile', None)
            if profile and profile.photo:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(profile.photo.url)
                return profile.photo.url
        except Exception:
            pass
        return getattr(obj, 'photoUrl', None) or ""

    def get_additional_photos(self, obj) -> list:
        try:
            profile = getattr(obj, 'profile', None)
            if profile:
                from profiles.serializers import ProfilePhotoSerializer
                return ProfilePhotoSerializer(profile.additional_photos.all(), many=True, context=self.context).data
        except Exception:
            pass
        return []

    def get_age(self, obj) -> int | None:
        try:
            profile = getattr(obj, 'profile', None)
            if profile and profile.birthdate:
                from datetime import date
                today = date.today()
                b = profile.birthdate
                return today.year - b.year - ((today.month, today.day) < (b.month, b.day))
        except Exception:
            pass
        return getattr(obj, 'age', None)

    def get_city(self, obj) -> str:
        try:
            profile = getattr(obj, 'profile', None)
            if profile and profile.city:
                return profile.city
        except Exception:
            pass
        return getattr(obj, 'city', "")

    def get_bio(self, obj) -> str:
        try:
            profile = getattr(obj, 'profile', None)
            if profile and profile.bio:
                return profile.bio
        except Exception:
            pass
        return getattr(obj, 'bio', "")


class LikeSerializer(serializers.ModelSerializer):
    is_match = serializers.SerializerMethodField()

    class Meta:
        model = Like
        fields = ['id', 'from_user', 'to_user', 'is_match']

    def get_is_match(self, obj) -> bool:
        return Match.objects.filter(
            user1=obj.from_user, user2=obj.to_user
        ).exists() or Match.objects.filter(
            user1=obj.to_user, user2=obj.from_user
        ).exists()


class MatchSerializer(serializers.ModelSerializer):
    matched_user = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['id', 'user1', 'user2', 'created_at', 'matched_user', 'unread_count']

    def get_matched_user(self, obj) -> dict:
        request = self.context.get('request')
        other = obj.user2 if (request and request.user == obj.user1) else obj.user1
        return UserShortSerializer(other, context=self.context).data

    def get_unread_count(self, obj) -> int:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        try:
            from chat.models import Message
            other = obj.user2 if (request and request.user == obj.user1) else obj.user1
            return Message.objects.filter(sender=other, receiver=request.user, is_read=False).count()
        except ImportError:
            return 0
