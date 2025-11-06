# Collaborative Drawing Canvas - Architecture Document

## System Overview

This document describes the technical architecture of the Collaborative Drawing Canvas application, including data flow, WebSocket protocol, state management, and design decisions.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Instances                        │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │   Client User A      │  │   Client User B      │         │
│  │  ┌────────────────┐  │  │  ┌────────────────┐  │         │
│  │  │  index.html    │  │  │  │  index.html    │  │         │
│  │  │  main.js       │  │  │  │  main.js       │  │         │
│  │  │  canvas.js     │  │  │  │  canvas.js     │  │         │
│  │  │  websocket.js  │  │  │  │  websocket.js  │  │         │
│  │  └────────────────┘  │  │  └────────────────┘  │         │
│  └──────────────────────┘  └──────────────────────┘         │
│            │                         │                       │
│            └─────────────┬───────────┘                       │
│                          │                                   │
│                    WebSocket                                 │
└──────────────────────────┼──────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │   Node.js Server   │
                │  (server.js)       │
                └────────┬───────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │ RoomManager │ │ DrawingState│ │   Users     │
   │ (rooms.js)  │ │  Manager    │ │  & Cursors  │
   │             │ │(drawing-    │ │             │
   │ - Rooms     │ │ state.js)   │ │             │
   │ - Users     │ │             │ │ - Positions │
   │ - Broadcast │ │ - History   │ │ - Colors    │
   │             │ │ - Undo/Redo │ │             │
   └─────────────┘ └─────────────┘ └─────────────┘
```

## Data Flow Diagram

### Drawing Event Flow

```
User A Drawing
      │
      ▼
┌─────────────────────┐
│ canvas.mousedown    │
│ canvas.mousemove    │
│ canvas.mouseup      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ CanvasManager                   │
│ - Draw on local canvas          │
│ - Save to history (undo/redo)   │
│ - Emit onDrawing event          │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ main.js                         │
│ - Call wsManager.sendDrawing()  │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ WebSocket Message               │
│ {                               │
│   type: 'draw',                 │
│   userId: 'user_123',           │
│   fromX, fromY, toX, toY,       │
│   color, width, tool            │
│ }                               │
└──────┬──────────────────────────┘
       │
       ▼
    (Network)
       │
       ▼
┌──────────────────────────────────┐
│ server.js - handleMessage()      │
│ - Receive 'draw' message         │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ drawingStateManager.recordAction │
│ - Store action in history        │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ room.broadcast()                 │
│ - Send to all users except sender│
└──────┬───────────────────────────┘
       │
       ▼
    (Network)
       │
       ▼
