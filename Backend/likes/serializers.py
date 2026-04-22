from rest_framework import serializers
from .models import Like, Match
from django.contrib.auth import get_user_model

User = get_user_model()


class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'age', 'city', 'photoUrl', 'bio']


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

    class Meta:
        model = Match
        fields = ['id', 'user1', 'user2', 'created_at', 'matched_user']

    def get_matched_user(self, obj) -> dict:
        request = self.context.get('request')
        other = obj.user2 if (request and request.user == obj.user1) else obj.user1
        return UserShortSerializer(other).data
