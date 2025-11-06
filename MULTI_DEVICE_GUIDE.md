# Multi-Device Collaborative Drawing Guide

Testing real-time collaboration between multiple devices.

## Prerequisites

- **Same WiFi Network** (for local testing) OR **Internet Access** (for deployed version)
- **Modern Browser** on all devices
- **Server Running** on one device

## Method 1: Local Network Testing (FREE)

### Step-by-Step Instructions

#### 1. Find Your Server's IP Address

**On Windows (Command Prompt):**
```bash
ipconfig
```

**On Mac/Linux (Terminal):**
```bash
ifconfig
```

Look for **IPv4 Address** under your WiFi adapter:
```
IPv4 Address . . . . . . . . . . : 192.168.1.100
```
(Your IP will be different)

#### 2. Start the Server

On the main computer where you want to run the server:

```bash
cd c:\Users\krani\OneDrive\Desktop\flam assignment
npm start
```

You should see:
```
Server is running on http://localhost:3001
WebSocket server is running on ws://localhost:3001
```

#### 3. Access from Device 1 (Server Computer)

Open browser on the same computer:
```
http://localhost:3001
```

#### 4. Access from Device 2 (Other Device on Same WiFi)

**Important**: Replace `192.168.1.100` with YOUR IP from Step 1!

```
http://192.168.1.100:3001
```

#### 5. Test Collaboration

- **Device 1**: Draw something
- **Device 2**: Watch it appear in real-time ✅
- **Device 2**: Draw something
- **Device 1**: Watch it appear ✅
- **Both devices**: Show same canvas ✅

### Example Setup

```
Your WiFi Network: "Home WiFi"
├─ Computer A (Server)
│  ├─ IP: 192.168.1.100
│  ├─ URL: http://localhost:3001 (or http://192.168.1.100:3001)
│  └─ Role: Server & Client
│
├─ Phone (iOS/Android)
│  ├─ Connected to: Home WiFi
│  ├─ URL: http://192.168.1.100:3001
│  └─ Role: Client
│
└─ Tablet
   ├─ Connected to: Home WiFi
   ├─ URL: http://192.168.1.100:3001
   └─ Role: Client
```

---

## Method 2: Multiple Computers on Same Network

### Setup for 2 Computers

**Computer A (Server)**:
1. Find IP: `192.168.1.100`
2. Run: `npm start`
3. Open: `http://localhost:3001`

**Computer B (Client)**:
1. On same WiFi
2. Open: `http://192.168.1.100:3001`

**Result**: Real-time collaboration between computers ✅

---

## Method 3: Multiple Browsers/Tabs (Quick Testing)

No second device needed! Test with multiple tabs:

1. Open Tab 1: `http://localhost:3001`
2. Open Tab 2: `http://localhost:3001`
3. Draw in Tab 1 → See update in Tab 2
4. Draw in Tab 2 → See update in Tab 1

Each tab acts as a separate "user".

---

## Method 4: After Deployment to Heroku/Railway

Once deployed online:

**Device 1 (Anywhere)**:
```
https://your-app-name.herokuapp.com
```

**Device 2 (Anywhere in world)**:
```
https://your-app-name.herokuapp.com
```

Both devices sync in real-time! ✅

---

## Features to Test

### 1. Real-Time Drawing
- [ ] Draw on Device A
- [ ] See stroke appear on Device B instantly

### 2. Multiple Users
- [ ] Check "Users Online" list
- [ ] See user colors assigned
- [ ] See cursor positions

### 3. Undo/Redo
- [ ] Draw on Device A
- [ ] Undo on Device B
- [ ] Both show same state

### 4. Clear Canvas
- [ ] Clear on Device A
- [ ] Device B clears too

### 5. Colors & Tools
- [ ] Change color on Device A
- [ ] Draw with new color
- [ ] See new color on Device B

### 6. Connection Status
- [ ] Green indicator = Connected
- [ ] All devices show "Connected"

---

## Troubleshooting

### "Can't connect from second device"

**Check 1: Is server running?**
```bash
# Terminal should show:
Server is running on http://localhost:3001
```

**Check 2: Correct IP?**
```bash
ipconfig
# Make sure you copied IPv4 Address correctly
```

**Check 3: Same WiFi?**
- All devices must be on same network
- Not just same router, but same WiFi name