┌──────────────────────────────────┐
│ Client (User B) receives message │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ wsManager.handleMessage()        │
│ - Trigger onDrawing callback    │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ canvasManager.handleRemoteDrawing│
│ - Draw line on canvas            │
└──────────────────────────────────┘
```

## WebSocket Protocol

### Message Types

#### 1. Connection Management

**join** (Client → Server)
```json
{
  "type": "join",
  "userId": "user_1234567890_xyz",
  "roomId": "default"
}
```

**joined** (Server → Client)
```json
{
  "type": "joined",
  "userId": "user_1234567890_xyz",
  "roomId": "default",
  "users": [
    {"userId": "user_other_abc"},
    {"userId": "user_other_def"}
  ],
  "canvasState": {
    "actions": [
      {
        "type": "draw",
        "userId": "user_other_abc",
        "fromX": 100, "fromY": 150,
        "toX": 105, "toY": 155,
        "color": "#000000",
        "width": 5,
        "tool": "brush"
      }
    ],
    "historyIndex": 5
  }
}
```

**user-joined** (Server → All Clients)
```json
{
  "type": "user-joined",
  "userId": "user_new_xyz",
  "timestamp": 1699276800000
}
```

**user-left** (Server → All Clients)
```json
{
  "type": "user-left",
  "userId": "user_left_xyz"
}
```

#### 2. Drawing Operations

**draw** (Client → Server, Server → Clients)
```json
{
  "type": "draw",
  "userId": "user_1234567890_xyz",
  "roomId": "default",
  "fromX": 100,
  "fromY": 150,
  "toX": 105,
  "toY": 155,
  "color": "#000000",
  "width": 5,
  "tool": "brush",
  "timestamp": 1699276800000
}
```

**clear** (Client → Server, Server → Clients)
```json
{
  "type": "clear",
  "userId": "user_1234567890_xyz",
  "roomId": "default",
  "timestamp": 1699276800000
}
```

#### 3. Undo/Redo Operations

**undo** (Client → Server, Server → Clients)
```json
{
  "type": "undo",
  "userId": "user_1234567890_xyz",
  "roomId": "default",
  "timestamp": 1699276800000
}
```

**redo** (Client → Server, Server → Clients)
```json
{
  "type": "redo",
  "userId": "user_1234567890_xyz",
  "roomId": "default",
  "timestamp": 1699276800000
}
```

#### 4. Cursor/Presence

**cursor** (Client → Server, Server → Clients)
```json
{
  "type": "cursor",
  "userId": "user_1234567890_xyz",
  "roomId": "default",
  "x": 150,
  "y": 200,
  "timestamp": 1699276800000
}
```

#### 5. Canvas Synchronization

**sync-request** (Client → Server)
```json
{
  "type": "sync-request",
  "userId": "user_1234567890_xyz",
  "roomId": "default"
}
```

**canvas-sync** (Server → Client)
```json
{
  "type": "canvas-sync",
  "canvasState": {
    "actions": [],
    "historyIndex": 0,
    "imageData": null
  },
  "timestamp": 1699276800000
}
```

#### 6. Latency Measurement

**ping** (Client → Server)
```json
{
  "type": "ping"
}
```

**pong** (Server → Client)
```json
{
  "type": "pong"
}
```

#### 7. Error Handling

**error** (Server → Client)
```json
{
  "type": "error",
  "error": "Error message"
}
```

## State Management

### Client-Side State (main.js)

```javascript
{
  // Drawing state
  currentTool: 'brush',              // 'brush' or 'eraser'
  currentColor: '#000000',           // Hex color
  currentWidth: 5,                   // Pixel width
  isDrawing: false,                  // Is user currently drawing

  // Remote users
  remoteUsers: Map {
    'user_abc': { userId, ... }
  },

  // Remote cursors
  remoteCursors: Map {
    'user_abc': HTMLElement
  },

  // User colors
  userColors: Map {
    'user_abc': '#FF6B6B'
  }
}
```

### Canvas Manager State (canvas.js)

```javascript
{
  // Drawing parameters
  currentTool: 'brush',
  currentColor: '#000000',
  currentWidth: 5,
  isDrawing: false,

  // Undo/Redo
  history: [ImageData, ImageData, ...],  // Canvas states
  historyStep: 2,                         // Current position
  maxHistorySize: 50
}
```

### Server-Side Room State (rooms.js)

```javascript
{
  roomId: 'default',
  users: Map {
    'user_abc': {
      ws: WebSocket,
      userId: 'user_abc',
      roomId: 'default',
      cursor: { x: 100, y: 150 }
    }
  },
  createdAt: 1699276800000
}
```

### Server-Side Drawing State (drawing-state.js)

```javascript
{
  roomId: 'default',
  actions: [
    {
      type: 'draw',
      userId: 'user_abc',
      fromX: 100, fromY: 150,
      toX: 105, toY: 155,
      color: '#000000',
      width: 5,
      tool: 'brush',
      timestamp: 1699276800000,
      id: 'action_123'
    },
    // ... more actions
  ],
  historyIndex: 5,           // Current position in history
  maxHistorySize: 100,
  lastCanvasSnapshot: null   // Optional: ImageData for new joins
}
```

## Undo/Redo Strategy

### Problem Statement
Global undo/redo in a collaborative environment is complex because:
1. Multiple users can edit simultaneously
2. When User A undoes, what should happen to User B's subsequent actions?
3. Network latency can cause operation ordering issues

### Solution Implemented

#### Two-Level Approach

**1. Client-Side History (Local)**
- Each client maintains its own canvas state history (max 50 states)
- When user presses Undo/Redo, it uses local history
- Local undo doesn't affect what the user sees from others

**2. Server-Side History (Global)**
- Server maintains action history for each room (max 100 actions)
- Server tracks current position in history (`historyIndex`)
- When undo/redo is issued, server updates its history position
- Server broadcasts updated history state to all clients

#### Undo/Redo Flow

```
User A presses Undo
        │
        ▼
