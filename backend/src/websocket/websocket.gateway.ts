import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * WebSocket Gateway for Real-time Blog Updates
 *
 * This gateway handles WebSocket connections and broadcasts real-time blog updates
 * to connected clients. It integrates with Kafka to receive blog events and
 * immediately broadcast them to all connected admin users.
 *
 * Features:
 * - Real-time blog post updates (create, update, delete, publish)
 * - Authentication for WebSocket connections
 * - Room-based broadcasting for admin users
 * - Automatic reconnection handling
 */
@WSGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/blog-updates',
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private connectedClients = new Map<
    string,
    { socket: Socket; userId?: number }
  >();

  constructor() {}

  /**
   * Handle new WebSocket connections
   * Authenticates the user and adds them to the admin room for blog updates
   *
   * @param client - The WebSocket client connection
   */
  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client connected: ${client.id}`);

      // Extract JWT token from handshake auth or cookies
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Verify the token and get user info
      // In a real implementation, you would verify the JWT token here
      // For now, we'll assume the token is valid and add the client
      const userId = this.extractUserIdFromToken(token);

      if (!userId) {
        this.logger.warn(`Client ${client.id} connected with invalid token`);
        client.emit('error', { message: 'Invalid authentication token' });
        client.disconnect();
        return;
      }

      // Store client information
      this.connectedClients.set(client.id, { socket: client, userId });

      // Join the admin room for blog updates
      client.join('admin-room');

      this.logger.log(
        `Client ${client.id} authenticated and joined admin room`,
      );
      client.emit('connected', { message: 'Connected to blog updates' });
    } catch (error) {
      this.logger.error(
        `Error handling connection for client ${client.id}:`,
        error,
      );
      client.emit('error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnections
   * Removes the client from tracking and logs the disconnection
   *
   * @param client - The WebSocket client that disconnected
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  /**
   * Handle client messages
   * Currently used for ping/pong to keep connections alive
   *
   * @param client - The WebSocket client
   * @param payload - The message payload
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    client.emit('pong', { timestamp: Date.now() });
  }

  /**
   * Broadcast blog created event to all connected admin clients
   * This method is called when a new blog post is created
   *
   * @param blogData - The created blog post data
   */
  broadcastBlogCreated(blogData: any) {
    this.logger.log(`Broadcasting blog created: ${blogData.id}`);
    this.server.to('admin-room').emit('blog-created', {
      type: 'blog-created',
      data: blogData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast blog updated event to all connected admin clients
   * This method is called when a blog post is updated
   *
   * @param blogData - The updated blog post data
   */
  broadcastBlogUpdated(blogData: any) {
    this.logger.log(`Broadcasting blog updated: ${blogData.id}`);
    this.server.to('admin-room').emit('blog-updated', {
      type: 'blog-updated',
      data: blogData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast blog deleted event to all connected admin clients
   * This method is called when a blog post is deleted
   *
   * @param blogId - The ID of the deleted blog post
   */
  broadcastBlogDeleted(blogId: number) {
    this.logger.log(`Broadcasting blog deleted: ${blogId}`);
    this.server.to('admin-room').emit('blog-deleted', {
      type: 'blog-deleted',
      data: { id: blogId },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast blog published event to all connected admin clients
   * This method is called when a blog post's published status changes
   *
   * @param blogData - The blog post data with updated published status
   */
  broadcastBlogPublished(blogData: any) {
    this.logger.log(
      `Broadcasting blog published status changed: ${blogData.id}`,
    );
    this.server.to('admin-room').emit('blog-published', {
      type: 'blog-published',
      data: blogData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast team member created event to all connected admin clients
   * This method is called when a new team member is created
   *
   * @param teamMemberData - The created team member data
   */
  broadcastTeamMemberCreated(teamMemberData: any) {
    this.logger.log(`Broadcasting team member created: ${teamMemberData.id}`);
    this.server.to('admin-room').emit('team-member-created', {
      type: 'team-member-created',
      data: teamMemberData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast team member updated event to all connected admin clients
   * This method is called when a team member is updated
   *
   * @param teamMemberData - The updated team member data
   */
  broadcastTeamMemberUpdated(teamMemberData: any) {
    this.logger.log(`Broadcasting team member updated: ${teamMemberData.id}`);
    this.server.to('admin-room').emit('team-member-updated', {
      type: 'team-member-updated',
      data: teamMemberData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast team member deleted event to all connected admin clients
   * This method is called when a team member is deleted
   *
   * @param teamMemberId - The ID of the deleted team member
   */
  broadcastTeamMemberDeleted(teamMemberId: number) {
    this.logger.log(`Broadcasting team member deleted: ${teamMemberId}`);
    this.server.to('admin-room').emit('team-member-deleted', {
      type: 'team-member-deleted',
      data: { id: teamMemberId },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast team member active event to all connected admin clients
   * This method is called when a team member's active status changes
   *
   * @param teamMemberData - The team member data with updated active status
   */
  broadcastTeamMemberActive(teamMemberData: any) {
    this.logger.log(
      `Broadcasting team member active status changed: ${teamMemberData.id}`,
    );
    this.server.to('admin-room').emit('team-member-active', {
      type: 'team-member-active',
      data: teamMemberData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get the number of connected clients
   * Useful for monitoring and debugging
   *
   * @returns number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Extract JWT token from WebSocket handshake
   * Looks for token in auth object or cookies
   *
   * @param client - The WebSocket client
   * @returns JWT token string or null
   */
  private extractToken(client: Socket): string | null {
    // Try to get token from handshake auth
    const authToken = client.handshake.auth?.token;
    if (authToken) {
      return authToken;
    }

    // Try to get token from cookies
    const cookies = client.handshake.headers.cookie;
    if (cookies) {
      const tokenMatch = cookies.match(/access_token=([^;]+)/);
      if (tokenMatch) {
        return tokenMatch[1];
      }
    }

    return null;
  }

  /**
   * Extract user ID from JWT token
   * In a real implementation, you would decode and verify the JWT token
   * For now, this is a placeholder that returns a mock user ID
   *
   * @param token - JWT token string
   * @returns user ID or null if invalid
   */
  private extractUserIdFromToken(token: string): number | null {
    try {
      // In a real implementation, you would:
      // 1. Verify the JWT token signature
      // 2. Check token expiration
      // 3. Extract user ID from token payload
      // 4. Validate user permissions

      // For now, we'll return a mock user ID
      // This should be replaced with proper JWT verification
      return 1; // Mock user ID
    } catch (error) {
      this.logger.error('Error extracting user ID from token:', error);
      return null;
    }
  }
}
