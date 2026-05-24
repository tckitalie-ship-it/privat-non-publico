import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private static serverInstance: Server;

  afterInit(server: Server) {
    NotificationsGateway.serverInstance = server;
  }

  static emitNotification(payload: any) {
    NotificationsGateway.serverInstance?.emit('notification:new', payload);
  }

  @SubscribeMessage('notification:test')
  handleTest(@MessageBody() data: any) {
    const notification = {
      id: `test-${Date.now()}`,
      title: data?.title || 'Test notification',
      message: data?.message || 'Realtime notification test',
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.server.emit('notification:new', notification);

    return {
      success: true,
      notification,
    };
  }
}