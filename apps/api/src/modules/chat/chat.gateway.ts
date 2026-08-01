import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

type JoinRoomPayload = {
  associationId: string;
  userEmail?: string;
};

type SendMessagePayload = {
  associationId: string;
  userEmail: string;
  message: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('chat:join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinRoomPayload,
  ) {
    if (!body?.associationId) {
      return {
        success: false,
        message: 'associationId mancante',
      };
    }

    const room = `association:${body.associationId}`;

    client.join(room);

    client.to(room).emit('chat:user_joined', {
      associationId: body.associationId,
      userEmail: body.userEmail || 'Utente',
      joinedAt: new Date().toISOString(),
    });

    return {
      success: true,
      room,
    };
  }

  @SubscribeMessage('chat:send')
  handleSend(@MessageBody() body: SendMessagePayload) {
    if (!body?.associationId || !body?.message) {
      return {
        success: false,
        message: 'Dati messaggio mancanti',
      };
    }

    const room = `association:${body.associationId}`;

    const payload = {
      id: `msg-${Date.now()}`,
      associationId: body.associationId,
      userEmail: body.userEmail || 'Utente',
      message: body.message,
      createdAt: new Date().toISOString(),
    };

    this.server.to(room).emit('chat:message', payload);

    return {
      success: true,
      message: payload,
    };
  }
}