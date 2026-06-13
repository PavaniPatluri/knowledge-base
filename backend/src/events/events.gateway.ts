import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-team')
  handleJoinTeam(@MessageBody() teamId: string, @ConnectedSocket() client: Socket) {
    if (client && typeof client.join === 'function') {
      client.join(`team_${teamId}`);
      this.logger.log(`Client ${client.id} joined team_${teamId}`);
    }
  }

  // Exposed method to emit notifications from other services
  sendToUser(userId: string, event: string, payload: any) {
    this.server.to(`user_${userId}`).emit(event, payload);
  }

  broadcastToTeam(teamId: string, event: string, payload: any) {
    this.server.to(`team_${teamId}`).emit(event, payload);
  }
}
