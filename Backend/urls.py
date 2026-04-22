from django.urls import path
from .views import LikeUserView, MatchListView

urlpatterns = [
    path('like/<int:to_user_id>/', LikeUserView.as_view(), name='like-user'),
    path('matches/', MatchListView.as_view(), name='match-list'),
]

# Include in main urls.py:
# path('api/', include('yourapp.urls')),
