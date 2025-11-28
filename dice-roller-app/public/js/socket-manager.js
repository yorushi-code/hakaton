console.log('[SOCKET-MANAGER] Инициализирую SharedWorker');

const worker = new SharedWorker('js/socket-worker.js', 'dice-roller-socket');
const port = worker.port;

port.start();

// ✅ Глобальный объект для работы с socket со ВСЕХ страниц
window.gameSocket = {
    emit: (eventName, data) => {
        console.log(`[SOCKET-MANAGER] Эмитим: ${eventName}`, data);
        port.postMessage({ type: 'EMIT', eventName, data });
    },
    
    on: (eventName, callback) => {
        console.log(`[SOCKET-MANAGER] Регистрирую слушатель: ${eventName}`);
        if (!window.gameSocket.listeners) {
            window.gameSocket.listeners = {};
        }
        if (!window.gameSocket.listeners[eventName]) {
            window.gameSocket.listeners[eventName] = [];
        }
        window.gameSocket.listeners[eventName].push(callback);
    },
    
    listeners: {}
};

// Слушаем события из Worker
port.onmessage = function(event) {
    const { type, event: eventName, data, socketId } = event.data;
    
    if (type === 'READY') {
        console.log(`[SOCKET-MANAGER] ✅ Socket готов, ID: ${socketId}`);
    }
    
    if (type === 'SOCKET_EVENT') {
        console.log(`[SOCKET-MANAGER] Получено событие: ${eventName}`, data);
        
        if (window.gameSocket.listeners[eventName]) {
            window.gameSocket.listeners[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`[SOCKET-MANAGER] Ошибка в callback для ${eventName}:`, e);
                }
            });
        }
    }
};
