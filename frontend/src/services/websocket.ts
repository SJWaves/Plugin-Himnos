/**
 * WebSocket Service
 * =================
 * Real-time communication with backend via WebSocket.
 */

import { API_BASE_URL, API_ENDPOINTS } from '../shared/constants';
import type { DisplayConfig, HymnDisplay } from '../shared/types';

type WebSocketMessage = {
  type: 'display' | 'config' | 'connected' | 'state' | 'pong' | 'error';
  data: unknown;
};

type MessageCallback = (message: WebSocketMessage) => void;

/**
 * WebSocket client for real-time updates.
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onMessageCallback: MessageCallback | null = null;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private endpoint: 'display' | 'control' = 'display') {}

  /**
   * Connect to the WebSocket server.
   */
  connect(): void {
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
    const endpoint = this.endpoint === 'display' 
      ? API_ENDPOINTS.WEBSOCKET_DISPLAY 
      : API_ENDPOINTS.WEBSOCKET_CONTROL;

    try {
      this.ws = new WebSocket(`${wsUrl}${endpoint}`);
      this.setupEventListeners();
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server.
   */
  disconnect(): void {
    this.stopPing();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send a message to the server.
   */
  send(message: { type: string; data?: unknown }): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message, not connected');
    }
  }

  /**
   * Send display update (for control endpoint).
   */
  sendDisplay(display: HymnDisplay | null): void {
    if (display) {
      this.send({ type: 'show', data: display });
    } else {
      this.send({ type: 'clear' });
    }
  }

  /**
   * Send config update (for control endpoint).
   */
  sendConfig(config: DisplayConfig): void {
    this.send({ type: 'config', data: config });
  }

  /**
   * Register message callback.
   */
  onMessage(callback: MessageCallback): void {
    this.onMessageCallback = callback;
  }

  /**
   * Register connect callback.
   */
  onConnect(callback: () => void): void {
    this.onConnectCallback = callback;
  }

  /**
   * Register disconnect callback.
   */
  onDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  /**
   * Check if connected.
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;
      this.startPing();
      this.onConnectCallback?.();
    };

    this.ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
      this.stopPing();
      this.onDisconnectCallback?.();
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.onMessageCallback?.(message);
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

/**
 * Create a display WebSocket client.
 */
export function createDisplayClient(): WebSocketClient {
  return new WebSocketClient('display');
}

/**
 * Create a control WebSocket client.
 */
export function createControlClient(): WebSocketClient {
  return new WebSocketClient('control');
}
