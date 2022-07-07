from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('verify/', include('Verify.urls')),
    path('users/', include('Chat.urls'))
]
