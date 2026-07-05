/**
 * WebSocket Client for GAMA Copa Center
 * Vanilla JS Socket.IO client with automatic fallback to HTTP polling
 */

class CopaWebSocketClient {
  constructor(options = {}) {
    this.options = {
      serverUrl: options.serverUrl || window.location.origin,
      maxReconnectAttempts: options.maxReconnectAttempts || 3,
      reconnectDelay: options.reconnectDelay || 1000,
      fallbackPollInterval: options.fallbackPollInterval || 120000, // 2 minutes
      debug: options.debug !== false, // Enable debug logging by default
      ...options
    };

    this.socket = null;
    this.connectionMode = 'connecting'; // 'websocket', 'polling', 'offline'
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.pollInterval = null;
    this.listeners = {};

    this.log('WebSocket client initialized', this.options);
  }

  /**
   * Log helper with optional debug flag
   */
  log(message, data) {
    if (this.options.debug) {
      console.log(`[COPA-WS] ${message}`, data || '');
    }
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    this.log('Attempting connection to WebSocket server');

    // Check if Socket.IO is available
    if (typeof io === 'undefined') {
      this.log('Socket.IO not loaded, falling back to HTTP polling');
      this.fallbackToPolling();
      return;
    }

    try {
      this.socket = io(this.options.serverUrl, {
        reconnection: true,
        reconnectionDelay: this.options.reconnectDelay,
        reconnectionAttempts: this.options.maxReconnectAttempts,
        transports: ['websocket', 'polling'],
        autoConnect: true
      });

      this.setupSocketListeners();
    } catch (error) {
      this.log('Error initializing Socket.IO', error);
      this.fallbackToPolling();
    }
  }

  /**
   * Setup Socket.IO event listeners
   */
  setupSocketListeners() {
    // Connection established
    this.socket.on('connect', () => {
      this.log('WebSocket connected');
      this.connectionMode = 'websocket';
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Stop polling if it's running
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
        this.log('Stopped HTTP polling, using WebSocket');
      }

      this.emit('connection', {
        mode: 'websocket',
        connected: true,
        timestamp: Date.now()
      });
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      this.log('WebSocket connection error', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
        this.log(`Max reconnect attempts (${this.reconnectAttempts}) reached, falling back to polling`);
        this.socket.disconnect();
        this.fallbackToPolling();
      }
    });

    // Disconnected
    this.socket.on('disconnect', (reason) => {
      this.log('WebSocket disconnected', reason);
      this.connectionMode = 'offline';
      this.isConnected = false;

      // Only fallback to polling if it's not a normal disconnect
      if (reason !== 'io client namespace disconnect') {
        this.fallbackToPolling();
      }

      this.emit('connection', {
        mode: 'offline',
        connected: false,
        reason,
        timestamp: Date.now()
      });
    });

    // Initial score data (on connect)
    this.socket.on('score:initial', (data) => {
      this.log('Received initial score data', data.matches?.length || 0);
      this.emit('score:initial', data);
    });

    // Score update (real-time)
    this.socket.on('score:update', (data) => {
      this.log('Received score update', data.matches?.length || 0);
      this.emit('score:update', data);
    });

    // Connection status
    this.socket.on('connection:status', (data) => {
      this.log('Received connection status', data);
      this.emit('connection:status', data);
    });

    // Connection error from server
    this.socket.on('connection:error', (data) => {
      this.log('Server connection error', data);
      this.emit('server:error', data);
    });

    // Pong response
    this.socket.on('pong', (data) => {
      this.emit('pong', data);
    });
  }

  /**
   * Fallback to HTTP polling
   */
  fallbackToPolling() {
    if (this.pollInterval) {
      return; // Already polling
    }

    this.log('Falling back to HTTP polling');
    this.connectionMode = 'polling';

    this.emit('connection', {
      mode: 'polling',
      connected: true,
      fallback: true,
      timestamp: Date.now()
    });

    // Poll immediately
    this.pollScoreboard();

    // Then poll every interval
    this.pollInterval = setInterval(() => {
      this.pollScoreboard();
    }, this.options.fallbackPollInterval);
  }

  /**
   * Poll HTTP endpoint for score updates
   */
  async pollScoreboard() {
    try {
      const response = await fetch('/api/scoreboard');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      this.log('Received polling update', data.matches?.length || 0);

      // Emit update as if it came from WebSocket
      this.emit('score:update', {
        matches: data.matches,
        timestamp: Date.now(),
        source: 'polling',
        cached: data.cached
      });

      // Try to reconnect to WebSocket if currently polling
      if (this.connectionMode === 'polling' && !this.socket?.connected) {
        this.log('Attempting to reconnect to WebSocket');
        this.reconnect();
      }
    } catch (error) {
      this.log('Polling error', error.message);
      this.emit('polling:error', {
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Try to reconnect WebSocket
   */
  reconnect() {
    if (!this.socket) {
      this.connect();
    } else if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  /**
   * Send ping to server (for latency measurement)
   */
  ping() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('ping', { timestamp: Date.now() });
    } else {
      this.log('Cannot ping: not connected via WebSocket');
    }
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Get current connection mode
   */
  getConnectionMode() {
    return this.connectionMode;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      mode: this.connectionMode,
      connected: this.isConnected,
      socketConnected: this.socket?.connected || false,
      timestamp: Date.now()
    };
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    this.log('Disconnecting from server');

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.isConnected = false;
    this.connectionMode = 'offline';
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.CopaWebSocketClient = CopaWebSocketClient;
}
