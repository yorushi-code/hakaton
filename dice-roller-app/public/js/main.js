console.log('[MAIN] main.js загружен');

// ✅ Используем window.gameSocket из socket-manager.js
const soloMode = document.getElementById('soloMode');
const multiplayerMode = document.getElementById('multiplayerMode');
const multiplayerModal = document.getElementById('multiplayerModal');
const closeModal = document.querySelector('.close');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const playerNameInput = document.getElementById('playerName');
const roomCodeInput = document.getElementById('roomCodeInput');
const errorMessage = document.getElementById('errorMessage');

soloMode.addEventListener('click', () => {
    console.log('[MAIN] Нажата "Одиночная игра"');
    localStorage.setItem('gameMode', 'solo');
    localStorage.setItem('playerName', 'Игрок');
    localStorage.removeItem('roomCode');
    localStorage.removeItem('playerId');
    window.location.href = 'game.html';
});

multiplayerMode.addEventListener('click', () => {
    console.log('[MAIN] Нажата "Мультиплеер"');
    multiplayerModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    multiplayerModal.style.display = 'none';
    errorMessage.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === multiplayerModal) {
        multiplayerModal.style.display = 'none';
        errorMessage.style.display = 'none';
    }
});

createRoomBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        showError('Пожалуйста, введите ваше имя');
        return;
    }

    console.log(`[MAIN] 📤 Создаю комнату: ${playerName}`);
    gameSocket.emit('createRoom', playerName);
});

joinRoomBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    const roomCode = roomCodeInput.value.trim().toUpperCase();
    
    if (!playerName) {
        showError('Пожалуйста, введите ваше имя');
        return;
    }
    
    if (!roomCode) {
        showError('Пожалуйста, введите код комнаты');
        return;
    }

    console.log(`[MAIN] 📤 Присоединяюсь: ${playerName} к ${roomCode}`);
    gameSocket.emit('joinRoom', { roomCode, playerName });
});

// ✅ Слушаем события socket'а
gameSocket.on('roomCreated', ({ roomCode, playerId, playerName, players }) => {
    console.log(`[MAIN] ✅ roomCreated: ${roomCode}`);
    localStorage.setItem('gameMode', 'multiplayer');
    localStorage.setItem('roomCode', roomCode);
    localStorage.setItem('playerId', playerId);
    localStorage.setItem('playerName', playerName);
    
    console.log('[MAIN] Переход на game.html');
    window.location.href = 'game.html';
});

gameSocket.on('joinedRoom', ({ roomCode, playerId, players, history }) => {
    console.log(`[MAIN] ✅ joinedRoom: ${roomCode}`);
    localStorage.setItem('gameMode', 'multiplayer');
    localStorage.setItem('roomCode', roomCode);
    localStorage.setItem('playerId', playerId);
    localStorage.setItem('playerName', playerNameInput.value.trim());
    
    console.log('[MAIN] Переход на game.html');
    window.location.href = 'game.html';
});

gameSocket.on('error', ({ message }) => {
    console.log(`[MAIN] ❌ error: ${message}`);
    showError(message);
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 4000);
}
