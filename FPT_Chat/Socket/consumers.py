import json
from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_group_name = None
        self.room_name = None

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        _type = text_data_json["_type"]
        message_id = text_data_json['message_id']
        call_id = text_data_json['call_id']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                '_type': _type,
                'message_id': message_id,
                'call_id': call_id
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message_id = event['message_id']
        _type = event['_type']
        call_id = event['call_id']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
                '_type': _type,
                'message_id': message_id,
                'call_id': call_id
        }))