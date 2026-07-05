/**
 * Live Clock Manager
 * Displays HH:MM:SS synchronized with server time
 * Updates every 1 second and re-syncs with server data
 */

class LiveClock {
  constructor(elementId) {
    this.elementId = elementId;
    this.element = document.getElementById(elementId);

    if (!this.element) {
      console.warn(`[LiveClock] Element #${elementId} not found`);
      return;
    }

    this.currentTime = new Date();
    this.intervalId = null;
    this.driftThreshold = 2000; // Re-sync if drift > 2 seconds
    this.lastServerTime = null;

    console.log('[LiveClock] Initialized');
    this.start();
  }

  /**
   * Format date to HH:MM:SS
   */
  formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  /**
   * Update display
   */
  render() {
    if (!this.element) return;
    this.element.textContent = this.formatTime(this.currentTime);
  }

  /**
   * Sync with server time (called when new data arrives)
   * @param {string} serverTimeISO - ISO string from server (e.g., "2026-07-05T18:45:23.456Z")
   */
  sync(serverTimeISO) {
    if (!serverTimeISO) return;

    const serverTime = new Date(serverTimeISO);
    const localTime = new Date();
    const drift = Math.abs(localTime - serverTime);

    // Only re-sync if drift is significant (> 2 seconds)
    if (drift > this.driftThreshold) {
      console.log(`[LiveClock] Re-syncing (drift: ${drift}ms)`);
      this.currentTime = serverTime;
      this.lastServerTime = serverTime;
      this.render();
    } else {
      // Trust local time, just update lastServerTime for reference
      this.lastServerTime = serverTime;
    }
  }

  /**
   * Start the clock (increment every 1 second)
   */
  start() {
    if (this.intervalId) return;

    this.render(); // Initial render

    this.intervalId = setInterval(() => {
      // Increment by 1 second
      this.currentTime = new Date(this.currentTime.getTime() + 1000);
      this.render();
    }, 1000);

    console.log('[LiveClock] Started');
  }

  /**
   * Stop the clock
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[LiveClock] Stopped');
    }
  }

  /**
   * Get current time as HH:MM:SS
   */
  getTime() {
    return this.formatTime(this.currentTime);
  }

  /**
   * Destroy instance
   */
  destroy() {
    this.stop();
    if (this.element) {
      this.element.textContent = '';
    }
  }
}

// Export
if (typeof window !== 'undefined') {
  window.LiveClock = LiveClock;
}