Client: canvasManager.undo()
  - Move local historyStep backward
  - Restore canvas from history
        │
        ▼
Send 'undo' message to server
        │
        ▼
Server: drawingStateManager.undo()
  - Decrement historyIndex
  - Broadcast undo to all clients
        │
        ▼
All clients: handleRemoteUndo()
  - All clients move to new historyIndex
  - Clients rebuild canvas by replaying actions 0 to historyIndex
```

#### Action Replay Logic

When a new client joins or after undo/redo:
1. Server sends current action sequence (filtered by historyIndex)
2. Client iterates through actions in order
3. For each draw action: render the line
4. For each clear action: clear canvas
5. Canvas is now synchronized with all other clients

### Conflict Resolution

**Concurrent Modifications:**
- When User A is drawing and User B undoes:
  1. User A's draw message arrives at server
  2. Server records it (new action after historyIndex)
  3. Server sends to User B
  4. User B renders the new stroke while in "undone" state

**Result:** Users see a consistent view determined by current historyIndex

### Limitations of This Approach

1. **Undo affects all users**: When one user undoes, everyone's view changes
   - This is acceptable for small teams
   - For large teams, consider Operational Transformation (OT)

2. **Action ordering relies on server**: Network timing could cause issues
   - Mitigated by server as source of truth
   - Could be improved with Lamport timestamps

## Canvas Drawing Implementation

### Path Optimization

The drawing system uses efficient path rendering:

```javascript
// Browser batch renders path segments
ctx.beginPath();
ctx.moveTo(lastX, lastY);
ctx.lineTo(x, y);
ctx.stroke();
```

**Benefits:**
- Smooth line appearance
- Single context operation per frame
- Reduced CPU usage compared to drawing individual pixels

### Stroke Properties

```javascript
ctx.strokeStyle = color;      // Color from palette
ctx.lineWidth = width;        // 1-50 pixels
ctx.lineCap = 'round';        // Smooth endpoints
ctx.lineJoin = 'round';       // Smooth corners
```

### Eraser Implementation

Eraser uses `clearRect` instead of drawing:
```javascript
ctx.clearRect(x - width/2, y - width/2, width, width);
```

This creates a transparent area, revealing white canvas underneath.

## Performance Decisions

### 1. Message Frequency
- **Drawing events**: Sent on every mousemove (60 FPS potential)
- **Cursor events**: Sent on every mousemove (will be rate-limited)
- **Undo/Redo**: Sent once per action

**Why:** High frequency for smooth perception, but could be optimized with batching

### 2. History Limits
- **Client history**: 50 states (max canvas snapshots in memory)
- **Server history**: 100 actions (operational history)

**Why:** Balance between undo depth and memory usage

### 3. Canvas State Caching
- New joiners receive action history, not bitmap
- No large image transfers on join
- Clients reconstruct state by replaying actions

**Why:** Scalable to large canvases, works with many joins

### 4. Room Management
- In-memory rooms (no database)
- Rooms are garbage collected when empty
- No persistence between server restarts

**Why:** Simpler implementation, suitable for demo/testing

## Scalability Considerations

### Current Limitations
- **Single server**: All connections handled by one Node.js process
- **In-memory state**: Rooms and history stored in RAM
- **No persistence**: Drawing data lost on server restart

### Scaling to 100+ Concurrent Users

#### Architecture Changes Needed:

1. **Multi-Server Deployment**
   ```
   Load Balancer
         │
    ┌────┼────┐
    │    │    │
   Server Server Server
     1     2     3
   ```
   - Sticky sessions for WebSocket connections
   - Redis pub/sub for cross-server communication

2. **Shared State**
   ```javascript
   // Instead of in-memory Map
   const redis = require('redis');
   const roomCache = redis.createClient();

   // Rooms stored in Redis
   // Drawing history in database
   ```

3. **Database for Persistence**
   - PostgreSQL or MongoDB for drawing history
   - Allows session recovery
   - Enables drawing storage/sharing

4. **Optimization Strategies**
   - Message compression for large canvases
   - Delta updates (only changed pixels)
   - Client-side prediction for cursor smoothness
   - Action batching before broadcast

### Estimated Scaling
- **Current**: 10-20 concurrent users per server
- **With optimization**: 100-200 users per server
- **With clustering**: 1000+ concurrent users

## Conflict Resolution Strategy

### Types of Conflicts

1. **Simultaneous Drawing**
   - User A and User B draw at same location simultaneously
   - **Resolution**: Both strokes are rendered independently
   - **Result**: Strokes overlap naturally on canvas

2. **Undo While Drawing**
   - User A undoes while User B is still drawing
   - **Resolution**: User A's canvas goes to earlier state, User B's new strokes are added
   - **Result**: Inconsistency until User B finishes and refresh occurs

3. **Network Latency**
   - Actions arrive out of order due to network delays
   - **Resolution**: Server timestamps and sequences actions
   - **Result**: Small visual delays but eventual consistency

### Consistency Guarantees

- **Eventual Consistency**: All users will eventually see the same canvas
- **Causal Consistency**: If User A's action depends on User B's, ordering is preserved
- **Strong Consistency**: Not guaranteed due to network nature

## Error Handling

### Network Errors
```javascript
ws.onerror = (error) => {
  // Attempt reconnection
  scheduleReconnect();
}
```

### Message Queue During Disconnection
```javascript
if (!connected) {
  messageQueue.push(message);  // Queue for later
}

