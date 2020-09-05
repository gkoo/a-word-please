const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const RoomManager = require('./roomManager.js');

const port = process.env.PORT || 5000;
app.set('port', port);

const roomManager = new RoomManager(io);

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('/health', (req, res) => res.send('ok'));

app.get('/api/sessions', (req, res) => {
  res.json({
    rooms: Object.keys(roomManager.rooms),
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Callbacks to pass to room
const emitToSocket = (socketId, eventName, data) =>
  io.sockets.connected[socketId] && io.sockets.connected[socketId].emit(eventName, data);

server.listen(port, () => {
  console.log(`Starting the server on port ${port}`);
});

io.on('connection', socket => {
  console.log('New client connected');
  socket.emit('userId', socket.id);
  socket.on('disconnect', () => roomManager.onUserDisconnect(socket));
  socket.on('reconnect-room', (data) => roomManager.handleReconnect(socket, data));
  socket.on('joinRoom', roomCode => roomManager.joinRoom({ socket, roomCode }));
  socket.on('saveName', data => roomManager.handleSetName(socket, data.name, data.isSpectator));
  socket.on('chooseGame', gameId => roomManager.handleChooseGame(socket, gameId));
  socket.on('startGame', () => roomManager.handleStartGame(socket));
  socket.on('nextTurn', () => roomManager.handleNextTurn(socket));
  socket.on('endGame', () => roomManager.handleEndGame(socket));
  socket.on('debug', () => roomManager.onDebug(socket));
  socket.on('playerAction', data => roomManager.handlePlayerAction(socket, data));
});
