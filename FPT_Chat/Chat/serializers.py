from .models import *
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from rest_framework.parsers import MultiPartParser, FileUploadParser


class UserSerializer(ModelSerializer):
    avatar = SerializerMethodField()

    def get_avatar(self, user):
        request = self.context['request']
        name = user.avatar.name
        if name.startswith('static/'):
            path = '/%s' % name
        else:
            path = '/static/%s' % name

        return request.build_absolute_uri(path) if name else None

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password', 'avatar']
        parser_classes = [MultiPartParser, ]

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(user.password)
        user.save()

        return user


class ConversationSerializer(ModelSerializer):
    class Meta:
        model = Conversation
        fields = '__all__'


class MessageSerializer(ModelSerializer):
    file = SerializerMethodField()

    def get_file(self, message):
        name = message.file
        request = self.context['request']

        if name:
            if name.startswith('static/'):
                path = '/%s' % name
            else:
                path = '/static/%s' % name
            return request.build_absolute_uri(path)
        else:
            return None

    class Meta:
        model = Message
        fields = '__all__'
        # parser_class = [FileUploadParser, ]
