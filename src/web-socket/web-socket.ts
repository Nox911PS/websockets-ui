import { WebSocketServer, WebSocket } from 'ws';
import { clients } from '../db/users';
import { randomUUID, UUID } from 'node:crypto';
import { closeHandler } from '../handlers/close-handler';
import { messageHandler } from '../handlers/message-handler';

const PORT = 3000;

const wss = new WebSocketServer({ port: PORT });
console.log(`WebSocket connected on the ${PORT} port!`);

wss.on('connection', (ws: WebSocket) => {
  const clientId: UUID = randomUUID();
  clients.set(clientId, ws);

  ws.on('message', (message: string) => messageHandler(message, clientId));

  ws.on('close', () => closeHandler(clientId));

  ws.on('error', (error) => {
    console.error(`WebSocket error with client ${clientId}:`, error);
  });
});
