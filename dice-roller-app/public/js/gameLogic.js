console.log('[GAMELOGIC] gameLogic.js загружен');

const diceTypeSelect = document.getElementById('diceType');
const diceCountInput = document.getElementById('diceCount');
const rollBtn = document.getElementById('rollBtn');
const diceDisplay = document.getElementById('diceDisplay');
const resultDisplay = document.getElementById('resultDisplay');
const roomInfo = document.getElementById('roomInfo');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

const gameMode = localStorage.getItem('gameMode');
const roomCode = localStorage.getItem('roomCode');
const playerId = localStorage.getItem('playerId');
const playerName = localStorage.getItem('playerName');

console.log(`[GAMELOGIC] gameMode=${gameMode}, roomCode=${roomCode}, playerId=${playerId}, playerName=${playerName}`);

let soloHistory = [];

if (gameMode === 'multiplayer' && roomCode) {
    roomInfo.textContent = `Комната: ${roomCode}`;
    console.log('[GAMELOGIC] Мультиплеер режим');
} else {
    roomInfo.textContent = 'Одиночная игра';
    console.log('[GAMELOGIC] Одиночный режим');
    
    clearHistoryBtn.addEventListener('click', () => {
        soloHistory = [];
        historyList.innerHTML = '<div style="text-align: center; color: var(--text-muted);">История пуста</div>';
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

rollBtn.addEventListener('click', () => {
    const diceType = parseInt(diceTypeSelect.value);
    const diceCount = parseInt(diceCountInput.value);

    console.log(`[GAMELOGIC] Бросок: ${diceCount}d${diceType}`);

    if (diceCount < 1 || diceCount > 20) {
        alert('Количество кубиков должно быть от 1 до 20');
        return;
    }

    if (gameMode === 'solo') {
        rollDiceSolo(diceType, diceCount);
    } else {
        if (window.socketClient && window.socketClient.rollDice) {
            console.log('[GAMELOGIC] Отправляю rollDice');
            window.socketClient.rollDice(diceType, diceCount);
        } else {
            console.error('[GAMELOGIC] ❌ socketClient не инициализирован');
        }
    }
});

function rollDiceSolo(diceType, diceCount) {
    const results = [];
    let sum = 0;

    for (let i = 0; i < diceCount; i++) {
        const result = Math.floor(Math.random() * diceType) + 1;
        results.push(result);
        sum += result;
    }

    const rollData = {
        playerName,
        diceType,
        diceCount,
        results,
        sum,
        timestamp: new Date().toISOString()
    };

    soloHistory.unshift(rollData);
    if (soloHistory.length > 50) soloHistory.pop();

    displayDiceRoll(rollData);
    addToHistory(rollData);
}

function displayDiceRoll({ results, sum, diceType, diceCount, playerName: rollerName }) {
    diceDisplay.innerHTML = '';
    
    results.forEach((result, index) => {
        setTimeout(() => {
            const dice = document.createElement('div');
            dice.className = 'dice';
            dice.textContent = result;
            diceDisplay.appendChild(dice);
        }, index * 100);
    });

    setTimeout(() => {
        resultDisplay.innerHTML = `
            <div>${rollerName} бросил ${diceCount}d${diceType}</div>
            <div class="result-sum">${sum}</div>
            <div>Результаты: ${results.join(', ')}</div>
        `;
    }, results.length * 100 + 200);
}

window.displayDiceRoll = displayDiceRoll;
