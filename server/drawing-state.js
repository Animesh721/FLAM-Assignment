/**
 * Drawing State Management Module
 * Manages drawing operations and undo/redo for each room
 */

class DrawingState {
    constructor(roomId) {
        this.roomId = roomId;
        this.actions = [];
        this.historyIndex = -1;
        this.maxHistorySize = 100;
        this.lastCanvasSnapshot = null;
        this.createdAt = Date.now();
    }

    /**
     * Record a drawing action
     */
    recordAction(action) {
        // Remove any actions after current history index (for redo consistency)
        if (this.historyIndex < this.actions.length - 1) {
            this.actions = this.actions.slice(0, this.historyIndex + 1);
        }

        // Add new action
        this.actions.push({
            ...action,
            id: `${Date.now()}_${Math.random()}`,
            timestamp: action.timestamp || Date.now()
        });

        this.historyIndex++;

        // Maintain max history size
        if (this.actions.length > this.maxHistorySize) {
            this.actions.shift();
            this.historyIndex--;
        }

        return {
            actionId: this.actions[this.historyIndex].id,
            historyIndex: this.historyIndex,
            totalActions: this.actions.length
        };
    }

    /**
     * Undo last action
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            return {
                success: true,
                historyIndex: this.historyIndex,
                actionCount: this.actions.length
            };
        }
        return {
            success: false,
            historyIndex: this.historyIndex,
            actionCount: this.actions.length
        };
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (this.historyIndex < this.actions.length - 1) {
            this.historyIndex++;
            return {
                success: true,
                historyIndex: this.historyIndex,
                actionCount: this.actions.length
            };
        }
        return {
            success: false,
            historyIndex: this.historyIndex,
            actionCount: this.actions.length
        };
    }

    /**
     * Clear all drawing (record as action)
     */
    clear() {
        // Remove any actions after current history index
        if (this.historyIndex < this.actions.length - 1) {
            this.actions = this.actions.slice(0, this.historyIndex + 1);
        }

        // Add clear action
        this.actions.push({
            type: 'clear',
            id: `clear_${Date.now()}`,
            timestamp: Date.now()
        });

        this.historyIndex++;

        // Maintain max history size
        if (this.actions.length > this.maxHistorySize) {
            this.actions.shift();
            this.historyIndex--;
        }

        return {
            historyIndex: this.historyIndex,
            actionCount: this.actions.length
        };
    }

    /**
     * Get current action sequence up to history index
     */
    getCurrentActionSequence() {
        return this.actions.slice(0, this.historyIndex + 1);
    }

    /**
     * Get all actions
     */
    getAllActions() {
        return [...this.actions];
    }

    /**
     * Get action at specific index
     */
    getAction(index) {
        if (index >= 0 && index < this.actions.length) {
            return this.actions[index];
        }
        return null;
    }

    /**
     * Get history index
     */
    getHistoryIndex() {
        return this.historyIndex;
    }

    /**
     * Get action count
     */
    getActionCount() {
        return this.actions.length;
    }

    /**
     * Serialize state for transmission (can include canvas snapshot)
     */
    serialize() {
        return {
            roomId: this.roomId,
            actions: this.getCurrentActionSequence(),
            historyIndex: this.historyIndex,
            totalActions: this.actions.length,
            lastCanvasSnapshot: this.lastCanvasSnapshot
        };
    }

    /**
     * Restore from serialized state
     */
    deserialize(data) {
        if (data.actions) {
            this.actions = data.actions;
        }
        if (typeof data.historyIndex === 'number') {
            this.historyIndex = data.historyIndex;
        }
        if (data.lastCanvasSnapshot) {
            this.lastCanvasSnapshot = data.lastCanvasSnapshot;
        }
    }

    /**
     * Get room info
     */
    getInfo() {
        return {
            roomId: this.roomId,
            actionCount: this.actions.length,
            historyIndex: this.historyIndex,
            createdAt: this.createdAt
        };
    }
}

class DrawingStateManager {
    constructor() {
        this.states = new Map();
    }

    /**
     * Get or create drawing state for a room
     */
    getOrCreateState(roomId) {
        if (!this.states.has(roomId)) {
            this.states.set(roomId, new DrawingState(roomId));
        }
        return this.states.get(roomId);
    }

    /**
     * Get drawing state for a room
     */
    getState(roomId) {
        return this.states.get(roomId);
    }

    /**
     * Record an action in a room
     */
    recordAction(roomId, action) {
        const state = this.getOrCreateState(roomId);
        return state.recordAction(action);
    }

    /**
     * Undo in a room
     */
    undo(roomId) {
        const state = this.getOrCreateState(roomId);
        return state.undo();
    }

    /**
     * Redo in a room
     */
    redo(roomId) {
        const state = this.getOrCreateState(roomId);
        return state.redo();
    }

    /**
     * Clear canvas in a room
     */
    clear(roomId) {
        const state = this.getOrCreateState(roomId);
        return state.clear();
    }

    /**
     * Get current action sequence for new users joining
     */
    getCanvasState(roomId) {
        const state = this.getOrCreateState(roomId);
        return {
            actions: state.getCurrentActionSequence(),
            historyIndex: state.getHistoryIndex(),
            imageData: null // Canvas image data could be stored here
        };
    }

    /**
     * Delete state for a room
     */
    deleteState(roomId) {
        return this.states.delete(roomId);
    }

    /**
     * Get all states
     */
    getAllStates() {
        return Array.from(this.states.values());
    }

    /**
     * Get state count
     */
    getStateCount() {
        return this.states.size;
    }

    /**
     * Get statistics
     */
    getStats() {
        const states = Array.from(this.states.values());
        return {
            totalRooms: states.length,
            rooms: states.map(state => state.getInfo())
        };
    }

    /**
     * Clear all states (for testing)
     */
    clearAll() {
        this.states.clear();
    }
}

module.exports = DrawingStateManager;
