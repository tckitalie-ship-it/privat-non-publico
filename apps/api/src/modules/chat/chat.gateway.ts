import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    console.log(
      `🔌 Chat client connected: ${client.id}`,
    );
  }

  @SubscribeMessage('chat:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: {
      token: string;
    },
  ) {
    try {
      const payload =
        await this.jwtService.verifyAsync(
          body.token,
        );

      const associationId =
        payload.associationId;

      if (!associationId) {
        client.emit('chat:error', {
          message:
            'Associazione non trovata',
        });

        return;
      }

      client.data.user = payload;

      client.join(
        `association:${associationId}`,
      );

      client.emit('chat:joined', {
        success: true,
      });
    } catch (error) {
      client.emit('chat:error', {
        message: 'Token non valido',
      });
    }
  }

  @SubscribeMessage('chat:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: {
      token: string;
      message: string;
    },
  ) {
    try {
      const payload =
        await this.jwtService.verifyAsync(
          body.token,
        );

      const associationId =
        payload.associationId;

      if (!associationId) {
        client.emit('chat:error', {
          message:
            'Associazione non trovata',
        });

        return;
      }

      if (
        !body.message ||
        !body.message.trim()
      ) {
        return;
      }

      const chatMessage = {
        id: crypto.randomUUID(),
        userEmail: payload.email,
        message:
          body.message.trim(),
        createdAt:
          new Date().toISOString(),
      };

      this.server
        .to(
          `association:${associationId}`,
        )
        .emit(
          'chat:message',
          chatMessage,
        );
    } catch (error) {
      client.emit('chat:error', {
        message:
          'Errore invio messaggio',
      });
    }
  }
}