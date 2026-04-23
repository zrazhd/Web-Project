from django.urls import path
from .views import ChatHistoryView

urlpatterns = [
    path('<int:user_id>/', ChatHistoryView.as_view(), name='chat-history'),
]
