from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Like, Match
from .serializers import LikeSerializer, MatchSerializer

User = get_user_model()


class LikeUserView(APIView):
    """
    FBV-style class view: like_user
    POST   /api/like/<to_user_id>/  — like a user, creates Match if mutual
    DELETE /api/like/<to_user_id>/  — remove like
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, to_user_id):
        to_user = get_object_or_404(User, pk=to_user_id)

        if to_user == request.user:
            return Response(
                {'error': 'You cannot like yourself.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent duplicate likes
        if Like.objects.filter(from_user=request.user, to_user=to_user).exists():
            return Response(
                {'error': 'Already liked this user.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        like = Like.objects.create(from_user=request.user, to_user=to_user)

        # Check for mutual like → create Match
        is_match = False
        mutual = Like.objects.filter(from_user=to_user, to_user=request.user).exists()
        if mutual:
            # user1 always has the smaller id (avoids duplicate Match rows)
            u1, u2 = sorted([request.user, to_user], key=lambda u: u.id)
            Match.objects.get_or_create(user1=u1, user2=u2)
            is_match = True

        serializer = LikeSerializer(like)
        data = serializer.data
        data['is_match'] = is_match
        return Response(data, status=status.HTTP_201_CREATED)

    def delete(self, request, to_user_id):
        to_user = get_object_or_404(User, pk=to_user_id)
        like = Like.objects.filter(from_user=request.user, to_user=to_user).first()
        if not like:
            return Response(
                {'error': 'Like not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        like.delete()

        # Remove match if it existed
        Match.objects.filter(
            user1__in=[request.user, to_user],
            user2__in=[request.user, to_user]
        ).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class MatchListView(APIView):
    """
    CBV: MatchListView — list of matches for the current user.
    GET /api/matches/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        matches = Match.objects.filter(
            user1=request.user
        ) | Match.objects.filter(
            user2=request.user
        )
        matches = matches.order_by('-created_at')
        serializer = MatchSerializer(matches, many=True, context={'request': request})
        return Response(serializer.data)
