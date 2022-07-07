from rest_framework.routers import DefaultRouter
from .views import *

routers = DefaultRouter()

routers.register('information', viewset=UserViewSet)
routers.register('conversation', viewset=ConversationViewSet)
routers.register('message', viewset=MessageViewSet)

urlpatterns = routers.urls
