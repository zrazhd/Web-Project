from django.urls import path
from .views import ProfileView, browse_profiles, ProfilePhotoView, ProfilePhotoDetailView, set_main_photo

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/photos/', ProfilePhotoView.as_view(), name='profile-photos'),
    path('profile/photos/<int:pk>/', ProfilePhotoDetailView.as_view(), name='profile-photo-detail'),
    path('profile/photos/<int:pk>/set_main/', set_main_photo, name='profile-photo-set-main'),
    path('profiles/browse/', browse_profiles, name='browse-profiles'),
]
