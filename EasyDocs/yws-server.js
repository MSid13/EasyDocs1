// yws-server.js
const { WebsocketServer } = require('y-websocket/bin/utils.js');
const port = process.env.PORT || 1234;
const wss = new WebsocketServer(port);
console.log('Yjs WebSocket server running on port', port);
