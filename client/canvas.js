/**
 * Canvas Drawing Manager
 * Handles all canvas operations including drawing, erasing, undo/redo
 */

class CanvasManager {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        // Drawing state
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.currentWidth = 5;
        this.isDrawing = false;

        // History management for undo/redo
        this.history = [];
        this.historyStep = -1;
        this.maxHistorySize = 50;

        // Store initial state
        this.saveState();

        // Event handling
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events for drawing
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseout', (e) => this.handleMouseOut(e));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    /**
     * Save current canvas state to history
     */
    saveState() {
        // Remove any states after current position (for redo consistency)
        if (this.historyStep < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyStep + 1);
        }

        // Save the current image data
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.history.push(imageData);
        this.historyStep++;

        // Maintain max history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyStep--;
        }
    }

    /**
     * Undo last action
     */
    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.restoreState(this.historyStep);
            return true;
        }
        return false;
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.restoreState(this.historyStep);
            return true;
        }
        return false;
    }

    /**
     * Restore canvas to a specific history state
     */
    restoreState(step) {
        if (step >= 0 && step < this.history.length) {
            this.ctx.putImageData(this.history[step], 0, 0);
        }
    }

    /**
     * Clear entire canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
    }

    /**
     * Draw a point (used for remote users)
     */
    drawPoint(x, y, color, width) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, width / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Draw a line (used for remote users)
     */
    drawLine(fromX, fromY, toX, toY, color, width) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
    }

    /**
     * Get canvas content as image data URL
     */
    getCanvasData() {
        return this.canvas.toDataURL('image/png');
    }

    /**
     * Load canvas from image data
     */
    loadCanvasData(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0);
                this.saveState();
                resolve();
            };
            img.onerror = reject;
            img.src = imageUrl;
        });
    }

    /**
     * Handle mouse down event
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;

        // Emit drawing start event
        this.emitDrawStart(x, y);
    }

    /**
     * Handle mouse move event
     */
    handleMouseMove(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Draw locally
        if (this.currentTool === 'brush') {
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.currentWidth;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if (this.currentTool === 'eraser') {
            this.ctx.clearRect(x - this.currentWidth / 2, y - this.currentWidth / 2, this.currentWidth, this.currentWidth);
        }

        // Emit drawing event
        this.emitDrawing(this.lastX, this.lastY, x, y);

        this.lastX = x;
        this.lastY = y;
    }

    /**
     * Handle mouse up event
     */
    handleMouseUp(e) {
        if (!this.isDrawing) return;

        this.isDrawing = false;
        this.saveState();
        this.emitDrawEnd();
    }

    /**
     * Handle mouse out event
     */
    handleMouseOut(e) {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
            this.emitDrawEnd();
        }
    }

    /**
     * Handle touch start event
     */
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;

        this.emitDrawStart(x, y);
    }

    /**
     * Handle touch move event
     */
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDrawing) return;

        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Draw locally
        if (this.currentTool === 'brush') {
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.currentWidth;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if (this.currentTool === 'eraser') {
            this.ctx.clearRect(x - this.currentWidth / 2, y - this.currentWidth / 2, this.currentWidth, this.currentWidth);
        }

        this.emitDrawing(this.lastX, this.lastY, x, y);

        this.lastX = x;
        this.lastY = y;
    }

    /**
     * Handle touch end event
     */
    handleTouchEnd(e) {
        e.preventDefault();
        if (!this.isDrawing) return;

        this.isDrawing = false;
        this.saveState();
        this.emitDrawEnd();
    }

    /**
     * Set current tool
     */
    setTool(tool) {
        this.currentTool = tool;
    }

    /**
     * Set current color
     */
    setColor(color) {
        this.currentColor = color;
    }

    /**
     * Set current stroke width
     */
    setStrokeWidth(width) {
        this.currentWidth = width;
    }

    /**
     * Get current canvas state for synchronization
     */
    getState() {
        return {
            tool: this.currentTool,
            color: this.currentColor,
            width: this.currentWidth
        };
    }

    /**
     * Callback methods (to be overridden by main app)
     */
    emitDrawStart(x, y) {
        if (this.onDrawStart) this.onDrawStart(x, y);
    }

    emitDrawing(fromX, fromY, toX, toY) {
        if (this.onDrawing) this.onDrawing(fromX, fromY, toX, toY);
    }

    emitDrawEnd() {
        if (this.onDrawEnd) this.onDrawEnd();
    }

    /**
     * Handle incoming draw event from another user
     */
    handleRemoteDrawing(event) {
        const { fromX, fromY, toX, toY, color, width, tool } = event;

        if (tool === 'brush') {
            this.drawLine(fromX, fromY, toX, toY, color, width);
        } else if (tool === 'eraser') {
            // For eraser, we use clearRect for remote users too
            this.ctx.clearRect(toX - width / 2, toY - width / 2, width, width);
        }
    }

    /**
     * Handle global undo from another user
     */
    handleRemoteUndo(currentHistoryStep) {
        // Restore to the history step provided by the server
        this.historyStep = currentHistoryStep;
        if (this.historyStep >= 0 && this.historyStep < this.history.length) {
            this.restoreState(this.historyStep);
        }
    }

    /**
     * Handle canvas state synchronization
     */
    synchronizeCanvasState(state) {
        if (state && state.imageData) {
            this.ctx.putImageData(state.imageData, 0, 0);
            // Rebuild history
            this.history = [state.imageData];
            this.historyStep = 0;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanvasManager;
}
