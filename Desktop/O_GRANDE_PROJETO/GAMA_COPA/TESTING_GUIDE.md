# Socket.IO Integration Testing Guide

## Quick Start

### 1. Start the server
```bash
npm install
npm start
```

Expected output:
```
🟢 GAMA Copa Center rodando em http://localhost:3000
📊 API: GET http://localhost:3000/api/scoreboard
🔗 WebSocket: ws://localhost:3000 (Socket.IO)
📡 Real-time scores via WebSocket with HTTP polling fallback
```

### 2. Open browser
Navigate to: `http://localhost:3000`

### 3. Check developer console
Open DevTools (F12) and check:
- **Console tab:** Look for `[COPA-WS]` and `[SYNC]` messages
- **Network tab:** See WebSocket connection (look for `socket.io`)
- **Status indicator:** Should show "ao vivo (WebSocket)" or "sincronizando (Polling)"

---

## Testing Scenarios

### Scenario 1: Normal WebSocket Connection

**Steps:**
1. Start server
2. Open `http://localhost:3000` in browser
3. Check console

**Expected behavior:**
```
[COPA-WS] WebSocket client initialized
[COPA-WS] Attempting connection to WebSocket server
[COPA-WS] WebSocket connected
[SYNC] Connection event: {mode: 'websocket', connected: true, timestamp: ...}
[SYNC] Initial score data received
```

**UI changes:**
- Status dot: 🟢 Live (pulsing green)
- Status text: "ao vivo (WebSocket)"
- Scores appear in real-time

---

### Scenario 2: WebSocket Connection Fails (Fallback to Polling)

**Steps:**
1. Start server
2. Open DevTools → Network tab
3. Find WebSocket connection (filter by "socket.io")
4. Right-click and select "Block URL"
5. Open `http://localhost:3000` in browser
6. Check console

**Expected behavior:**
```
[COPA-WS] WebSocket connection error
[COPA-WS] Max reconnect attempts reached, falling back to polling
[SYNC] Connection event: {mode: 'polling', connected: true, fallback: true, timestamp: ...}
[SYNC] Score update: 8 matches, source: polling
```

**UI changes:**
- Status dot: 🟡 Gray (neutral)
- Status text: "sincronizando (Polling)"
- Scores appear every 2 minutes

---

### Scenario 3: ESPN API Fails

**Steps:**
1. Start server
2. Open DevTools → Network tab
3. Go to application and throttle Internet (Chrome DevTools → Network tab → Slow 3G)
4. Wait for ESPN API to timeout
5. Check console and UI

**Expected behavior:**
```
Erro ao buscar ESPN: The user aborted a request
⚠️ Broadcasted error to N clients
[SYNC] Server connection error
```

**UI changes:**
- Status dot: 🔴 Red
- Status text: "ESPN API indisponível" or similar

---

### Scenario 4: Manual Refresh Button

**Steps:**
1. Start server with normal WebSocket connection
2. Click "Atualizar" button
3. Check console

**Expected behavior:**
```
[SYNC] Manual refresh triggered
[SYNC] Score update: 8 matches (instant if WebSocket)
```

**UI changes:**
- Button shows loading spinner briefly
- Scores update immediately

---

### Scenario 5: Recovery from Failure

**Steps:**
1. Start server with WebSocket blocked (Scenario 2)
2. Observe polling mode for a few seconds
3. Unblock WebSocket in DevTools
4. Wait ~30 seconds
5. Check console

**Expected behavior:**
```
[COPA-WS] Attempting to reconnect to WebSocket
[COPA-WS] WebSocket connected
[SYNC] Connection event: {mode: 'websocket', connected: true, timestamp: ...}
[SYNC] Stopped HTTP polling, using WebSocket
```

**UI changes:**
- Status changes from "Polling" to "ao vivo (WebSocket)"
- Dot changes to pulsing green

---

## Performance Metrics

### Metrics to Check

Use DevTools → Performance tab:

