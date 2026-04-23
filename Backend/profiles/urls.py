from django.urls import path
from .views import ProfileView, browse_profiles

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profiles/browse/', browse_profiles, name='browse-profiles'),
]
