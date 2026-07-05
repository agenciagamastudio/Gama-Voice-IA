# Socket.IO Integration Plan — GAMA Copa Center

**Branch:** `feature/socketio-integration`  
**Target:** Real-time score updates via WebSocket with polling fallback  
**Priority:** High (improves UX from 2min polling to instant updates)

---

## 📊 Current State

- **Backend:** Node/Express polling ESPN every 30s (cache)
- **Frontend:** Vanilla JS + SVG, polling backend every 2 minutes
- **Latency:** ~2 minutes for score updates
- **Dependencies:** Express only (no Socket.IO)

## 🎯 Target State

- **Backend:** Express + Socket.IO server emitting live score updates
- **Frontend:** WebSocket client receiving instant updates, with HTTP polling fallback
- **Latency:** <100ms (real-time)
- **Fallback:** Automatic downgrade to polling if WebSocket unavailable
- **Browser Support:** All modern browsers (with fallback for older ones)

---

## Implementation Phases

### Phase 1: Backend Socket.IO Server (1-2 hours)

#### 1.1 Install Dependencies
```bash
npm install socket.io socket.io-client
```

#### 1.2 Create Socket.IO Server
**File:** `server/websocket.js`

```javascript
// Server-side WebSocket setup
// - Handles Socket.IO connection
// - Emits score updates to all connected clients
// - Integrates with existing ESPN polling
```

**Features:**
- Accept connections on `:3000`
- Broadcast `score:update` events with match data
- Broadcast `connection:status` (online/offline)
- Emit connection count for debugging
- Support multiple concurrent clients (scale-safe)

#### 1.3 Integrate with ESPN Polling
**File:** `server/index.js`

Changes:
- Import Socket.IO server
- Trigger `score:update` when cache refreshes from ESPN
- Emit status changes when ESPN API fails/recovers
- Keep HTTP `/api/scoreboard` endpoint (for backward compatibility)

#### 1.4 Test Backend
```bash
# Start server
npm run dev

# In another terminal, connect and listen
node -e "const io = require('socket.io-client'); const s = io('http://localhost:3000'); s.on('score:update', (data) => console.log('Update:', data);"
```

---

### Phase 2: Frontend WebSocket Client (1-2 hours)

#### 2.1 Add Socket.IO Client (Vanilla JS)
**File:** `public/js/websocket-client.js`

```javascript
// Vanilla JS Socket.IO client
// - Establish WebSocket connection
// - Listen for score:update events
// - Auto-reconnect on disconnect
// - Fallback to HTTP polling if WebSocket unavailable
```

**Features:**
- Connect to server on page load
- Listen for `score:update` events
- Merge updates into MATCHES array
- Re-render affected sections only (performance)
- Log connection state for debugging

#### 2.2 Implement Fallback Logic
**File:** `public/js/scoreboard-sync.js`

Strategy:
1. Try WebSocket on page load
2. If WebSocket succeeds: use it, disable polling
3. If WebSocket fails (500, timeout, etc.): fall back to HTTP polling
4. Auto-detect when WebSocket recovers: switch back

Circuit breaker:
- Max 3 WebSocket connection attempts
- If all fail: switch to polling
- Check WebSocket health every 30s
- Re-enable WebSocket if health check passes

#### 2.3 Update HTML
**File:** `public/index.html`

Add:
```html
<script src="/socket.io/socket.io.js"></script>
<script src="js/websocket-client.js"></script>
<script src="js/scoreboard-sync.js"></script>
```

Remove/update old polling interval (2min → only as fallback)

#### 2.4 Update Status Indicator
Show connection mode:
- 🟢 **Live (WebSocket)** — connected to Socket.IO
- 🟡 **Polling** — WebSocket unavailable, using HTTP
- 🔴 **Offline** — no connection source available

---

### Phase 3: Integration & Testing (1-2 hours)

#### 3.1 System Tests
- [ ] Start backend server
- [ ] Connect frontend (check console)
- [ ] Verify initial score load
- [ ] Simulate ESPN API failure (see fallback in backend)
- [ ] Check frontend automatically switches to polling
- [ ] Recover ESPN API (see frontend switch back to WebSocket)

#### 3.2 Performance Tests
- [ ] Measure latency: score update → render (target: <50ms)
- [ ] Monitor memory: no leaks after 1000 updates
- [ ] CPU usage: <2% idle, <5% during updates
- [ ] Bandwidth: compare WebSocket vs polling (expect 80% reduction)

