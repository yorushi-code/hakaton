console.log('[SOCKET-WORKER] Запущен');

let sharedSocket = null;
let ports = []; // Храним все порты от разных страниц

self.onconnect = function(event) {
    const port = event.ports[0];
    ports.push(port);
    
    console.log(`[SOCKET-WORKER] Новое подключение, всего портов: ${ports.length}`);
    
    // Создаём socket ТОЛЬКОв первый раз
    if (!sharedSocket) {
        console.log('[SOCKET-WORKER] Создаю новый socket');
        
        importScripts('/socket.io/socket.io.js');
        sharedSocket = io();
        
        console.log(`[SOCKET-WORKER] ✅ Socket создан, ID: ${sharedSocket.id}`);
        
        // Все события socket'а пробрасываем на все страницы
        sharedSocket.on('connect', () => {
            broadcastToPages({ type: 'SOCKET_EVENT', event: 'connect' });
        });
        
        sharedSocket.on('disconnect', () => {
            broadcastToPages({ type: 'SOCKET_EVENT', event: 'disconnect' });
        });
        
        sharedSocket.on('roomCreated', (data) => {
            broadcastToPages({ type: 'SOCKET_EVENT', event: 'roomCreated', data });
        });
        
        sharedSocket.on('joinedRoom', (data) => {
            broadcastToPages({ type: 'SOCKET_EVENT', event: 'joinedRoom', data });
        });
        
        sharedSocket.on('playerJoined', (data) => {
            broadcastToPages({ type: 'SOCKET_EVENT', event: 'playerJoined', data });
        });
        
        sharedSocket.on('playerLeft', (data) => {
            broadcastToPages({ type: 'SOCKET_EVENT', event: 'playerLeft', data });
        });
        
        sharedSocket.on('diceRolled', (data) => {
            broadcastToPages({ type: 'SOCKET_EVENT', event: 'diceRolled', data });
        });
        
        sharedSocket.on('historyClear', () => {
            broadcastToPages({ type: 'SOCKET_EVENT', event: 'historyClear' });
        });
        
        sharedSocket.on('error', (data) => {
            broadcastToPages({ type: 'SOCKET_EVENT', event: 'error', data });
        });
    } else {
        console.log('[SOCKET-WORKER] Socket уже существует, переиспользую');
    }
    
    // Слушаем команды от страницы
    port.onmessage = function(event) {
        const { type, eventName, data } = event.data;
        
        if (type === 'EMIT') {
            console.log(`[SOCKET-WORKER] Эмитим: ${eventName}`, data);
            sharedSocket.emit(eventName, data);
        }
    };
    
    // Отправляем статус
    port.postMessage({ type: 'READY', socketId: sharedSocket.id });
};

// Отправляем событие на ВСЕ открытые страницы
function broadcastToPages(message) {
    console.log(`[SOCKET-WORKER] Отправляю всем страницам:`, message.event);
    ports.forEach(port => {
        try {
            port.postMessage(message);
        } catch (e) {
            console.error('[SOCKET-WORKER] Ошибка отправки:', e);
        }
    });
}
