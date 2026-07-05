/**
 * Scoreboard Sync Manager
 * Integrates WebSocket client with existing score rendering logic
 */

class ScoreboardSync {
  constructor(websocketClient, renderCallback) {
    this.ws = websocketClient;
    this.renderCallback = renderCallback;
    this.failCount = 0;
    this.statusUpdateInterval = null;
    this.liveClock = null; // LiveClock instance for syncing

    // Bind listeners
    this.ws.on('connection', this.onConnection.bind(this));
    this.ws.on('score:initial', this.onScoreInitial.bind(this));
    this.ws.on('score:update', this.onScoreUpdate.bind(this));
    this.ws.on('connection:status', this.onConnectionStatus.bind(this));
    this.ws.on('server:error', this.onServerError.bind(this));
    this.ws.on('polling:error', this.onPollingError.bind(this));
  }

  /**
   * Set LiveClock instance to sync time
   */
  setLiveClock(liveClock) {
    this.liveClock = liveClock;
  }

  /**
   * Handle connection event
   */
  onConnection(data) {
    console.log('[SYNC] Connection event:', data);
    this.updateStatusIndicator(data);
    this.failCount = 0; // Reset fail count on successful connection
  }

  /**
   * Handle initial score data (received on WebSocket connect)
   */
  onScoreInitial(data) {
    console.log('[SYNC] Initial score data received');
    if (data.matches) {
      this.mergeMatches(data.matches);
      this.renderCallback();
      this.updateStatusIndicator({
        connected: true,
        mode: this.ws.getConnectionMode(),
        cached: data.cached
      });
    }
  }

  /**
   * Handle score update (either WebSocket or polling)
   */
  onScoreUpdate(data) {
    console.log('[SYNC] Score update:', `${data.matches?.length || 0} matches`, `source: ${data.source}`);

    if (data.matches) {
      this.mergeMatches(data.matches);
      this.renderCallback();
      this.updateStatusIndicator({
        connected: true,
        mode: this.ws.getConnectionMode(),
        timestamp: data.timestamp
      });
    }

    this.failCount = 0; // Reset fail count on successful update
  }

  /**
   * Handle connection status from server
   */
  onConnectionStatus(data) {
    console.log('[SYNC] Connection status:', data);
    // This is informational, server tells us how many clients are connected
  }

  /**
   * Handle server error
   */
  onServerError(data) {
    console.error('[SYNC] Server error:', data);
    this.updateStatusIndicator({
      connected: false,
      mode: 'fallback',
      error: data.error
    });
  }

  /**
   * Handle polling error
   */
  onPollingError(data) {
    console.error('[SYNC] Polling error:', data);
    this.failCount++;

    // Stop polling after too many failures
    if (this.failCount >= 2) {
      console.error('[SYNC] Polling failed too many times, giving up');
      this.updateStatusIndicator({
        connected: false,
        mode: 'offline',
        error: 'No connection available'
      });
    }
  }

  /**
   * Merge matches from server into MATCHES array (global)
   * This is called from score:update and score:initial events
   */
  mergeMatches(newMatches) {
    if (!window.MATCHES || !Array.isArray(window.MATCHES)) {
      console.warn('[SYNC] MATCHES array not found globally');
      return;
    }

    newMatches.forEach(newMatch => {
      const existing = window.MATCHES.find(
        m => m.home === newMatch.home && m.away === newMatch.away
      );

      if (existing) {
        // Update existing match
        if (typeof newMatch.hs === 'number') existing.hs = newMatch.hs;
        if (typeof newMatch.as === 'number') existing.as = newMatch.as;
        if (newMatch.status) existing.aiStatus = newMatch.status;
        if (newMatch.minute) existing.minute = newMatch.minute;
        if (newMatch.timeElapsed) existing.timeElapsed = newMatch.timeElapsed;
        if (newMatch.addedTime) existing.addedTime = newMatch.addedTime;
        if (newMatch.displayMinute) existing.displayMinute = newMatch.displayMinute;
        if (newMatch.venue) existing.venue = newMatch.venue;
        if (newMatch.currentTime) existing.currentTime = newMatch.currentTime;

        // Sync LiveClock with server time (take first match's server time)
        if (this.liveClock && newMatch.currentTime) {
          this.liveClock.sync(newMatch.currentTime);
        }
      }
      // New matches would be added by the server, but typically not needed
      // since we're only updating scores of matches that exist in MATCHES
    });
  }

  /**
   * Update status indicator in UI
   */
  updateStatusIndicator(status) {
    try {
      const dot = document.getElementById('statusdot');
      const txt = document.getElementById('synctxt');

      if (!dot || !txt) {
        console.warn('[SYNC] Status indicator elements not found');
        return;
      }

      const mode = status.mode || this.ws.getConnectionMode();
      const isConnected = status.connected !== false;

      // Update dot color
      if (isConnected && mode === 'websocket') {
        dot.className = 'dot live'; // Pulsing green
        txt.textContent = `ao vivo (WebSocket)`;
      } else if (isConnected && mode === 'polling') {
        dot.className = 'dot'; // Gray (neutral)
        txt.textContent = `sincronizando (Polling)`;
      } else {
        dot.className = 'dot fail'; // Red
        txt.textContent = status.error || 'sem conexão';
      }

      // Optional: show timestamp
      if (status.timestamp) {
        const time = new Date(status.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        txt.textContent += ` · ${time}`;
      }
    } catch (error) {
      console.error('[SYNC] Error updating status indicator:', error);
    }
  }

  /**
   * Get current sync status
   */
  getStatus() {
    return this.ws.getStatus();
  }

  /**
   * Manually trigger a refresh (for manual sync button)
   */
  async refresh() {
    console.log('[SYNC] Manual refresh triggered');

    if (this.ws.connectionMode === 'websocket' && this.ws.socket?.connected) {
      // WebSocket is connected, just update UI
      this.updateStatusIndicator({ connected: true, mode: 'websocket' });
    } else {
      // Fallback: poll manually
      await this.ws.pollScoreboard();
    }
  }

  /**
   * Start periodic status update display (updates time every second)
   */
  startStatusUpdater() {
    if (this.statusUpdateInterval) return;

    this.statusUpdateInterval = setInterval(() => {
      const txt = document.getElementById('synctxt');
      if (txt && txt.textContent.includes('·')) {
        // Update time part of the text
        const time = new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        const mode = txt.textContent.split('·')[0].trim();
        txt.textContent = `${mode} · ${time}`;
      }
    }, 1000);
  }

  /**
   * Stop status updater
   */
  stopStatusUpdater() {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopStatusUpdater();
    this.ws.disconnect();
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.ScoreboardSync = ScoreboardSync;
}
