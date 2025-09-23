import { io, Socket } from 'socket.io-client';
import { config } from './config';

/**
 * WebSocket Service for Real-time Blog Updates
 * 
 * This service manages WebSocket connections to receive real-time blog updates
 * from the backend. It handles connection, authentication, and event listening.
 * 
 * Features:
 * - Automatic connection management with reconnection
 * - Authentication using JWT tokens
 * - Real-time blog event handling (create, update, delete, publish)
 * - Connection status monitoring
 * - Error handling and retry logic
 */
class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private eventHandlers: Map<string, ((...args: any[]) => void)[]> = new Map();

  constructor() {
    this.setupEventHandlers();
  }

  /**
   * Connect to the WebSocket server
   * Establishes connection with authentication and sets up event listeners
   * 
   * @param token - JWT authentication token
   */
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Get token from parameter or localStorage
        const authToken = token || this.getStoredToken();
        
        // For the simplified version, we'll connect without authentication
        // This allows the WebSocket to work even when user is not logged in
        if (!authToken) {
          // Continue with connection without token
        }

        // Create socket connection with optional authentication
        this.socket = io(`${config.api.baseURL}/blog-updates`, {
          auth: authToken ? { token: authToken } : {},
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true
        });

        // Set up connection event handlers
        this.setupConnectionHandlers(resolve, reject);

        // Set up blog event handlers
        this.setupBlogEventHandlers();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   * Properly closes the connection and cleans up resources
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Check if WebSocket is connected
   * 
   * @returns boolean indicating connection status
   */
  isWebSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Add event listener for blog events
   * 
   * @param event - Event name (blog-created, blog-updated, blog-deleted, blog-published)
   * @param handler - Event handler function
   */
  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);

    // If socket is already connected, set up the listener
    if (this.socket && this.isConnected) {
      this.socket.on(event, handler);
    }
  }

  /**
   * Remove event listener
   * 
   * @param event - Event name
   * @param handler - Event handler function to remove
   */
  off(event: string, handler: (...args: any[]) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }

    // Remove from socket if connected
    if (this.socket && this.isConnected) {
      this.socket.off(event, handler);
    }
  }

  /**
   * Emit an event to the server
   * 
   * @param event - Event name
   * @param data - Event data
   */
  emit(event: string, data?: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  /**
   * Set up connection event handlers
   * Handles connection, disconnection, and error events
   * 
   * @param resolve - Promise resolve function
   * @param reject - Promise reject function
   */
  private setupConnectionHandlers(resolve: Function, reject: Function): void {
    if (!this.socket) return;

    // Handle successful connection
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay
      resolve();
    });

    // Handle connection errors
    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      reject(error);
    });

    // Handle disconnection
    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      
      // Attempt to reconnect if not manually disconnected
      if (reason !== 'io client disconnect') {
        this.attemptReconnect();
      }
    });

    // Handle authentication errors
    this.socket.on('error', (error) => {
      this.isConnected = false;
    });

    // Handle server messages
    this.socket.on('connected', (data) => {
      // Server confirmation received
    });

    // Handle ping/pong for connection health
    this.socket.on('pong', (data) => {
      // Pong received
    });
  }

  /**
   * Set up blog event handlers
   * Registers handlers for different types of blog events
   */
  private setupBlogEventHandlers(): void {
    if (!this.socket) return;

    // Handle blog created events
    this.socket.on('blog-created', (data) => {
      this.triggerEventHandlers('blog-created', data);
    });

    // Handle blog updated events
    this.socket.on('blog-updated', (data) => {
      this.triggerEventHandlers('blog-updated', data);
    });

    // Handle blog deleted events
    this.socket.on('blog-deleted', (data) => {
      this.triggerEventHandlers('blog-deleted', data);
    });

    // Handle blog published events
    this.socket.on('blog-published', (data) => {
      this.triggerEventHandlers('blog-published', data);
    });
  }

  /**
   * Set up general event handlers
   * Handles common WebSocket events
   */
  private setupEventHandlers(): void {
    // This method can be used for any additional setup
  }

  /**
   * Trigger event handlers for a specific event
   * 
   * @param event - Event name
   * @param data - Event data
   */
  private triggerEventHandlers(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          // Error in event handler
        }
      });
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server
   * Implements exponential backoff for reconnection attempts
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect().catch(error => {
          // Reconnection failed
        });
      }
    }, this.reconnectDelay);

    // Exponential backoff: double the delay for next attempt
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
  }

  /**
   * Get stored authentication token
   * Retrieves JWT token from localStorage or cookies
   * 
   * @returns JWT token string or null
   */
  private getStoredToken(): string | null {
    // Try to get token from localStorage first
    const token = localStorage.getItem('access_token');
    if (token) {
      return token;
    }

    // Try to get token from cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'access_token') {
        return value;
      }
    }

    return null;
  }

  /**
   * Send ping to server to check connection health
   */
  ping(): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping', { timestamp: Date.now() });
    }
  }

  /**
   * Get connection status information
   * 
   * @returns Object with connection status details
   */
  getConnectionStatus(): { connected: boolean; reconnectAttempts: number; socketId?: string } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id
    };
  }
}

// Create and export a singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
