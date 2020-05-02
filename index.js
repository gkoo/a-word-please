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

const ROOM_CODE_PREFIX = 'room-';

// Callbacks to pass to room
const emitToSocket = (socketId, eventName, data) =>
  io.sockets.connected[socketId] && io.sockets.connected[socketId].emit(eventName, data);

const rooms = {};

server.listen(port, () => {
  console.log(`Starting the server on port ${port}`);
});

const broadcastTo = (roomId, eventName, data) => io.to(roomId).emit(eventName, data);

const handleSetName = (socket, name) => {
  const { id } = socket;
  const room = getRoom(socket);
  console.log(`Client ${id} set name to: ${name}`);
  room.setUserName(id, name);
};

const handleStartGame = socket => {
  const room = getRoom(socket);
  console.log('starting game');
  room.startGame(socket.id);
  io.emit('systemMessage', 'Game started');
};

const handleNextRound = socket => {
  getRoom(socket).nextRound(socket.id);
};

const handleEndGame = socket => {
  const room = getRoom(socket);
  room.endGame(socket.id);
};

const joinRoom = (socket, roomCode) => {
  let room = rooms[roomCode];
  if (!room) {
    room = new Room({ broadcastTo, roomCode });
    rooms[roomCode] = room;
  }
  socket.join(roomCode);
  room.addUser(socket.id);
  room.sendInitRoomData(socket);
};

// Returns the name of the Socket IO room
const getRoom = socket => {
  const roomCode = Object.keys(socket.rooms).find(
    roomName => roomName.indexOf(ROOM_CODE_PREFIX) === 0
  );
  return rooms[roomCode];
};

const onUserDisconnect = socket => {
  // socket.rooms gets cleared before we can do any cleanup. Just loop through rooms to find if they
  // have the socket and clean it up.
  Object.values(rooms).forEach(room => {
    if (!room.users[socket.id]) { return; }
    room.onUserDisconnect(socket.id);
  });
};

const onChatMessage = (socket, msg) => {
  const room = getRoom(socket);
  room.handleMessage(socket.id, msg);
};

const onPlayCard = (socket, { cardId, effectData }) => {
  const room = getRoom(socket);
  room.playCard(socket.id, cardId, effectData);
};

const onSetPending = socket => {
  getRoom(socket).setPending();
}

const onDebug = socket => {
  getRoom(socket).sendGameState(socket.id);
}

io.on('connection', socket => {
  console.log('New client connected');
  socket.on('chatMessage', msg => onChatMessage(socket, msg));
  socket.on('disconnect', () => onUserDisconnect(socket));
  socket.on('joinRoom', (roomCode) => joinRoom(socket, roomCode));
  socket.on('playCard', data => onPlayCard(socket, data));
  socket.on('saveName', name => handleSetName(socket, name));
  socket.on('setPending', () => onSetPending(socket));
  socket.on('startGame', () => handleStartGame(socket));
  socket.on('nextRound', () => handleNextRound(socket));
  socket.on('endGame', () => handleEndGame(socket));
  socket.on('debug', () => room.sendGameState(socket));
});
