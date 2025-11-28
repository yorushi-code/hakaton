const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const GameRooms = require('./gameRooms');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const gameRooms = new GameRooms();

io.on('connection', (socket) => {
  console.log(`[SERVER] Новое подключение: ${socket.id}`);

  socket.on('createRoom', (playerName) => {
    console.log(`[SERVER] createRoom: ${playerName}`);
    const roomCode = gameRooms.createRoom(socket.id, playerName);
    socket.join(roomCode);
    
    const room = gameRooms.getRoom(roomCode);
    
    socket.emit('roomCreated', {
      roomCode,
      playerId: socket.id,
      playerName,
      players: room.players
    });
    
    console.log(`[SERVER] ✅ Комната ${roomCode} создана. Игроки:`, room.players);
  });

  socket.on('joinRoom', ({ roomCode, playerName }) => {
    console.log(`[SERVER] joinRoom: roomCode=${roomCode}, playerName=${playerName}, socketId=${socket.id}`);
    
    const room = gameRooms.getRoom(roomCode);
    
    if (!room) {
      console.log(`[SERVER] ❌ Комната ${roomCode} НЕ НАЙДЕНА`);
      console.log(`[SERVER] Доступные комнаты:`, Array.from(gameRooms.rooms.keys()));
      socket.emit('error', { message: 'Комната не найдена' });
      return;
    }

    const existingPlayer = room.players.find(p => p.id === socket.id);
    if (!existingPlayer) {
      gameRooms.addPlayerToRoom(roomCode, socket.id, playerName);
      console.log(`[SERVER] ✅ ${playerName} добавлен в комнату ${roomCode}`);
    } else {
      console.log(`[SERVER] ℹ️ ${playerName} переподключается в комнату ${roomCode}`);
    }

    socket.join(roomCode);
    
    const updatedRoom = gameRooms.getRoom(roomCode);
    
    socket.emit('joinedRoom', {
      roomCode,
      playerId: socket.id,
      players: updatedRoom.players,
      history: updatedRoom.history
    });

    socket.to(roomCode).emit('playerJoined', {
      playerId: socket.id,
      playerName,
      players: updatedRoom.players
    });

    console.log(`[SERVER] 📢 playerJoined отправлен. Игроки в ${roomCode}:`, updatedRoom.players);
  });

  socket.on('rollDice', ({ roomCode, diceType, diceCount, playerName }) => {
    console.log(`[SERVER] rollDice: ${playerName} бросил ${diceCount}d${diceType} в комнате ${roomCode}`);
    
    const results = [];
    let sum = 0;

    for (let i = 0; i < diceCount; i++) {
      const result = Math.floor(Math.random() * diceType) + 1;
      results.push(result);
      sum += result;
    }

    const rollData = {
      playerId: socket.id,
      playerName,
      diceType,
      diceCount,
      results,
      sum,
      timestamp: new Date().toISOString()
    };

    gameRooms.addRollToHistory(roomCode, rollData);

    io.to(roomCode).emit('diceRolled', rollData);

    console.log(`[SERVER] ✅ diceRolled разослан. Результат: ${results.join(', ')} (сумма: ${sum})`);
  });

  socket.on('clearHistory', (roomCode) => {
    console.log(`[SERVER] clearHistory в комнате ${roomCode}`);
    gameRooms.clearHistory(roomCode);
    io.to(roomCode).emit('historyClear');
  });

  socket.on('disconnect', () => {
    console.log(`[SERVER] ⚠️ disconnect: ${socket.id}`);
    
    // ❌ НЕ удаляем игрока сразу!
    // Ждём 3 секунды, может быть переподключение
    setTimeout(() => {
        const roomCode = gameRooms.removePlayer(socket.id);
        if (roomCode) {
            const room = gameRooms.getRoom(roomCode);
            if (room) {
                if (room.players.length > 0) {
                    io.to(roomCode).emit('playerLeft', {
                        playerId: socket.id,
                        players: room.players
                    });
                    console.log(`[SERVER] 📢 playerLeft отправлен. Оставшиеся игроки:`, room.players);
                } else {
                    console.log(`[SERVER] 🗑️ Комната ${roomCode} удалена (пуста)`);
                }
            }
        }
        console.log(`[SERVER] ❌ Игрок ${socket.id} окончательно отключился`);
    }, 3000); // ✅ 3 секунды задержки перед удалением
  });
});

server.listen(PORT, () => {
  console.log(`\n🎲 Сервер запущен на http://localhost:${PORT}\n`);
});
