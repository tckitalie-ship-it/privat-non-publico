import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  emitEventsChanged(message = 'Eventi aggiornati') {
    this.server.emit('events:changed', {
      message,
    });
  }
}