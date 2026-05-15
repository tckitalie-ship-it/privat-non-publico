import {
  MessageBody,
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
export class NotificationsGateway {
  private static serverInstance: Server | null = null;

  @WebSocketServer()
  set server(server: Server) {
    NotificationsGateway.serverInstance = server;
  }

  static emitNotification(payload: any) {
    if (!NotificationsGateway.serverInstance) {
      return;
    }

    NotificationsGateway.serverInstance.emit('notification:new', payload);
  }

  @SubscribeMessage('notification:test')
  handleTest(@MessageBody() data: any) {
    NotificationsGateway.emitNotification({
      id: `test-${Date.now()}`,
      title: 'Test notification',
      message: data?.message || 'Realtime notification test',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }
}