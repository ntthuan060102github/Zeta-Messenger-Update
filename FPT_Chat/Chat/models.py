from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    avatar = models.ImageField(upload_to='uploads/%Y/%m', default="uploads/noAvatar.png")


class Conversation(models.Model):
    members = models.ManyToManyField(User, related_name='conversation')
    type = models.BooleanField(default=False)


class Message(models.Model):
    TYPE_MESSAGE = (
        ("T", "TEXT"),
        ("I", "IMAGE"),
        ("V", "VIDEO")
    )

    content = models.CharField(max_length=255, blank=True, null=True)
    file = models.CharField(max_length=255, null=True, blank=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True, related_name='conversation')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    type = models.CharField(max_length=2, choices=TYPE_MESSAGE, default="T")
    is_recalled = models.BooleanField(default=False)

