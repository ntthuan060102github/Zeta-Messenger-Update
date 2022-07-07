import random
import time
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
import requests
import datetime
from agora_token_builder import RtcTokenBuilder

from FPT_Chat.settings import MEDIA_ROOT
from .serializers import *


def save_file(file_input, full_path):
    with open(full_path, 'wb+') as f:
        for chunk in file_input.chunks():
            f.write(chunk)


class UserViewSet(viewsets.ViewSet,
                  generics.ListAPIView,
                  generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer

    @action(methods=['post'], detail=False, url_path='register')
    def register(self, request):
        data = UserSerializer(data=request.data)
        try:
            if data.is_valid():
                data.save()

                return Response({
                    'action': 'register',
                    'status': "success",
                    'detail': ""}, status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'action': 'register',
                'status': "fail",
                'detail': e
            }, status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'action': 'register',
                'status': "fail",
                'detail': "data_invalid"
            }, status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=False, url_path='login')
    def login(self, request):
        try:
            data = request.data
            userInfo = User.objects.filter(username=data['username']).first()

            if userInfo:
                if userInfo.check_password(data['password']):
                    token = requests.post('http://localhost:8000/verify/token/', json={
                        'username': data['username'],
                        'password': data['password']
                    })
                    res = token.json()
                    res['user_id'] = userInfo.id
                    return Response({
                        'action': 'login',
                        'status': "success",
                        'detail': "",
                        'data': res}, status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({
                'action': 'login',
                'status': "fail",
                'detail': e}, status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'action': 'login',
                'status': "fail",
                'detail': "not_found"
            }, status.HTTP_400_BAD_REQUEST)


class ConversationViewSet(viewsets.ViewSet,
                          generics.ListAPIView,
                          generics.CreateAPIView,
                          generics.RetrieveAPIView):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    VIDEO_CALL_SERVER_ID = "1365589bd68843f7a64ebf331a61763a"
    VIDEO_CALL_SERVER_CERTIFICATE = "268dc8b2148d432881be191d52a9ce29"

    # New Conversation
    def create(self, request, *args, **kwargs):
        try:
            req_members = request.data['members']
            if len(req_members) >= 2:
                if len(req_members) == 2:
                    check = Conversation.objects.filter(type=False) \
                        .filter(members=req_members[0]) \
                        .filter(members=req_members[1])

                    if check:
                        return Response({
                            'action': 'new_conversation',
                            'status': "redirect",
                            'detail': ""}, status=status.HTTP_303_SEE_OTHER)
                members_new = User.objects.filter(id__in=req_members)
                s = Conversation.objects.create(type=len(req_members) != 2)
                a = s.members.set(members_new)
                s.save()
                return Response({
                    'action': 'new_conversation',
                    'status': "success",
                    'detail': ""}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'action': 'new_conversation',
                'status': "fail",
                'detail': e}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'action': 'new_conversation',
                'status': "fail",
                'detail': ""}, status=status.HTTP_400_BAD_REQUEST)

    # Get Owner Conversations
    def retrieve(self, req, pk=None):
        try:
            query_res = Conversation.objects.filter(members__in=pk)
            res = self.serializer_class(query_res, many=True)
            if res:
                return Response({
                    'action': 'get_owner_conversation',
                    'status': "success",
                    'detail': "",
                    'data': res.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'action': 'get_owner_conversation',
                'status': "fail",
                'detail': ""}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'action': 'get_owner_conversation',
                'status': "fail",
                'detail': ""}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], detail=False, url_path="video-connecting")
    def video_call_connect(self, request):
        alphabet_numbers = "qwertyuiopasdfghjklzxcvbnm0123456789"
        room_name = ""
        for i in range(10):
            room_name += alphabet_numbers[random.randint(0, len(alphabet_numbers) - 1)]
        token = RtcTokenBuilder.buildTokenWithUid(self.VIDEO_CALL_SERVER_ID,
                                                  self.VIDEO_CALL_SERVER_CERTIFICATE,
                                                  room_name, 1, 1, time.time() + 3600 * 24)
        try:
            return Response({
                'action': 'video_call_connect',
                'status': "success",
                'detail': "",
                'data': {
                    "video_call_server_id": self.VIDEO_CALL_SERVER_ID,
                    "token": token,
                    "room_name": room_name
                }
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                'action': 'video_call_connect',
                'status': "fail",
                'detail': ""}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['get'], detail=False, url_path='video-calling')
    def get_room_token(self, request):
        try:
            channel = request.query_params['id']

            return Response({
                'action': 'get_room_token',
                'status': "success",
                'detail': "",
                'data': {"room_token": ""}}, status=status.HTTP_200_OK)
        except:
            return Response({
                'action': 'get_room_token',
                'status': "fail",
                'detail': ""}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MessageViewSet(viewsets.ViewSet,
                     generics.ListAPIView,
                     generics.CreateAPIView,
                     generics.RetrieveAPIView,
                     generics.UpdateAPIView):
    queryset = Message.objects.filter(conversation_id__isnull=False)
    serializer_class = MessageSerializer

    def create(self, request, *args, **kwargs):
        try:
            check = request.data.get('file') != 'null'

            if check:
                file = request.FILES['file']
                data = request.data.dict()
                data = MessageSerializer(data=data)
            else:
                data = MessageSerializer(data=request.data)

            if data.is_valid():
                data = data.save()
                if check:
                    now = datetime.datetime.now()
                    path = "uploads/" \
                           + str(now.year) + "/" \
                           + ("0" + str(now.month) if now.month < 10 else str(now.month)) \
                           + "/" + now.strftime("%f") + file.name

                    save_file(file, MEDIA_ROOT + path)
                    data = Message.objects.get(pk=data.id)
                    data.file = path
                    data.save(update_fields=['file'])

                data = Message.objects.filter(pk=data.id)
                res = MessageSerializer(data, many=True, context={'request': request})

                return Response({
                    'action': 'create_one_messages',
                    'status': "success",
                    'detail': "",
                    'data': res.data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'action': 'create_one_messages',
                'status': "fail",
                'detail': "",
                'data': e}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'action': 'create_one_messages',
                'status': "fail",
                'detail': "",
                'data': ""}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            i = request.GET.dict().get('id')

            if i:
                res_query = Message.objects.filter(id=i)
                # res_query = self.get_object()
                if res_query:
                    res = MessageSerializer(res_query, many=True, context={'request': request})
                    return Response({
                        'action': 'get_one_messages',
                        'status': "success",
                        'detail': "",
                        'data': res.data}, status=status.HTTP_200_OK)
            else:
                res_query = Message.objects.filter(conversation_id=pk)
                res = MessageSerializer(res_query, many=True, context={'request': request})
                return Response({
                    'action': 'get_owner_messages',
                    'status': "success",
                    'detail': "",
                    'data': res.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'action': 'get_owner_messages',
                'status': "fail",
                'detail': e}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'action': 'get_owner_messages',
                'status': "fail",
                'detail': ""}, status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        try:
            m = Message.objects.get(pk=pk)
            if m:
                m.is_recalled = True
                m.save()
                return Response({
                    'action': 'recall_messages',
                    'status': "success",
                    'detail': "",
                    'data': ""}, status=status.HTTP_200_OK)
        except:
            return Response({
                'action': 'recall_messages',
                'status': "fail",
                'detail': "",
                'data': ""}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'action': 'recall_messages',
                'status': "fail",
                'detail': "",
                'data': ""}, status=status.HTTP_400_BAD_REQUEST)
