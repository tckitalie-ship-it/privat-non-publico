import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuditLogService } from "./audit-log.service";
import { AuditLogTimelineMapperV2 } from "./audit-log-timeline-mapper-v2";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class AuditLogRealtimeGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly audit: AuditLogService) {}

  /**
   * Quando un client si connette
   */
  handleConnection(client: Socket) {
    console.log("Client connected:", client.id);
  }

  /**
   * Quando un client si disconnette
   */
  handleDisconnect(client: Socket) {
    console.log("Client disconnected:", client.id);
  }

  /**
   * Il frontend può iscriversi alla timeline di una specifica associazione
   */
  @SubscribeMessage("joinAssociation")
  async joinAssociation(
    @ConnectedSocket() client: Socket,
    @MessageBody() associationId: string
  ) {
    client.join(`association:${associationId}`);
    return { joined: associationId };
  }

  /**
   * Il frontend può iscriversi alla timeline personale dell’utente
   */
  @SubscribeMessage("joinUser")
  async joinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string
  ) {
    client.join(`user:${userId}`);
    return { joined: userId };
  }

  /**
   * Metodo chiamato dal tuo AuditLogService ogni volta che viene creato un log
   */
  async broadcastNewEvent(event: any) {
    const mapped = AuditLogTimelineMapperV2.mapEvent(event);

    // Broadcast all’associazione
    if (event.associationId) {
      this.server
        .to(`association:${event.associationId}`)
        .emit("auditEvent", mapped);
    }

    // Broadcast all’utente
    if (event.userId) {
      this.server.to(`user:${event.userId}`).emit("auditEvent", mapped);
    }

    // Broadcast globale (dashboard)
    this.server.emit("auditEventGlobal", mapped);
  }
}
