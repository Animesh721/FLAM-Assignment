/**
 * WebSocket Client Manager
 * Handles real-time communication with the server
 */

class WebSocketManager {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.connected = false;
        this.userId = null;
        this.roomId = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.messageQueue = [];
        this.latency = 0;
        this.lastPingTime = 0;

        // Callbacks
        this.onConnect = null;
        this.onDisconnect = null;
        this.onDrawing = null;
        this.onUserJoined = null;
        this.onUserLeft = null;
        this.onRemoteUndo = null;
        this.onRemoteRedo = null;
        this.onUsersCursor = null;
        this.onCanvasSync = null;
        this.onError = null;
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        try {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => this.handleOpen();
            this.ws.onmessage = (event) => this.handleMessage(event);
            this.ws.onerror = (error) => this.handleError(error);
            this.ws.onclose = () => this.handleClose();
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.scheduleReconnect();
        }
    }

    /**
     * Handle WebSocket open
     */
    handleOpen() {
        console.log('WebSocket connected');
        this.connected = true;
        this.reconnectAttempts = 0;

        // Flush message queue
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }

        // Generate user ID if not already set
        if (!this.userId) {
            this.userId = this.generateUserId();
        }

        // Request to join room
        this.send({
            type: 'join',
            userId: this.userId,
            roomId: this.roomId || 'default'
        });

        if (this.onConnect) {
            this.onConnect();
        }

        // Start ping interval for latency measurement
        this.startPingInterval();
    }

    /**
     * Handle incoming message
     */
    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case 'joined':
                    this.handleJoined(message);
                    break;
                case 'draw':
                    this.handleDraw(message);
                    break;
                case 'user-joined':
                    this.handleUserJoined(message);
                    break;
                case 'user-left':
                    this.handleUserLeft(message);
                    break;
                case 'cursor':
                    this.handleCursor(message);
                    break;
                case 'undo':
                    this.handleRemoteUndo(message);
                    break;
                case 'redo':
                    this.handleRemoteRedo(message);
                    break;
                case 'canvas-sync':
                    this.handleCanvasSync(message);
                    break;
                case 'pong':
                    this.handlePong(message);
                    break;
                case 'error':
                    this.handleMessageError(message);
                    break;
                default:
                    console.warn('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }

    /**
     * Handle joined message (server acknowledges join)
     */
    handleJoined(message) {
        this.roomId = message.roomId;
        this.userId = message.userId;

        console.log(`Joined room ${this.roomId} as user ${this.userId}`);

        if (message.users) {
            if (this.onUserJoined) {
                // Notify about existing users
                message.users.forEach(user => {
                    this.onUserJoined(user);
                });
            }
        }

        if (message.canvasState) {
            if (this.onCanvasSync) {
                this.onCanvasSync(message.canvasState);
            }
        }
    }

    /**
     * Handle draw message from other users
     */
    handleDraw(message) {
        if (this.onDrawing && message.userId !== this.userId) {
            this.onDrawing(message);
        }
    }

    /**
     * Handle user joined notification
     */
    handleUserJoined(message) {
        console.log('User joined:', message.userId);
        if (this.onUserJoined) {
            this.onUserJoined(message);
        }
    }

    /**
     * Handle user left notification
     */
    handleUserLeft(message) {
        console.log('User left:', message.userId);
        if (this.onUserLeft) {
            this.onUserLeft(message);
        }
    }

    /**
     * Handle cursor position update
     */
    handleCursor(message) {
        if (this.onUsersCursor) {
            this.onUsersCursor(message);
        }
    }

    /**
     * Handle remote undo operation
     */
    handleRemoteUndo(message) {
        console.log('Remote undo received');
        if (this.onRemoteUndo) {
            this.onRemoteUndo(message);
        }
    }

    /**
     * Handle remote redo operation
     */
    handleRemoteRedo(message) {
        console.log('Remote redo received');
        if (this.onRemoteRedo) {
            this.onRemoteRedo(message);
        }
    }

    /**
     * Handle canvas state synchronization
     */
    handleCanvasSync(message) {
        console.log('Canvas sync received');
        if (this.onCanvasSync) {
            this.onCanvasSync(message);
        }
    }

    /**
     * Handle pong (latency measurement)
     */
    handlePong(message) {
        this.latency = Date.now() - this.lastPingTime;
    }

    /**
     * Handle message error
     */
    handleMessageError(message) {
        console.error('Server error:', message.error);
        if (this.onError) {
            this.onError(message.error);
        }
    }

    /**
     * Handle WebSocket error
     */
    handleError(error) {
        console.error('WebSocket error:', error);
        if (this.onError) {
            this.onError('WebSocket connection error');
        }
    }

    /**
     * Handle WebSocket close
     */
    handleClose() {
        console.log('WebSocket disconnected');
        this.connected = false;
        clearInterval(this.pingInterval);

        if (this.onDisconnect) {
            this.onDisconnect();
        }

        this.scheduleReconnect();
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * this.reconnectAttempts;
            console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), delay);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    /**
     * Send message (with queue if not connected)
     */
    send(message) {
        if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            // Queue message for later
            this.messageQueue.push(message);
        }
    }

    /**
     * Send drawing event
     */
    sendDrawing(fromX, fromY, toX, toY, color, width, tool) {
        this.send({
            type: 'draw',
            userId: this.userId,
            roomId: this.roomId,
            fromX,
            fromY,
            toX,
            toY,
            color,
            width,
            tool,
            timestamp: Date.now()
        });
    }

    /**
     * Send cursor position
     */
    sendCursor(x, y) {
        this.send({
            type: 'cursor',
            userId: this.userId,
            roomId: this.roomId,
            x,
            y,
            timestamp: Date.now()
        });
    }

    /**
     * Send undo request
     */
    sendUndo() {
        this.send({
            type: 'undo',
            userId: this.userId,
            roomId: this.roomId,
            timestamp: Date.now()
        });
    }

    /**
     * Send redo request
     */
    sendRedo() {
        this.send({
            type: 'redo',
            userId: this.userId,
            roomId: this.roomId,
            timestamp: Date.now()
        });
    }

    /**
     * Send clear canvas request
     */
    sendClear() {
        this.send({
            type: 'clear',
            userId: this.userId,
            roomId: this.roomId,
            timestamp: Date.now()
        });
    }

    /**
     * Request canvas state sync
     */
    requestCanvasSync() {
        this.send({
            type: 'sync-request',
            userId: this.userId,
            roomId: this.roomId
        });
    }

    /**
     * Start ping interval for latency measurement
     */
    startPingInterval() {
        this.pingInterval = setInterval(() => {
            if (this.connected) {
                this.lastPingTime = Date.now();
                this.send({ type: 'ping' });
            }
        }, 5000);
    }

    /**
     * Generate unique user ID
     */
    generateUserId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect() {
        clearInterval(this.pingInterval);
        if (this.ws) {
            this.ws.close();
        }
        this.connected = false;
    }

    /**
     * Get connection status
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Get current latency
     */
    getLatency() {
        return this.latency;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketManager;
}
