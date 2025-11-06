/**
 * Collaborative Drawing Canvas Server
 * Handles WebSocket connections, room management, and canvas synchronization
 */

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const RoomManager = require('./rooms');
const DrawingStateManager = require('./drawing-state');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.static(path.join(__dirname, '../client')));

// Room management
const roomManager = new RoomManager();
const drawingStateManager = new DrawingStateManager();

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    console.log('Client connected');

    let userId = null;
    let roomId = null;
    let clientInfo = {
        ws,
        userId,
        roomId,
        cursor: { x: 0, y: 0 }
    };

    /**
     * Handle incoming messages
     */
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleMessage(message, clientInfo);
        } catch (error) {
            console.error('Error parsing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                error: 'Invalid message format'
            }));
        }
    });

    /**
     * Handle client disconnect
     */
    ws.on('close', () => {
        if (clientInfo.roomId && clientInfo.userId) {
            handleDisconnect(clientInfo);
        }
        console.log('Client disconnected:', clientInfo.userId);
    });

    /**
     * Handle WebSocket errors
     */
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    /**
     * Handle incoming message routing
     */
    function handleMessage(message, clientInfo) {
        switch (message.type) {
            case 'join':
                handleJoin(message, clientInfo);
                break;
            case 'draw':
                handleDraw(message, clientInfo);
                break;
            case 'cursor':
                handleCursor(message, clientInfo);
                break;
            case 'undo':
                handleUndo(message, clientInfo);
                break;
            case 'redo':
                handleRedo(message, clientInfo);
                break;
            case 'clear':
                handleClear(message, clientInfo);
                break;
            case 'sync-request':
                handleSyncRequest(message, clientInfo);
                break;
            case 'ping':
                clientInfo.ws.send(JSON.stringify({ type: 'pong' }));
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    /**
     * Handle user join
     */
    function handleJoin(message, clientInfo) {
        clientInfo.userId = message.userId;
        clientInfo.roomId = message.roomId;

        // Add user to room
        const room = roomManager.joinRoom(clientInfo.roomId, clientInfo);

        // Get current canvas state
        const canvasState = drawingStateManager.getCanvasState(clientInfo.roomId);

        // Send join confirmation to client
        clientInfo.ws.send(JSON.stringify({
            type: 'joined',
            userId: clientInfo.userId,
            roomId: clientInfo.roomId,
            users: room.getUsers().filter(u => u.userId !== clientInfo.userId),
            canvasState: canvasState
        }));

        // Notify other users in the room
        room.broadcast({
            type: 'user-joined',
            userId: clientInfo.userId,
            timestamp: message.timestamp
        }, clientInfo.userId);

        console.log(`User ${clientInfo.userId} joined room ${clientInfo.roomId}`);
    }

    /**
     * Handle drawing event
     */
    function handleDraw(message, clientInfo) {
        if (!clientInfo.roomId) return;

        const room = roomManager.getRoom(clientInfo.roomId);
        if (!room) return;

        // Record the drawing action in drawing state
        drawingStateManager.recordAction(clientInfo.roomId, {
            type: 'draw',
            userId: message.userId,
            fromX: message.fromX,
            fromY: message.fromY,
            toX: message.toX,
            toY: message.toY,
            color: message.color,
            width: message.width,
            tool: message.tool,
            timestamp: message.timestamp
        });

        // Broadcast to other users in the room
        room.broadcast({
            type: 'draw',
            userId: message.userId,
            fromX: message.fromX,
            fromY: message.fromY,
            toX: message.toX,
            toY: message.toY,
            color: message.color,
            width: message.width,
            tool: message.tool,
            timestamp: message.timestamp
        }, message.userId);
    }

    /**
     * Handle cursor movement
     */
    function handleCursor(message, clientInfo) {
        if (!clientInfo.roomId) return;

        clientInfo.cursor = { x: message.x, y: message.y };

        const room = roomManager.getRoom(clientInfo.roomId);
        if (!room) return;

        // Broadcast cursor to other users (throttled)
        room.broadcast({
            type: 'cursor',
            userId: message.userId,
            x: message.x,
            y: message.y,
            timestamp: message.timestamp
        }, message.userId);
    }

    /**
     * Handle undo
     */
    function handleUndo(message, clientInfo) {
        if (!clientInfo.roomId) return;

        const room = roomManager.getRoom(clientInfo.roomId);
        if (!room) return;

        // Record undo action
        const undoState = drawingStateManager.undo(clientInfo.roomId);

        // Broadcast undo to all users in the room
        room.broadcast({
            type: 'undo',
            userId: message.userId,
            historyStep: undoState.historyStep,
            timestamp: message.timestamp
        });

        console.log(`User ${message.userId} undid an action in room ${clientInfo.roomId}`);
    }

    /**
     * Handle redo
     */
    function handleRedo(message, clientInfo) {
        if (!clientInfo.roomId) return;

        const room = roomManager.getRoom(clientInfo.roomId);
        if (!room) return;

        // Record redo action
        const redoState = drawingStateManager.redo(clientInfo.roomId);

        // Broadcast redo to all users in the room
        room.broadcast({
            type: 'redo',
            userId: message.userId,
            historyStep: redoState.historyStep,
            timestamp: message.timestamp
        });

        console.log(`User ${message.userId} redid an action in room ${clientInfo.roomId}`);
    }

    /**
     * Handle clear canvas
     */
    function handleClear(message, clientInfo) {
        if (!clientInfo.roomId) return;

        const room = roomManager.getRoom(clientInfo.roomId);
        if (!room) return;

        // Record clear action
        drawingStateManager.clear(clientInfo.roomId);

        // Broadcast clear to all users in the room
        room.broadcast({
            type: 'clear',
            userId: message.userId,
            timestamp: message.timestamp
        });

        console.log(`User ${message.userId} cleared the canvas in room ${clientInfo.roomId}`);
    }

    /**
     * Handle sync request
     */
    function handleSyncRequest(message, clientInfo) {
        if (!clientInfo.roomId) return;

        const canvasState = drawingStateManager.getCanvasState(clientInfo.roomId);

        clientInfo.ws.send(JSON.stringify({
            type: 'canvas-sync',
            canvasState: canvasState,
            timestamp: message.timestamp
        }));
    }

    /**
     * Handle user disconnect
     */
    function handleDisconnect(clientInfo) {
        const room = roomManager.getRoom(clientInfo.roomId);

        if (room) {
            // Remove user from room
            room.removeUser(clientInfo.userId);

            // Notify other users
            if (room.getUsers().length > 0) {
                room.broadcast({
                    type: 'user-left',
                    userId: clientInfo.userId
                });
            } else {
                // If room is empty, clean it up
                roomManager.deleteRoom(clientInfo.roomId);
                console.log(`Room ${clientInfo.roomId} deleted (empty)`);
            }
        }
    }
});

// HTTP endpoint to get room info
app.get('/api/room/:roomId', (req, res) => {
    const room = roomManager.getRoom(req.params.roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
        roomId: req.params.roomId,
        userCount: room.getUsers().length,
        users: room.getUsers().map(u => ({ userId: u.userId }))
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        activeRooms: roomManager.getRoomCount(),
        totalConnections: wss.clients.size
    });
});

// Serve index.html for any unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.close();
        }
    });

    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
