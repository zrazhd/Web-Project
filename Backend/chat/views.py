from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model

from likes.models import Match
from .models import Message
from .serializers import MessageSerializer

User = get_user_model()


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        other_user = get_object_or_404(User, pk=user_id)

        # Ensure they are matched
        is_matched = Match.objects.filter(
            Q(user1=request.user, user2=other_user) | Q(user1=other_user, user2=request.user)
        ).exists()

        if not is_matched:
            return Response({'error': 'You can only message your matches.'}, status=status.HTTP_403_FORBIDDEN)

        # Mark messages as read that were sent to me
        # Optional basic feature
        Message.objects.filter(sender=other_user, receiver=request.user, is_read=False).update(is_read=True)

        messages = Message.objects.filter(
            Q(sender=request.user, receiver=other_user) | Q(sender=other_user, receiver=request.user)
        ).order_by('timestamp')

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, user_id):
        other_user = get_object_or_404(User, pk=user_id)

        is_matched = Match.objects.filter(
            Q(user1=request.user, user2=other_user) | Q(user1=other_user, user2=request.user)
        ).exists()

        if not is_matched:
            return Response({'error': 'You can only message your matches.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user, receiver=other_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
