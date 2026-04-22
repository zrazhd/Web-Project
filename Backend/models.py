from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Like(models.Model):
    """
    Represents a like from one user to another.
    ForeignKey -> User: from_user, to_user
    """
    from_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='likes_sent'
    )
    to_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='likes_received'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')  # prevent duplicate likes

    def __str__(self):
        return f"{self.from_user} → {self.to_user}"


class Match(models.Model):
    """
    Represents a mutual match between two users.
    Created automatically when a mutual Like is detected.
    ForeignKey -> User: user1, user2, created_at
    """
    user1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='matches_as_user1'
    )
    user2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='matches_as_user2'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"Match: {self.user1} ↔ {self.user2}"
