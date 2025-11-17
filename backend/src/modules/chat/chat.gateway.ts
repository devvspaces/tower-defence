import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsJwtGuard } from './ws-jwt.guard';
import { AuthJwtService } from '../auth/application/jwt.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  walletAddress?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: AuthJwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify token
      const payload = await this.jwtService.verifyAccessToken(token);
      client.userId = payload.sub;
      client.walletAddress = payload.walletAddress;

      // Store connection
      this.connectedUsers.set(client.id, client);

      console.log(`User connected: ${client.walletAddress} (${client.id})`);

      // Send recent messages to the newly connected client
      const recentMessages = await this.chatService.getRecentMessages(50);
      client.emit('chat:history', recentMessages);

      // Notify others
      this.server.emit('chat:userJoined', {
        walletAddress: client.walletAddress,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedUsers.delete(client.id);

    if (client.walletAddress) {
      console.log(`User disconnected: ${client.walletAddress} (${client.id})`);

      this.server.emit('chat:userLeft', {
        walletAddress: client.walletAddress,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('chat:sendMessage')
  async handleMessage(
    @MessageBody() data: { message: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId || !client.walletAddress) {
      return { error: 'Unauthorized' };
    }

    if (!data.message || data.message.trim().length === 0) {
      return { error: 'Message cannot be empty' };
    }

    if (data.message.length > 500) {
      return { error: 'Message too long (max 500 characters)' };
    }

    try {
      // Save message to database
      const savedMessage = await this.chatService.createMessage(
        client.userId,
        data.message.trim(),
      );

      // Broadcast to all connected clients
      this.server.emit('chat:newMessage', savedMessage);

      return { success: true };
    } catch (error) {
      console.error('Failed to send message:', error);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('chat:typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (client.walletAddress) {
      client.broadcast.emit('chat:userTyping', {
        walletAddress: client.walletAddress,
      });
    }
  }
}
