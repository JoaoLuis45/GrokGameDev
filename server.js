const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const players = {};

wss.on('connection', (ws) => {
    // Atribuir um ID único ao jogador
    const id = Date.now().toString();
    players[id] = { x: 400, y: 500, angle: 0 };

    // Enviar o ID ao cliente conectado
    ws.send(JSON.stringify({ type: 'init', id }));

    console.log(`Novo jogador conectado: ${id}`);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'move') {
            // Atualizar posição do jogador
            players[data.id] = { x: data.x, y: data.y, angle: data.angle };
            
            // Enviar atualização para todos os clientes
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
        // Notificar os outros jogadores
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'update', players }));
            }
        });
    });

    ws.on('error', (error) => {
        console.error(`Erro no WebSocket: ${error}`);
    });
});

console.log('Servidor WebSocket rodando em ws://localhost:8080');