import {io, Socket} from 'socket.io-client';
import {ENV} from '@config/env';
import {LocationData, SocketLocationUpdate} from '@types/index';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  connect(userId: string, sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(ENV.SOCKET_URL, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          query: {
            userId,
            sessionId,
          },
        });

        this.socket.on('connect', () => {
          console.log('Socket connected:', this.socket?.id);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(error);
          }
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log('Socket reconnected after', attemptNumber, 'attempts');
          this.isConnected = true;
          this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('Socket reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
          console.error('Socket reconnection failed');
          reject(new Error('Failed to reconnect to socket server'));
        });
      } catch (error) {
        console.error('Error creating socket connection:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emitLocationUpdate(location: LocationData, userId: string, sessionId: string): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot emit location update');
      return;
    }

    const update: SocketLocationUpdate = {
      userId,
      sessionId,
      location,
    };

    this.socket.emit('location:update', update);
  }

  onLocationUpdate(callback: (update: SocketLocationUpdate) => void): void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.on('location:update', callback);
  }

  onTrackingStart(callback: (data: {sessionId: string; userId: string}) => void): void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.on('tracking:start', callback);
  }

  onTrackingStop(callback: (data: {sessionId: string}) => void): void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.on('tracking:stop', callback);
  }

  emitTrackingStart(userId: string, sessionId: string): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot emit tracking start');
      return;
    }

    this.socket.emit('tracking:start', {userId, sessionId});
  }

  emitTrackingStop(sessionId: string): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot emit tracking stop');
      return;
    }

    this.socket.emit('tracking:stop', {sessionId});
  }

  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();