// When reconnected:
while (messageQueue.length > 0) {
  send(messageQueue.shift());
}
```

### Invalid Messages
```javascript
try {
  const message = JSON.parse(data);
  // Process message
} catch (error) {
  // Send error response
  ws.send(JSON.stringify({ type: 'error', error: 'Invalid format' }));
}
```

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebSocket | ✓ | ✓ | ✓ | ✓ |
| Canvas API | ✓ | ✓ | ✓ | ✓ |
| Touch Events | ✓ | ✓ | ✓ | ✓ |
| Promise/Async | ✓ | ✓ | ✓ | ✓ |

## Security Considerations

### Current Implementation
- No authentication (accept all users)
- No authorization (all users can draw/undo)
- No rate limiting (DoS vulnerable)

### For Production
1. **Authentication**: JWT tokens with user identity
2. **Authorization**: Permission checks on actions
3. **Rate Limiting**: Limit draw events per second
4. **Input Validation**: Sanitize all drawing coordinates
5. **HTTPS/WSS**: Use secure connections
6. **Room Access Control**: Private rooms require password

## Testing Strategy

### Unit Tests
- Canvas drawing operations (path generation, erasing)
- Undo/redo logic (history navigation)
- Message parsing and handling

### Integration Tests
- Multi-user drawing synchronization
- Undo/redo across network
- Room isolation

### Load Tests
- Concurrent user connections
- Message throughput
- Memory usage under load

### Manual Tests
- Browser compatibility
- Network condition handling
- Touch input on mobile

## Summary of Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **WebSocket over HTTP polling** | Low latency, bidirectional, real-time |
| **In-memory state** | Fast access, simple implementation |
| **Action-based history** | Scalable to large drawings, not bitmap snapshots |
| **Server as source of truth** | Prevents inconsistency, resolves conflicts |
| **Per-room isolation** | Multiple canvases, no cross-room interference |
| **Canvas API (no libraries)** | Direct performance control, explicit operations |
| **Vanilla JavaScript (no frameworks)** | Demonstrate DOM and Canvas skills |
| **Message queuing** | Handles temporary disconnections gracefully |

## Future Architecture Improvements

1. **Operational Transformation (OT)** for better concurrent editing
2. **Event Sourcing** pattern for complete audit trail
3. **WebGL** rendering for unlimited canvas size
4. **Database** for persistence and history
5. **Microservices** for scaling individual components
6. **Docker** containerization for deployment
7. **Kubernetes** orchestration for cloud scaling
