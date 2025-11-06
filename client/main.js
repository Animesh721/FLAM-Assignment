/**
 * Main Application Entry Point
 * Coordinates canvas drawing, WebSocket communication, and UI updates
 */

class CollaborativeDrawingApp {
    constructor() {
        // Initialize canvas
        this.canvas = document.getElementById('drawingCanvas');
        this.canvasManager = new CanvasManager(this.canvas);

        // Initialize WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        this.wsManager = new WebSocketManager(wsUrl);

        // UI Elements
        this.toolButtons = document.querySelectorAll('.tool-btn[data-tool]');
        this.colorButtons = document.querySelectorAll('.color-btn');
        this.colorPicker = document.getElementById('colorPicker');
        this.strokeWidthInput = document.getElementById('strokeWidth');
        this.sizeDisplay = document.getElementById('sizeDisplay');
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.roomIdDisplay = document.getElementById('roomId');
        this.usersList = document.getElementById('usersList');
        this.latencyDisplay = document.getElementById('latency');
        this.cursorLayer = document.getElementById('cursorLayer');

        // Drawing state
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.currentWidth = 5;
        this.isDrawing = false;

        // Remote users state
        this.remoteUsers = new Map();
        this.remoteCursors = new Map();
        this.userColors = new Map();
        this.colorPalette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
        this.nextColorIndex = 0;

        // Setup event listeners
        this.setupUIListeners();
        this.setupCanvasListeners();
        this.setupWebSocketListeners();
        this.setupKeyboardShortcuts();

        // Connect to server
        this.wsManager.connect();

        // Start cursor tracking
        this.setupCursorTracking();
    }

