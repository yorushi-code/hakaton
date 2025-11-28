const { v4: uuidv4 } = require('uuid');

class GameRooms {
  constructor() {
    this.rooms = new Map();
    this.playerRooms = new Map();
  }

  createRoom(playerId, playerName) {
    const roomCode = this.generateRoomCode();
    this.rooms.set(roomCode, {
      code: roomCode,
      players: [{ id: playerId, name: playerName }],
      history: [],
      createdAt: new Date()
    });
    this.playerRooms.set(playerId, roomCode);
    console.log(`[GameRooms] createRoom: ${roomCode}`);
    return roomCode;
  }

  addPlayerToRoom(roomCode, playerId, playerName) {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.players.push({ id: playerId, name: playerName });
      this.playerRooms.set(playerId, roomCode);
      console.log(`[GameRooms] addPlayerToRoom: ${playerName} в ${roomCode}`);
    }
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  addRollToHistory(roomCode, rollData) {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.history.push(rollData);
      if (room.history.length > 50) {
        room.history.shift();
      }
    }
  }

  clearHistory(roomCode) {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.history = [];
    }
  }

  removePlayer(playerId) {
    const roomCode = this.playerRooms.get(playerId);
    if (roomCode) {
      const room = this.rooms.get(roomCode);
      if (room) {
        room.players = room.players.filter(p => p.id !== playerId);
        
        if (room.players.length === 0) {
          this.rooms.delete(roomCode);
          console.log(`[GameRooms] Комната ${roomCode} удалена`);
        }
      }
      this.playerRooms.delete(playerId);
      return roomCode;
    }
    return null;
  }

  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

module.exports = GameRooms;