1. **Connection latency:** Time from page load to WebSocket connection
   - Target: < 500ms

2. **Initial data load:** Time from WebSocket connect to first render
   - Target: < 100ms

3. **Update latency:** Time from broadcast to render
   - Target: < 50ms for WebSocket, < 100ms for polling

4. **Memory usage:** Monitor heap size over time
   - Should remain stable (no leaks)
   - Target: < 50MB initial, no growth after 1000 updates

5. **CPU usage:** Monitor during updates
   - Should be < 2% idle
   - < 5% during update

### How to Measure

**Latency measurement:**
```javascript
// In console:
wsClient.ping();
// Check console for pong message with latency
```

**Memory measurement:**
```javascript
// In console:
performance.memory
// Watch .usedJSHeapSize over time (should be stable)
```

---

## Debugging

### Enable detailed logs
```javascript
// In browser console:
localStorage.setItem('debug', 'COPA-WS:*');
location.reload();

// Or modify websocket-client.js:
// new CopaWebSocketClient({ debug: true })
```

### Check connection status
```javascript
// In console:
wsClient.getStatus()
// Returns: {mode, connected, socketConnected, timestamp}

scoreboardSync.getStatus()
// Returns: same as above
```

### Manually trigger polling
```javascript
// In console:
wsClient.pollScoreboard()
// Should fetch and emit score:update
```

### Check WebSocket stats
```javascript
// In console:
wsClient.io.engine
// Shows transport, latency, messages sent/received
```

---

## Troubleshooting

### Issue: "Socket.IO not loaded"

**Cause:** Client library script failed to load

**Fix:**
1. Check Network tab for 404 on `/socket.io/socket.io.js`
2. Ensure server is running
3. Try `http://localhost:3000/socket.io/socket.io.js` in browser

### Issue: WebSocket connects but no score updates

**Cause:** ESPN API is down or returning no data

**Fix:**
1. Check server logs for ESPN fetch errors
2. Test `/api/scoreboard` endpoint manually
3. Check ESPN API status

### Issue: Polling doesn't work

**Cause:** Fallback logic not triggered

**Fix:**
1. Block WebSocket manually (Scenario 2)
2. Check console for fallback message
3. Verify `/api/scoreboard` returns data

### Issue: High CPU/Memory usage

**Cause:** Update rendering not optimized

**Fix:**
1. Check `renderAllViews()` frequency
2. Verify `mergeMatches()` doesn't duplicate
3. Profile with DevTools Performance tab

---

## Load Testing

### Simulate multiple clients
```bash
# Terminal 1: start server
npm start

# Terminal 2-5: open browser tabs and connect
open http://localhost:3000
open http://localhost:3000
open http://localhost:3000
open http://localhost:3000

# Watch server logs
# Should see:
# 🔗 WebSocket client connected (total: 1)
# 🔗 WebSocket client connected (total: 2)
# etc.
```

### Monitor concurrent connections
```javascript
// In browser console of any client:
// Check server logs for connection count
// Should handle 10+ concurrent connections
```

---

## Rollback Procedure

If WebSocket causes issues:

1. **Stop server:** Ctrl+C
2. **Revert changes:** `git revert HEAD`
3. **Reinstall:** `npm install`
4. **Restart:** `npm start`

Expected: All requests fallback to HTTP polling (2min latency)

---

## Success Criteria

- ✅ WebSocket connects within 500ms
- ✅ Score updates within 50ms of broadcast
- ✅ Auto-fallback to polling if WebSocket unavailable
- ✅ Status indicator shows correct mode
- ✅ No memory leaks over 1000+ updates
- ✅ Works with 10+ concurrent clients
- ✅ Manual refresh button works
- ✅ Page works on all modern browsers

---

## Next Steps

After testing passes:

1. Deploy to production
2. Monitor metrics for 24 hours
3. Gather user feedback
4. Optimize based on real-world usage
5. Plan for Phase 2: ESPN API polling optimization