    /**
     * Setup UI event listeners
     */
    setupUIListeners() {
        // Tool selection
        this.toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toolButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
                this.canvasManager.setTool(this.currentTool);
            });
        });

        // Color selection
        this.colorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = btn.dataset.color;
                this.setColor(color);
            });
        });

        // Custom color picker
        this.colorPicker.addEventListener('input', (e) => {
            this.setColor(e.target.value);
        });

        // Stroke width
        this.strokeWidthInput.addEventListener('input', (e) => {
            this.currentWidth = parseInt(e.target.value);
            this.sizeDisplay.textContent = this.currentWidth;
            this.canvasManager.setStrokeWidth(this.currentWidth);
        });

        // Undo/Redo
        this.undoBtn.addEventListener('click', () => this.handleUndo());
        this.redoBtn.addEventListener('click', () => this.handleRedo());

        // Clear canvas
        this.clearBtn.addEventListener('click', () => this.handleClear());
    }

    /**
     * Setup canvas event listeners
     */
    setupCanvasListeners() {
        // Drawing events from local canvas
        this.canvasManager.onDrawing = (fromX, fromY, toX, toY) => {
            if (this.wsManager.isConnected()) {
                this.wsManager.sendDrawing(
                    fromX, fromY, toX, toY,
                    this.currentColor,
                    this.currentWidth,
                    this.currentTool
                );
            }
        };

        this.canvasManager.onDrawStart = (x, y) => {
            // Could be used for additional logic
        };

        this.canvasManager.onDrawEnd = () => {
            // Could be used for additional logic
        };
    }

    /**
     * Setup WebSocket event listeners
     */
    setupWebSocketListeners() {
        this.wsManager.onConnect = () => {
            this.updateConnectionStatus(true);
            console.log('Connected to server');
        };

        this.wsManager.onDisconnect = () => {
            this.updateConnectionStatus(false);
            console.log('Disconnected from server');
        };

        this.wsManager.onDrawing = (event) => {
            // Handle drawing from other users
            this.canvasManager.handleRemoteDrawing(event);
        };

        this.wsManager.onUserJoined = (user) => {
            console.log('User joined:', user);
            this.remoteUsers.set(user.userId, user);
            this.assignUserColor(user.userId);
            this.updateUsersList();
        };

        this.wsManager.onUserLeft = (event) => {
            console.log('User left:', event.userId);
            this.remoteUsers.delete(event.userId);
            this.remoteCursors.delete(event.userId);
            this.removeCursorDisplay(event.userId);
            this.updateUsersList();
        };

        this.wsManager.onUsersCursor = (event) => {
            // Update remote cursor position
            this.updateRemoteCursor(event.userId, event.x, event.y);
        };

        this.wsManager.onRemoteUndo = (event) => {
            console.log('Remote undo:', event);
            // In a real implementation, you'd handle this based on the server's strategy
            this.handleRemoteUndo(event);
        };

        this.wsManager.onRemoteRedo = (event) => {
            console.log('Remote redo:', event);
            this.handleRemoteRedo(event);
        };

        this.wsManager.onCanvasSync = (state) => {
            console.log('Canvas sync received');
            if (state && state.imageData) {
                // Load the canvas state from server
                const img = new Image();
                img.onload = () => {
                    const ctx = this.canvas.getContext('2d');
                    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
                img.src = state.imageData;
            }
        };

        this.wsManager.onError = (error) => {
            console.error('WebSocket error:', error);
            // Could show error message to user
        };
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    this.handleUndo();
                } else if (e.key === 'y' || (e.shiftKey && e.key === 'z')) {
                    e.preventDefault();
                    this.handleRedo();
                }
            }
        });
    }

    /**
     * Setup cursor tracking for remote users
     */
    setupCursorTracking() {
        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Only send if cursor is over canvas
            if (x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height) {
                this.wsManager.sendCursor(x, y);
            }
        });
    }

    /**
     * Handle undo action
     */
    handleUndo() {
        const success = this.canvasManager.undo();
        if (success) {
            this.wsManager.sendUndo();
        }
    }

    /**
     * Handle redo action
     */
    handleRedo() {
        const success = this.canvasManager.redo();
        if (success) {
            this.wsManager.sendRedo();
        }
    }

    /**
     * Handle clear canvas action
     */
    handleClear() {
        if (confirm('Are you sure you want to clear the entire canvas?')) {
            this.canvasManager.clear();
            this.wsManager.sendClear();
        }
    }

    /**
     * Handle remote undo
     */
    handleRemoteUndo(event) {
        // Apply undo operation from remote user
        this.canvasManager.undo();
    }

    /**
     * Handle remote redo
     */
    handleRemoteRedo(event) {
        // Apply redo operation from remote user
        this.canvasManager.redo();
    }

    /**
     * Set color and update UI
     */
    setColor(color) {
        this.currentColor = color;
        this.colorPicker.value = color;
        this.canvasManager.setColor(color);
    }

    /**
     * Assign a color to a user
     */
    assignUserColor(userId) {
        if (!this.userColors.has(userId)) {
            const color = this.colorPalette[this.nextColorIndex % this.colorPalette.length];
            this.userColors.set(userId, color);
            this.nextColorIndex++;
        }
    }

    /**
     * Update remote cursor display
     */
    updateRemoteCursor(userId, x, y) {
        let cursor = this.remoteCursors.get(userId);

        if (!cursor) {
            cursor = document.createElement('div');
            cursor.className = 'remote-cursor';
            const color = this.userColors.get(userId) || '#000000';
            cursor.style.borderColor = color;
            cursor.textContent = userId.substring(5, 8); // Short ID

            const label = document.createElement('div');
            label.className = 'remote-cursor-label';
            label.style.backgroundColor = color;
            label.textContent = userId.substring(0, 12) + '...';
            label.style.left = '0px';

            cursor.appendChild(label);
            this.cursorLayer.appendChild(cursor);
            this.remoteCursors.set(userId, cursor);
        }

        cursor.style.left = (x - 10) + 'px';
        cursor.style.top = (y - 10) + 'px';
    }

    /**
     * Remove cursor display
     */
    removeCursorDisplay(userId) {
        const cursor = this.remoteCursors.get(userId);
        if (cursor) {
            cursor.remove();
            this.remoteCursors.delete(userId);
        }
    }

    /**
     * Update connection status UI
     */
    updateConnectionStatus(connected) {
        if (connected) {
            this.connectionStatus.textContent = 'Connected';
            this.statusIndicator.classList.add('connected');
            this.statusIndicator.classList.remove('disconnected');
        } else {
            this.connectionStatus.textContent = 'Disconnected';
            this.statusIndicator.classList.remove('connected');
            this.statusIndicator.classList.add('disconnected');
        }
    }

    /**
     * Update users list display
     */
    updateUsersList() {
        this.usersList.innerHTML = '';

        if (this.remoteUsers.size === 0) {
            this.usersList.innerHTML = '<li>You are alone</li>';
        } else {
            this.remoteUsers.forEach((user, userId) => {
                const li = document.createElement('li');
                const color = this.userColors.get(userId) || '#000000';

                const indicator = document.createElement('div');
                indicator.className = 'user-color-indicator';
                indicator.style.backgroundColor = color;

                const text = document.createElement('span');
                text.textContent = userId.substring(0, 16) + '...';

                li.appendChild(indicator);
                li.appendChild(text);
                this.usersList.appendChild(li);
            });
        }
    }

    /**
     * Update room ID display
     */
    setRoomId(roomId) {
        this.roomIdDisplay.textContent = roomId;
    }

    /**
     * Update latency display
     */
    updateLatency() {
        setInterval(() => {
            const latency = this.wsManager.getLatency();
            this.latencyDisplay.textContent = `Latency: ${latency}ms`;
        }, 1000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CollaborativeDrawingApp();
});
