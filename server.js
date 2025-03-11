const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const players = {};

wss.on('connection', (ws) => {
    const id = Date.now().toString();
    players[id] = { x: 0, z: 0, angle: 0 };
    ws.send(JSON.stringify({ type: 'init', id }));
    console.log(`Novo jogador conectado: ${id}`);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'move') {
            players[data.id] = { x: data.x, z: data.z, angle: data.angle };
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'update', players }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log(`Jogador desconectado: ${id}`);
        delete players[id];
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'update', players }));
            }
        });
    });
});

console.log('Servidor WebSocket rodando em ws://localhost:8080');