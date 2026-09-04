import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

import {
  Server,
  Socket,
} from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
      'http://192.168.1.138:3000',
      'http://192.168.1.138:3002',
      'https://privat-non-publico-web-tckitalie-ship-its-projects.vercel.app',
    ],
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection
{
  @WebSocketServer()
  server: Server;

  private static serverInstance: Server;

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    NotificationsGateway.serverInstance =
      server;
  }

  async handleConnection(
    client: Socket,
  ) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload =
        await this.jwtService.verifyAsync(token);

      const userId = payload?.sub;

      if (!userId) {
        client.disconnect(true);
        return;
      }

      client.data.userId = userId;

      await client.join(
        `user:${userId}`,
      );
    } catch {
      client.disconnect(true);
    }
  }

  static emitNotification(
    payload: any,
  ) {
    const userId = payload?.userId;

    if (!userId) {
      return;
    }

    NotificationsGateway.serverInstance?.to(
      `user:${userId}`,
    ).emit(
      'notification:new',
      payload,
    );
  }
}
