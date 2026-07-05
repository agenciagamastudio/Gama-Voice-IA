/**
 * Match Timer — Real-time MM:SS Counter with Sync
 * Ticks every second and syncs with WebSocket data
 */

class MatchTimer {
  constructor(options = {}) {
    this.kickoffTime = options.kickoffTime || null;
    this.serverTimeElapsed = options.timeElapsed || null; // { minute, second, total_seconds }
    this.addedTime = options.addedTime || null; // { minute, added, display: "90+7'" }
    this.updateCallback = options.onTick || (() => {});
    this.timerInterval = null;
    this.lastSecond = -1;
    this.isRunning = false;

    this.log('MatchTimer initialized');
  }

  log(message, data) {
    console.log(`[TIMER] ${message}`, data || '');
  }

  /**
   * Start the timer (ticks every second)
   */
  start(kickoffTime) {
    if (this.isRunning) return;

    this.kickoffTime = kickoffTime;
    this.isRunning = true;

    this.log('Timer started', { kickoffTime });

    // Tick immediately
    this.tick();

    // Then tick every second
    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  /**
   * Tick once (calculate current MM:SS)
   */
  tick() {
    if (!this.kickoffTime) return;

    const elapsed = this.getTimeElapsed();
    if (!elapsed) return;

    // Only call callback if second changed
    if (elapsed.second !== this.lastSecond) {
      this.lastSecond = elapsed.second;
      this.updateCallback(elapsed);
    }
  }

  /**
   * Calculate MM:SS from kickoff time (with mock for future matches)
   * If addedTime is present, format as "90+7':23" instead of "90:23"
   */
  getTimeElapsed() {
    const koTime = new Date(this.kickoffTime).getTime();
    const now = Date.now();
    const elapsedMs = now - koTime;

    let totalSeconds;

    if (elapsedMs < 0) {
      // Match is in the future: simulate as if it started 45 minutes ago
      // This prevents negative timers and shows realistic match progression
      const mockStartTime = now - (45 * 60 * 1000); // "Started 45 minutes ago"
      totalSeconds = Math.floor((now - mockStartTime) / 1000);
      this.log('Future match detected, simulating', { minute: Math.floor(totalSeconds / 60) });
    } else {
      // Match has started: use real elapsed time
      totalSeconds = Math.floor(elapsedMs / 1000);
    }

    const minute = Math.floor(totalSeconds / 60);
    const second = totalSeconds % 60;

    // If we have added time info, format with the added time display
    let display;
    if (this.addedTime && this.addedTime.display) {
      // Format: "90+7':23"
      display = `${this.addedTime.display}:${String(second).padStart(2, '0')}`;
    } else {
      // Standard format: "90:23"
      display = `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
    }

    return {
      minute,
      second,
      total_seconds: totalSeconds,
      display
    };
  }

  /**
   * Sync with server time (called when WebSocket updates arrive)
   * Corrects drift between client and server clocks
   */
  sync(serverTimeElapsed) {
    if (!serverTimeElapsed || !serverTimeElapsed.total_seconds) return;

    this.serverTimeElapsed = serverTimeElapsed;

    // If client time is significantly different from server, log a drift event
    const clientElapsed = this.getTimeElapsed();
    if (clientElapsed) {
      const drift = Math.abs(clientElapsed.total_seconds - serverTimeElapsed.total_seconds);
      if (drift > 3) {
        this.log('Clock drift detected', { client: clientElapsed, server: serverTimeElapsed, drift });
      }
    }
  }

  /**
   * Get color class based on elapsed time
   * Green (0-15) → Yellow (15-30) → Red (30-45) → Dark (45+)
   */
  getColorClass(totalSeconds) {
    const minute = Math.floor(totalSeconds / 60);

    if (minute < 15) return 'timer-green';
    if (minute < 30) return 'timer-yellow';
    if (minute < 45) return 'timer-red';
    return 'timer-dark'; // Added time or OT
  }

  /**
   * Stop the timer
   */
  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isRunning = false;
    this.log('Timer stopped');
  }

  /**
   * Reset the timer
   */
  reset() {
    this.stop();
    this.kickoffTime = null;
    this.serverTimeElapsed = null;
    this.lastSecond = -1;
  }

  /**
   * Check if timer is running
   */
  running() {
    return this.isRunning;
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.MatchTimer = MatchTimer;
}
