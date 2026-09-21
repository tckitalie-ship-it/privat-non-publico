import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

type JoinRoomPayload = {
  associationId: string;
};

type SendMessagePayload = {
  associationId: string;
  message: string;
};

type AuthenticatedSocket = Socket & {
  user?: {
    id: string;
    email: string;
  };
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private async authenticateSocket(
    client: AuthenticatedSocket,
  ): Promise<boolean> {
    try {
      const authToken =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');

      if (!authToken) {
        client.disconnect();
        return false;
      }

      const payload = this.jwtService.verify(authToken);

      if (!payload?.sub || !payload?.email) {
        client.disconnect();
        return false;
      }

      client.user = {
        id: payload.sub,
        email: payload.email,
      };

      return true;
    } catch {
      client.disconnect();
      return false;
    }
  }

  private async ensureMembership(
    userId: string,
    associationId: string,
  ): Promise<boolean> {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_associationId: {
          userId,
          associationId,
        },
      },
      select: {
        id: true,
        association: {
          select: {
            isActive: true,
          },
        },
      },
    });

    return Boolean(membership?.association.isActive);
  }

  async handleConnection(client: AuthenticatedSocket) {
    await this.authenticateSocket(client);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    client.user = undefined;
  }

  @SubscribeMessage('chat:join')
  async handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: JoinRoomPayload,
  ) {
    if (!client.user) {
      return {
        success: false,
        message: 'Non autenticato',
      };
    }

    if (!body?.associationId) {
      return {
        success: false,
        message: 'associationId mancante',
      };
    }

    const allowed = await this.ensureMembership(
      client.user.id,
      body.associationId,
    );

    if (!allowed) {
      return {
        success: false,
        message: 'Non hai accesso a questa associazione',
      };
    }

    const room = `association:${body.associationId}`;

    await client.join(room);

    client.to(room).emit('chat:user_joined', {
      associationId: body.associationId,
      userEmail: client.user.email,
      joinedAt: new Date().toISOString(),
    });

    return {
      success: true,
      room,
    };
  }

  @SubscribeMessage('chat:send')
  async handleSend(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: SendMessagePayload,
  ) {
    if (!client.user) {
      return {
        success: false,
        message: 'Non autenticato',
      };
    }

    if (!body?.associationId || !body?.message) {
      return {
        success: false,
        message: 'Dati messaggio mancanti',
      };
    }

    const allowed = await this.ensureMembership(
      client.user.id,
      body.associationId,
    );

    if (!allowed) {
      return {
        success: false,
        message: 'Non hai accesso a questa associazione',
      };
    }

    const room = `association:${body.associationId}`;

    const payload = {
      id: `msg-${Date.now()}`,
      associationId: body.associationId,
      userEmail: client.user.email,
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
