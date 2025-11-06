/**
 * Room Management Module
 * Manages rooms and user connections within each room
 */

const WebSocket = require('ws');

class Room {
    constructor(roomId) {
        this.roomId = roomId;
        this.users = new Map();
        this.createdAt = Date.now();
    }

    /**
     * Add user to room
     */
    addUser(userId, clientInfo) {
        this.users.set(userId, clientInfo);
        return this;
    }

    /**
     * Remove user from room
     */
    removeUser(userId) {
        this.users.delete(userId);
        return this;
    }

    /**
     * Get all users in room
     */
    getUsers() {
        return Array.from(this.users.values());
    }

    /**
     * Get user count
     */
    getUserCount() {
        return this.users.size;
    }

    /**
     * Broadcast message to all users in room except sender
     */
    broadcast(message, senderUserId = null) {
        const messageStr = JSON.stringify(message);

        this.users.forEach((clientInfo, userId) => {
            // Skip sender
            if (senderUserId && userId === senderUserId) {
                return;
            }

            // Only send to connected clients
            if (clientInfo.ws && clientInfo.ws.readyState === WebSocket.OPEN) {
                clientInfo.ws.send(messageStr);
            }
        });
    }

    /**
     * Broadcast to all users including sender
     */
    broadcastAll(message) {
        const messageStr = JSON.stringify(message);

        this.users.forEach((clientInfo) => {
            if (clientInfo.ws && clientInfo.ws.readyState === WebSocket.OPEN) {
                clientInfo.ws.send(messageStr);
            }
        });
    }

    /**
     * Get room info
     */
    getInfo() {
        return {
            roomId: this.roomId,
            userCount: this.getUserCount(),
            createdAt: this.createdAt,
            users: this.getUsers().map(u => ({
                userId: u.userId,
                cursor: u.cursor
            }))
        };
    }
}

class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    /**
     * Join a room (creates if doesn't exist)
     */
    joinRoom(roomId, clientInfo) {
        let room = this.rooms.get(roomId);

        if (!room) {
            room = new Room(roomId);
            this.rooms.set(roomId, room);
            console.log(`Created new room: ${roomId}`);
        }

        room.addUser(clientInfo.userId, clientInfo);
        console.log(`User ${clientInfo.userId} joined room ${roomId}. Total users: ${room.getUserCount()}`);

        return room;
    }

    /**
     * Get a room by ID
     */
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    /**
     * Delete a room
     */
    deleteRoom(roomId) {
        return this.rooms.delete(roomId);
    }

    /**
     * Get all rooms
     */
    getRooms() {
        return Array.from(this.rooms.values());
    }

    /**
     * Get room count
     */
    getRoomCount() {
        return this.rooms.size;
    }

    /**
     * Get all active connections count
     */
    getTotalConnectionCount() {
        let count = 0;
        this.rooms.forEach(room => {
            count += room.getUserCount();
        });
        return count;
    }

    /**
     * Get room info
     */
    getRoomInfo(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return null;
        return room.getInfo();
    }

    /**
     * Get all rooms info
     */
    getAllRoomsInfo() {
        return Array.from(this.rooms.values()).map(room => room.getInfo());
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            activeRooms: this.getRoomCount(),
            totalConnections: this.getTotalConnectionCount(),
            rooms: this.getAllRoomsInfo()
        };
    }
}

module.exports = RoomManager;
