import { WebSocketServer } from 'ws';
import { kvOn } from './kvStore.js';

function safeStringify(payload) {
  try {
    return JSON.stringify(payload);
  } catch (error) {
    return JSON.stringify({ type: 'error', error: 'unable to serialize payload' });
  }
}

export function createSocketHub(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcast(payload) {
    const message = safeStringify(payload);
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  wss.on('connection', (socket) => {
    socket.send(safeStringify({ type: 'welcome', timestamp: Date.now() }));
  });

  const unsubSet = kvOn('kv:set', ({ key, value }) => {
    broadcast({ type: 'kv:set', key, value });
  });
  const unsubDelete = kvOn('kv:delete', ({ key }) => {
    broadcast({ type: 'kv:delete', key });
  });

  wss.on('close', () => {
    unsubSet();
    unsubDelete();
  });

  return {
    broadcast
  };
}
