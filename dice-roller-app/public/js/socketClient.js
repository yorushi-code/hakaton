console.log('[SOCKETCLIENT] socketClient.js загружен');

// ✅ Используем window.gameSocket из socket-manager.js
const mpGameMode = localStorage.getItem('gameMode');
const mpRoomCode = localStorage.getItem('roomCode');
const mpPlayerId = localStorage.getItem('playerId');
const mpPlayerName = localStorage.getItem('playerName');

console.log(`[SOCKETCLIENT] Данные из localStorage:`);
console.log(`  gameMode: ${mpGameMode}`);
console.log(`  roomCode: ${mpRoomCode}`);
console.log(`  playerId: ${mpPlayerId}`);
console.log(`  playerName: ${mpPlayerName}`);

if (mpGameMode === 'multiplayer' && mpRoomCode && mpPlayerName) {
    const playersList = document.getElementById('playersList');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    console.log('[SOCKETCLIENT] ✅ Мультиплеер режим активирован');
    console.log(`[SOCKETCLIENT] Попытка присоединиться к комнате ${mpRoomCode} как ${mpPlayerName}`);

    // ✅ Присоединяемся
    gameSocket.emit('joinRoom', { roomCode: mpRoomCode, playerName: mpPlayerName });

    gameSocket.on('joinedRoom', ({ players, history }) => {
        console.log('[SOCKETCLIENT] ✅ joinedRoom получено');
        console.log(`[SOCKETCLIENT] Игроки:`, players);
        updatePlayersList(players);
        updateHistory(history);
    });

    gameSocket.on('playerJoined', ({ players, playerName: newPlayerName }) => {
        console.log(`[SOCKETCLIENT] 📢 playerJoined: ${newPlayerName}`);
        updatePlayersList(players);
        addNotification(`${newPlayerName} присоединился к игре`);
    });

    gameSocket.on('playerLeft', ({ players }) => {
        console.log('[SOCKETCLIENT] 📢 playerLeft');
        updatePlayersList(players);
    });

    gameSocket.on('diceRolled', (rollData) => {
        console.log('[SOCKETCLIENT] 🎲 diceRolled получено:', rollData);
        if (window.displayDiceRoll) {
            window.displayDiceRoll(rollData);
        }
        addToHistory(rollData);
    });

    gameSocket.on('historyClear', () => {
        console.log('[SOCKETCLIENT] 🗑️ historyClear получено');
        historyList.innerHTML = '<div style="text-align: center; color: var(--text-muted);">История пуста</div>';
    });

    gameSocket.on('error', ({ message }) => {
        console.error('[SOCKETCLIENT] ❌ Ошибка:', message);
        alert(`Ошибка: ${message}`);
    });

    clearHistoryBtn.addEventListener('click', () => {
        console.log('[SOCKETCLIENT] Отправляю clearHistory');
        gameSocket.emit('clearHistory', mpRoomCode);
    });

    function updatePlayersList(players) {
        console.log('[SOCKETCLIENT] Обновляю список игроков:', players);
        playersList.innerHTML = '';
        
        if (!players || players.length === 0) {
            playersList.innerHTML = '<div style="text-align: center; color: var(--text-muted);">Нет игроков</div>';
            return;
        }

        players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            if (player.id === mpPlayerId) {
                playerItem.classList.add('you');
            }
            playerItem.innerHTML = `
                <span>👤</span>
                <span>${player.name}${player.id === mpPlayerId ? ' (Вы)' : ''}</span>
            `;
            playersList.appendChild(playerItem);
        });
    }

    function updateHistory(history) {
        console.log('[SOCKETCLIENT] Обновляю историю, записей:', history ? history.length : 0);
        historyList.innerHTML = '';
        
        if (!history || history.length === 0) {
            historyList.innerHTML = '<div style="text-align: center; color: var(--text-muted);">История пуста</div>';
            return;
        }
        
        const sorted = [...history].reverse();
        sorted.forEach(roll => {
            addToHistory(roll, false);
        });
    }

    function addToHistory(rollData, prepend = true) {
        if (historyList.innerHTML.includes('История пуста')) {
            historyList.innerHTML = '';
        }

        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="player-name">${rollData.playerName}</div>
            <div class="roll-info">${rollData.diceCount}d${rollData.diceType}</div>
            <div class="roll-result">Сумма: ${rollData.sum}</div>
            <div class="roll-info">${rollData.results.join(', ')}</div>
        `;
        
        if (prepend) {
            historyList.insertBefore(historyItem, historyList.firstChild);
        } else {
            historyList.appendChild(historyItem);
        }
    }

    function addNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary-color);
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // API для gameLogic.js
    window.socketClient = {
        rollDice: (diceType, diceCount) => {
            console.log(`[SOCKETCLIENT] rollDice: ${diceCount}d${diceType}`);
            gameSocket.emit('rollDice', {
                roomCode: mpRoomCode,
                diceType,
                diceCount,
                playerName: mpPlayerName
            });
        }
    };

    console.log('[SOCKETCLIENT] ✅ window.socketClient API инициализирована');

} else {
    console.log('[SOCKETCLIENT] Одиночный режим - socketClient не активирован');
}
