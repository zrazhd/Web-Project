from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'gender', 'birthdate', 'created_at']
    search_fields = ['user__email', 'user__name', 'city']
    list_filter = ['gender']
    readonly_fields = ['created_at', 'updated_at']
