const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

const Room = require('./room');

const port = process.env.PORT || 5000;
app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));
app.get('/', (req, res) => res.send('Hello World!'))

// Callbacks to pass to room
const broadcast = (eventName, data) => io.emit(eventName, data);
const emitToSocket = (socketId, eventName, data) =>
  io.sockets.connected[socketId].emit(eventName, data);

const room = new Room({ broadcast, emitToUser: emitToSocket });

server.listen(port, () => {
  console.log(`Starting the server on port ${port}`);
});

const handleSetName = (id, name) => {
  console.log(`Client ${id} set name to: ${name}`);
  room.setUserName(id, name);
};

const handleStartGame = socketId => {
  console.log('starting game');
  room.startGame(socketId);
  io.emit('systemMessage', 'Game started');
};

const handleNextRound = socketId => {
  room.nextRound(socketId);
};

const handleEndGame = socketId => {
  const success = room.endGame(socketId);
  if (!success) {
    console.log('Couldn\'t end game');
    return;
  }
  console.log('ending game');
  io.emit('gameEnd');
};

io.on('connection', socket => {
  console.log('New client connected');
  room.addUser(socket.id);
  room.sendInitRoomData(socket);
  socket.on('chatMessage', msg => room.handleMessage(socket.id, msg));
  socket.on('disconnect', () => room.onUserDisconnect(socket.id));
  socket.on('playCard', ({ cardId, effectData }) => room.playCard(socket.id, cardId, effectData));
  socket.on('saveName', name => handleSetName(socket.id, name));
  socket.on('setPending', room.setPending);
  socket.on('startGame', () => handleStartGame(socket.id));
  socket.on('nextRound', () => handleNextRound(socket.id));
  socket.on('endGame', () => handleEndGame(socket.id));
  socket.on('debug', () => room.sendGameState(socket.id));
});
