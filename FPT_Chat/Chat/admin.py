from django.contrib import admin

from Chat.models import *

admin.site.register(User)
admin.site.register(Conversation)
admin.site.register(Message)