#### 3.3 Load Tests
- [ ] Simulate 10 concurrent clients
- [ ] Verify no race conditions
- [ ] Check server CPU/memory under load
- [ ] Measure update propagation time

#### 3.4 Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile (iOS Safari, Android Chrome)

---

### Phase 4: Documentation & Deployment (1 hour)

#### 4.1 Code Documentation
- [ ] Add JSDoc comments to all Socket.IO functions
- [ ] Document event payload structure
- [ ] Document fallback strategy
- [ ] Add console.debug() for troubleshooting

#### 4.2 API Documentation
- [ ] Socket.IO event: `score:update` (payload)
- [ ] Socket.IO event: `connection:status` (payload)
- [ ] HTTP endpoint: `/api/scoreboard` (still available)
- [ ] HTTP endpoint: `/socket.io/socket.io.js` (client library)

#### 4.3 Update README
- [ ] Architecture diagram (before/after)
- [ ] Performance metrics
- [ ] How to troubleshoot WebSocket issues
- [ ] Configuration options

#### 4.4 Deploy
- [ ] Merge to `master`
- [ ] Deploy to production
- [ ] Monitor metrics for 24h
- [ ] Rollback plan (if needed)

---

## File Structure

```
GAMA_COPA/
├── server/
│   ├── index.js                 ← Updated: integrate Socket.IO
│   ├── websocket.js             ← NEW: Socket.IO server setup
│   └── teamMap.js               ← No changes
├── public/
│   ├── index.html               ← Updated: add Socket.IO client script
│   ├── js/
│   │   ├── websocket-client.js  ← NEW: vanilla JS WebSocket client
│   │   └── scoreboard-sync.js   ← NEW: fallback logic & integration
│   └── images/                  ← No changes
├── package.json                 ← Updated: add socket.io
└── IMPLEMENTATION_PLAN.md       ← This file
```

---

## Key Design Decisions

### 1. Vanilla JS Only (No React)
- Socket.IO client is small (~20KB minified)
- Vanilla JS event handling is simpler than React hooks
- Backward compatible with existing frontend code

### 2. HTTP Fallback (Not Socket.IO's Built-in)
- Socket.IO has `transports: ['websocket', 'polling']` built-in
- We use explicit fallback for clarity & control
- Allows monitoring which mode clients use

### 3. Keep `/api/scoreboard` Endpoint
- Mobile apps or other clients may depend on it
- Backward compatibility for free
- Acts as health check for polling

### 4. Server-side ESPN Polling
- Don't move polling to client (privacy, rate limits)
- Backend polls ESPN once, broadcasts to all clients
- Scales better (n clients, 1 ESPN request)

### 5. Event-Driven Architecture
- Score updates flow: ESPN → server cache → Socket.IO broadcast
- Frontend merges updates incrementally (not full page refresh)
- Enables animation (score appears, then updates)

---

## Performance Targets

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Update latency | 2min | <100ms | Live experience |
| Backend polling | Every 30s | Unchanged | Cost |
| Bandwidth per update | ~5KB | ~100B | 50x reduction |
| Frontend complexity | Medium | Slightly higher | Worth it |

---

## Rollback Strategy

If WebSocket issues arise:

1. **Deploy without Socket.IO** (revert `server/websocket.js`, remove client scripts)
2. **Increase HTTP polling** frequency (30s → 15s) as temporary fix
3. **Analyze logs** for connection issues
4. **Re-deploy** after fix

Estimated rollback time: <5 minutes

---

## Success Criteria

- ✅ WebSocket connections established on page load
- ✅ Score updates received <100ms from ESPN
- ✅ Auto-fallback to polling if WebSocket unavailable
- ✅ Auto-recovery to WebSocket when available again
- ✅ No memory leaks (1000+ updates without degradation)
- ✅ Works on all modern browsers
- ✅ Backward compatible (HTTP endpoint still works)
- ✅ Update rendering <50ms (no visual lag)

---

## Timeline

- **Phase 1 (Backend):** 1-2 hours
- **Phase 2 (Frontend):** 1-2 hours
- **Phase 3 (Testing):** 1-2 hours
- **Phase 4 (Docs):** 1 hour
- **Total:** 4-7 hours of focused work

---

## References

- Socket.IO Docs: https://socket.io/docs/v4/
- Socket.IO Client (Vanilla JS): https://socket.io/docs/v4/client-api/
- Repo #1 (94/100): Socket.IO Live Score Dashboard (patterns to study)
- Repo #5 (52/100): Football Dashboard (data structure reference)
