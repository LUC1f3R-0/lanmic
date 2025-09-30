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
import { Logger } from '@nestjs/common';

/**
 * Simple WebSocket Gateway for Real-time Blog Updates
 * 
 * This is a simplified version that provides real-time updates
 * WITHOUT requiring Kafka or Docker. It directly broadcasts
 * events to connected clients when blog operations occur.
 * 
 * This approach is:
 * - Simpler to set up (no Docker needed)
 * - Easier to understand
 * - Perfect for development and small applications
 * - Still provides real-time updates
 */
@WSGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/blog-updates',
})
export class SimpleWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SimpleWebSocketGateway.name);
  private connectedClients = new Map<string, { socket: Socket; userId?: number }>();

  constructor() {}

  /**
   * Handle new WebSocket connections
   * Simplified authentication - accepts all connections for development
   */
  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client connected: ${client.id}`);

      // Extract JWT token from handshake auth or cookies (optional)
      const token = this.extractToken(client);
      
      // For simplified version, we accept connections even without authentication
      // In production, you might want to add proper authentication here
      let userId: number | undefined = undefined;
      if (token) {
        userId = this.extractUserIdFromToken(token);
        this.logger.log(`Client ${client.id} connected with authentication`);
      } else {
        this.logger.log(`Client ${client.id} connected without authentication (simplified mode)`);
      }

      // Store client information
      this.connectedClients.set(client.id, { socket: client, userId });
      
      // Join the admin room for blog updates
      client.join('admin-room');
      
      this.logger.log(`Client ${client.id} joined admin room`);
      client.emit('connected', { 
        message: 'Connected to blog updates',
        authenticated: !!userId 
      });

    } catch (error) {
      this.logger.error(`Error handling connection for client ${client.id}:`, error);
      client.emit('error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnections
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  /**
   * Handle client messages
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    client.emit('pong', { timestamp: Date.now() });
  }

  /**
   * Broadcast blog created event to all connected admin clients
   * This method is called when a new blog post is created
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
   */
  broadcastBlogPublished(blogData: any) {
    this.logger.log(`Broadcasting blog published status changed: ${blogData.id}`);
    this.server.to('admin-room').emit('blog-published', {
      type: 'blog-published',
      data: blogData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast team member created event to all connected admin clients
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
   */
  broadcastTeamMemberActive(teamMemberData: any) {
    this.logger.log(`Broadcasting team member active status changed: ${teamMemberData.id}`);
    this.server.to('admin-room').emit('team-member-active', {
      type: 'team-member-active',
      data: teamMemberData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast executive leadership created event to all connected admin clients
   */
  broadcastExecutiveLeadershipCreated(executiveLeadershipData: any) {
    this.logger.log(`Broadcasting executive leadership created: ${executiveLeadershipData.id}`);
    this.server.to('admin-room').emit('executive-leadership-created', {
      type: 'executive-leadership-created',
      data: executiveLeadershipData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast executive leadership updated event to all connected admin clients
   */
  broadcastExecutiveLeadershipUpdated(executiveLeadershipData: any) {
    this.logger.log(`Broadcasting executive leadership updated: ${executiveLeadershipData.id}`);
    this.server.to('admin-room').emit('executive-leadership-updated', {
      type: 'executive-leadership-updated',
      data: executiveLeadershipData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast executive leadership deleted event to all connected admin clients
   */
  broadcastExecutiveLeadershipDeleted(executiveLeadershipId: number) {
    this.logger.log(`Broadcasting executive leadership deleted: ${executiveLeadershipId}`);
    this.server.to('admin-room').emit('executive-leadership-deleted', {
      type: 'executive-leadership-deleted',
      data: { id: executiveLeadershipId },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast executive leadership active event to all connected admin clients
   */
  broadcastExecutiveLeadershipActive(executiveLeadershipData: any) {
    this.logger.log(`Broadcasting executive leadership active status changed: ${executiveLeadershipData.id}`);
    this.server.to('admin-room').emit('executive-leadership-active', {
      type: 'executive-leadership-active',
      data: executiveLeadershipData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get the number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Extract JWT token from WebSocket handshake
   * Looks for token in auth object or cookies
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
   * Broadcast testimonial created event to all connected admin clients
   */
  broadcastTestimonialCreated(testimonialData: any) {
    this.logger.log(`Broadcasting testimonial created: ${testimonialData.id}`);
    this.server.to('admin-room').emit('testimonial-created', {
      type: 'testimonial-created',
      data: testimonialData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast testimonial updated event to all connected admin clients
   */
  broadcastTestimonialUpdated(testimonialData: any) {
    this.logger.log(`Broadcasting testimonial updated: ${testimonialData.id}`);
    this.server.to('admin-room').emit('testimonial-updated', {
      type: 'testimonial-updated',
      data: testimonialData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast testimonial deleted event to all connected admin clients
   */
  broadcastTestimonialDeleted(testimonialId: number) {
    this.logger.log(`Broadcasting testimonial deleted: ${testimonialId}`);
    this.server.to('admin-room').emit('testimonial-deleted', {
      type: 'testimonial-deleted',
      data: { id: testimonialId },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast testimonial active event to all connected admin clients
   */
  broadcastTestimonialActive(testimonialData: any) {
    this.logger.log(`Broadcasting testimonial active status changed: ${testimonialData.id}`);
    this.server.to('admin-room').emit('testimonial-active', {
      type: 'testimonial-active',
      data: testimonialData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Extract user ID from JWT token
   * In a real implementation, you would decode and verify the JWT token
   * For now, this is a placeholder that returns a mock user ID
   */
  private extractUserIdFromToken(token: string): number | undefined {
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
      return undefined;
    }
  }
}
