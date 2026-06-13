import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UserRole } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { DatabaseService } from '../database.service';

interface AccessTokenPayload {
  sub: number;
  sid: string;
  tv: number;
  type: 'access';
  exp: number;
}

interface SocketIdentity {
  userId: number;
  role: UserRole;
  sessionId: string;
  expiresAt: number;
}

@WebSocketGateway({
  namespace: '/blog-updates',
  cors: {
    origin: (origin, callback) => {
      const allowedOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed'));
    },
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 100_000,
  perMessageDeflate: false,
})
export class SimpleWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SimpleWebSocketGateway.name);
  private readonly connectedClients = new Map<string, SocketIdentity | null>();
  private readonly expiryTimers = new Map<string, NodeJS.Timeout>();
  private readonly pingWindows = new Map<
    string,
    { count: number; resetAt: number }
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    await client.join('public-room');

    const identity = await this.authenticate(client);
    if (identity) {
      this.connectedClients.set(client.id, identity);
      if (
        identity.role === UserRole.ADMIN ||
        identity.role === UserRole.EDITOR
      ) {
        await client.join('admin-room');
      }
      this.scheduleExpiryDisconnect(client, identity.expiresAt);
      client.emit('connected', {
        authenticated: true,
        role: identity.role,
      });
      return;
    }

    this.connectedClients.set(client.id, null);
    client.emit('connected', { authenticated: false });
  }

  handleDisconnect(client: Socket): void {
    this.connectedClients.delete(client.id);
    this.pingWindows.delete(client.id);
    const timer = this.expiryTimers.get(client.id);
    if (timer) clearTimeout(timer);
    this.expiryTimers.delete(client.id);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    const now = Date.now();
    const window = this.pingWindows.get(client.id);

    if (!window || window.resetAt <= now) {
      this.pingWindows.set(client.id, { count: 1, resetAt: now + 10_000 });
      client.emit('pong', { timestamp: now });
      return;
    }

    window.count += 1;
    if (window.count > 10) {
      client.disconnect(true);
      return;
    }

    client.emit('pong', { timestamp: now });
  }

  broadcastBlogCreated(
    data: Record<string, unknown> & { published?: boolean },
  ): void {
    this.emitAdmin('blog-created', data);
    if (data.published) this.emitPublic('blog-created', data);
  }

  broadcastBlogUpdated(
    data: Record<string, unknown> & { published?: boolean },
  ): void {
    this.emitAdmin('blog-updated', data);
    this.emitPublic(
      data.published ? 'blog-updated' : 'blog-deleted',
      data.published ? data : { id: data.id },
    );
  }

  broadcastBlogDeleted(id: number): void {
    this.emitAdmin('blog-deleted', { id });
    this.emitPublic('blog-deleted', { id });
  }

  broadcastBlogPublished(
    data: Record<string, unknown> & { published?: boolean },
  ): void {
    this.emitAdmin('blog-published', data);
    this.emitPublic('blog-published', data);
  }

  broadcastTeamMemberCreated(
    data: Record<string, unknown> & { isActive?: boolean },
  ): void {
    this.emitAdmin('team-member-created', data);
    if (data.isActive) this.emitPublic('team-member-created', data);
  }

  broadcastTeamMemberUpdated(
    data: Record<string, unknown> & { isActive?: boolean },
  ): void {
    this.emitAdmin('team-member-updated', data);
    this.emitPublic(
      data.isActive ? 'team-member-updated' : 'team-member-deleted',
      data.isActive ? data : { id: data.id },
    );
  }

  broadcastTeamMemberDeleted(id: number): void {
    this.emitAdmin('team-member-deleted', { id });
    this.emitPublic('team-member-deleted', { id });
  }

  broadcastTeamMemberActive(data: Record<string, unknown>): void {
    this.emitAdmin('team-member-active', data);
    this.emitPublic('team-member-active', data);
  }

  broadcastExecutiveLeadershipCreated(
    data: Record<string, unknown> & { isActive?: boolean },
  ): void {
    this.emitAdmin('executive-leadership-created', data);
    if (data.isActive) this.emitPublic('executive-leadership-created', data);
  }

  broadcastExecutiveLeadershipUpdated(
    data: Record<string, unknown> & { isActive?: boolean },
  ): void {
    this.emitAdmin('executive-leadership-updated', data);
    this.emitPublic(
      data.isActive
        ? 'executive-leadership-updated'
        : 'executive-leadership-deleted',
      data.isActive ? data : { id: data.id },
    );
  }

  broadcastExecutiveLeadershipDeleted(id: number): void {
    this.emitAdmin('executive-leadership-deleted', { id });
    this.emitPublic('executive-leadership-deleted', { id });
  }

  broadcastExecutiveLeadershipActive(data: Record<string, unknown>): void {
    this.emitAdmin('executive-leadership-active', data);
    this.emitPublic('executive-leadership-active', data);
  }

  broadcastTestimonialCreated(
    data: Record<string, unknown> & { isActive?: boolean },
  ): void {
    this.emitAdmin('testimonial-created', data);
    if (data.isActive) this.emitPublic('testimonial-created', data);
  }

  broadcastTestimonialUpdated(
    data: Record<string, unknown> & { isActive?: boolean },
  ): void {
    this.emitAdmin('testimonial-updated', data);
    this.emitPublic(
      data.isActive ? 'testimonial-updated' : 'testimonial-deleted',
      data.isActive ? data : { id: data.id },
    );
  }

  broadcastTestimonialDeleted(id: number): void {
    this.emitAdmin('testimonial-deleted', { id });
    this.emitPublic('testimonial-deleted', { id });
  }

  broadcastTestimonialActive(data: Record<string, unknown>): void {
    this.emitAdmin('testimonial-active', data);
    this.emitPublic('testimonial-active', data);
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  private emitAdmin(event: string, data: unknown): void {
    this.server.to('admin-room').emit(event, this.envelope(event, data));
  }

  private emitPublic(event: string, data: unknown): void {
    this.server.to('public-room').emit(event, this.envelope(event, data));
  }

  private envelope(type: string, data: unknown) {
    return { type, data, timestamp: new Date().toISOString() };
  }

  private async authenticate(client: Socket): Promise<SocketIdentity | null> {
    const accessToken = this.getCookie(client, 'access_token');
    if (!accessToken) return null;

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        accessToken,
        {
          secret: this.configService.getOrThrow<string>('auth.jwtSecret'),
          issuer: this.configService.getOrThrow<string>('auth.issuer'),
          audience: this.configService.getOrThrow<string>('auth.audience'),
          algorithms: ['HS512'],
        },
      );

      if (payload.type !== 'access') return null;

      const session = await this.databaseService.authSession.findUnique({
        where: { id: payload.sid },
        include: { user: true },
      });

      if (
        !session ||
        session.revokedAt ||
        session.expiresAt <= new Date() ||
        !session.user.isActive ||
        session.user.tokenVersion !== payload.tv
      ) {
        return null;
      }

      return {
        userId: session.user.id,
        role: session.user.role,
        sessionId: session.id,
        expiresAt: payload.exp * 1000,
      };
    } catch {
      this.logger.debug(`Unauthenticated socket connection: ${client.id}`);
      return null;
    }
  }

  private scheduleExpiryDisconnect(client: Socket, expiresAt: number): void {
    const delay = Math.max(0, expiresAt - Date.now());
    const timer = setTimeout(() => client.disconnect(true), delay);
    timer.unref();
    this.expiryTimers.set(client.id, timer);
  }

  private getCookie(client: Socket, name: string): string | null {
    const raw = client.handshake.headers.cookie;
    if (!raw) return null;

    for (const part of raw.split(';')) {
      const [key, ...valueParts] = part.trim().split('=');
      if (key === name) {
        return decodeURIComponent(valueParts.join('='));
      }
    }
    return null;
  }
}