**Check 4: Firewall?**
- Windows firewall might block port 3001
- Try: `Windows Defender Firewall` → Allow app through
- Or temporarily disable (testing only)

**Check 5: Try different port**
```bash
PORT=3002 npm start
# Then use http://192.168.1.100:3002
```

### "Drawing not syncing"

**Check browser console (F12)**:
- Open Device 2 browser
- Press F12 → Console tab
- Look for red errors
- Common error: WebSocket connection failed

**Solution**:
- Verify correct IP in URL
- Check port is accessible
- Try reloading page
- Restart server

### "Says 404 Not Found"

**Most likely**:
- Wrong IP address
- Port is not 3001 (or you changed it)
- Server not running

**Fix**:
1. Verify IP: `ipconfig`
2. Verify port: Check terminal
3. Check URL: `http://192.168.1.100:3001`
4. Restart server

### "Can see device 1 but not device 2"

**For Device 2 (the one that can't connect)**:

1. Check it can reach server:
   ```
   Ping 192.168.1.100
   ```

2. Try simpler test:
   ```
   http://192.168.1.100:3001 (should show page)
   ```

3. Check browser allows WebSocket:
   - Open DevTools (F12)
   - Console tab
   - Should NOT show connection errors

---

## Performance Notes

### Local Network
- **Latency**: < 50ms (very fast)
- **Performance**: Excellent
- **Best for**: Testing, development

### Internet (Deployed)
- **Latency**: 50-200ms (depends on distance)
- **Performance**: Good (still real-time)
- **Best for**: Production, worldwide use

---

## Advanced: Testing with 3+ Devices

Open the app on 3 devices simultaneously:

```
Device 1: http://192.168.1.100:3001
Device 2: http://192.168.1.100:3001
Device 3: http://192.168.1.100:3001
```

Each device will show:
- All 3 users in "Users Online"
- All 3 cursors when users hover
- All drawing in real-time

---

## Testing Checklist

### Basic Connectivity
- [ ] Server running
- [ ] Device 2 can open URL
- [ ] Connection status shows "Connected"
- [ ] Can see "Users Online" list

### Drawing Sync
- [ ] Draw on Device 1
- [ ] Appears instantly on Device 2
- [ ] Draw on Device 2
- [ ] Appears instantly on Device 1

### Real-Time Features
- [ ] Cursor positions update
- [ ] User colors visible
- [ ] Undo/redo works across devices
- [ ] Clear canvas affects both

### Stability
- [ ] Draw for 5 minutes
- [ ] No crashes or lag
- [ ] No visual artifacts
- [ ] Smooth performance

---

## What to Show in Demo

1. **Setup**:
   - "Server running on local IP: 192.168.1.100"
   - "Two browsers open to same address"

2. **Synchronization**:
   - Draw on Device A
   - "Instantly appears on Device B"
   - Draw on Device B
   - "Instantly appears on Device A"

3. **Multiple Users**:
   - Show users list
   - Show cursor positions
   - Show different colors

4. **Real-Time Control**:
   - Undo on Device A
   - Both devices update
   - Clear on Device B
   - Both devices clear

---

## Quick Command Reference

```bash
# Find your IP (Windows)
ipconfig

# Find your IP (Mac/Linux)
ifconfig

# Start server
npm start

# Start on custom port
PORT=3002 npm start

# Test connectivity (replace IP)
ping 192.168.1.100
```

---

## Common IPs by Network

| Network Type | Common IP Range | Example |
|--------------|-----------------|---------|
| Home WiFi | 192.168.1.x | 192.168.1.100 |
| Home WiFi | 192.168.0.x | 192.168.0.50 |
| Corporate | 10.x.x.x | 10.0.0.100 |
| Mobile Hotspot | 172.20.x.x | 172.20.10.5 |

Your IP will be in one of these ranges.

---

## Final Checklist

Before showing the demo:

- [ ] Server is running
- [ ] You know your IP address
- [ ] Second device on same WiFi
- [ ] Can access http://YOUR.IP:3001
- [ ] Drawing syncs between devices
- [ ] No console errors in browser
- [ ] Users list shows both devices
- [ ] Undo/redo works across devices

---

**You're ready to show multi-device collaboration!** 🎉

Any questions? Check the main README.md or QUICKSTART.md.
