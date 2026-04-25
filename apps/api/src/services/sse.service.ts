
// apps/api/src/services/sse.service.ts
import { Response } from 'express';
import Redis from 'ioredis';
import { config } from '../config/env';

interface ClientConnection {
  res: Response;
  userId: string;
  heartbeat: NodeJS.Timeout;
  lastActivity: number;
}

class SSEService {
  private clients: Map<string, ClientConnection> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private pub: Redis | null = null;
  private sub: Redis | null = null;
  private static instance: SSEService;

  private constructor() {
    if (config.REDIS_ENABLED !== 'false' && config.REDIS_URL) {
      const redisOptions = {
        retryStrategy: (times: number) => {
          if (times > 3) return null;
          return Math.min(times * 100, 3000);
        },
        maxRetriesPerRequest: 3,
        lazyConnect: true
      };

      this.pub = new Redis(config.REDIS_URL, redisOptions);
      this.sub = new Redis(config.REDIS_URL, redisOptions);

      // Handle unhandled error events
      this.pub.on('error', (err) => console.log('⚠️ SSE Redis Pub Error:', err.message));
      this.sub.on('error', (err) => console.log('⚠️ SSE Redis Sub Error:', err.message));

      // Redis se messages subscribe karo (multi-server support)
      this.pub.connect().catch(() => { this.pub = null; });
      this.sub.connect().then(() => {
        this.sub?.subscribe('sse:broadcast');
        this.sub?.on('message', (channel, message) => {
          if (channel === 'sse:broadcast') {
            try {
              const { type, payload, target } = JSON.parse(message);
              this.handleRedisMessage(type, payload, target);
            } catch (e) {
              console.error('SSE Message Parse Error', e);
            }
          }
        });
      }).catch(() => { this.sub = null; });
    }

    // Cleanup dead connections every 60 seconds
    setInterval(() => this.cleanupDeadConnections(), 60000);
  }

  static getInstance(): SSEService {
    if (!SSEService.instance) {
      SSEService.instance = new SSEService();
    }
    return SSEService.instance;
  }

  addClient(userId: string, res: Response): void {
    // Pehle se connection hai to close karo
    this.removeClient(userId);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*'
    });

    // Initial connection event
    this.sendSSE(res, { type: 'connected', userId, timestamp: Date.now() });

    const heartbeat = setInterval(() => {
      try {
        res.write(':heartbeat\n\n');
      } catch (e) {
        this.removeClient(userId);
      }
    }, 30000);

    this.clients.set(userId, {
      res,
      userId,
      heartbeat,
      lastActivity: Date.now()
    });

    res.on('close', () => this.removeClient(userId));
    res.on('error', () => this.removeClient(userId));
  }

  removeClient(userId: string): void {
    const client = this.clients.get(userId);
    if (client) {
      clearInterval(client.heartbeat);
      // Rooms se bhi hatao
      this.rooms.forEach((users, roomId) => {
        if (users.has(userId)) {
          users.delete(userId);
          if (users.size === 0) this.rooms.delete(roomId);
        }
      });
      this.clients.delete(userId);
    }
  }

  joinRoom(userId: string, roomId: string): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(userId);
  }

  leaveRoom(userId: string, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(userId);
      if (room.size === 0) this.rooms.delete(roomId);
    }
  }

  // Direct user ko bhejo
  sendToUser(userId: string, data: any): void {
    const client = this.clients.get(userId);
    if (client) {
      this.sendSSE(client.res, data);
      client.lastActivity = Date.now();
    }
  }

  // Room mein broadcast karo
  broadcastToRoom(roomId: string, data: any): void {
    // Local clients
    const roomUsers = this.rooms.get(roomId);
    if (roomUsers) {
      roomUsers.forEach(userId => {
        this.sendToUser(userId, data);
      });
    }

    // Redis pe publish karo taaki baaki servers bhi bheje
    if (this.pub) {
      this.pub.publish('sse:broadcast', JSON.stringify({
        type: 'room',
        target: { roomId },
        payload: data
      })).catch((err) => console.log('SSE Publish Error:', err.message));
    }
  }

  // Event subscribers ko bhejo
  broadcastToEvent(eventId: string, data: any): void {
    if (this.pub) {
      this.pub.publish('sse:broadcast', JSON.stringify({
        type: 'event',
        target: { eventId },
        payload: data
      })).catch((err) => console.log('SSE Publish Error:', err.message));
    }
  }

  // Notification bhejo
  sendNotification(userId: string, notification: any): void {
    this.sendToUser(userId, {
      type: 'notification',
      data: notification
    });
  }

  private sendSSE(res: Response, data: any): void {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('SSE Write Error:', error);
    }
  }

  private handleRedisMessage(type: string, payload: any, target: any): void {
    if (type === 'room' && target.roomId) {
      // Local clients ko bhejo jo Redis se aaya
      const roomUsers = this.rooms.get(target.roomId);
      if (roomUsers) {
        roomUsers.forEach(userId => {
          const client = this.clients.get(userId);
          if (client) this.sendSSE(client.res, payload);
        });
      }
    }
  }

  private cleanupDeadConnections(): void {
    const now = Date.now();
    this.clients.forEach((client, userId) => {
      if (now - client.lastActivity > 120000) { // 2 min inactivity
        this.removeClient(userId);
      }
    });
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      totalRooms: this.rooms.size,
      redisStatus: this.pub ? this.pub.status : 'disabled'
    };
  }
}

export const sseService = SSEService.getInstance();