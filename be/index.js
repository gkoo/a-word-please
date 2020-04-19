const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

const Player = require('./Player');
const Room = require('./Room');

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Callbacks to pass to room
const broadcast = (eventName, data) => io.emit(eventName, data);
const emitToSocket = (socketId, eventName, data) =>
  io.sockets.connected[socketId].emit(eventName, data);

const room = new Room({ broadcast, emitToPlayer: emitToSocket });

const handleMessage = msg => {
  room.handleMessage(msg);
  io.emit('playerMessage', msg);
};

const handleDisconnect = (id) => {
  const name = room.players[id].name;
  const displayName = name ? ` (${name})` : '';
  console.log(`Client ${id}${displayName} disconnected`);

  room.removePlayer(id);

  const leader = room.getLeader();
  io.emit('playerDisconnect', id);

  if (!leader) { return; }

  console.log('emitting new leader');
  io.emit('newLeader', leader.id);
}

server.listen(5000, () => {
  console.log('Starting the server on port 5000');
});

const handleSetName = (id, name) => {
  console.log(`Client ${id} set name to: ${name}`);
  room.setPlayerName(id, name);
  io.emit('newPlayer', room.getPlayerById(id).serialize());
};

const sendInitRoomData = (socket, room) => {
  const players = {};
  const { messages } = room;
  const roomPlayers = Object.keys(room.players).map(id => room.players[id]);
  roomPlayers.forEach(player => {
    players[player.id] = player.serialize();
  });
  const initData = {
    players,
    messages,
    currPlayerId: socket.id,
  };
  socket.emit('initData', initData);
};

const handleStartGame = socketId => {
  console.log('starting game');
  room.startGame(socketId);
  io.emit('systemMessage', 'Game started');
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

const playCard = (socketId, card) => {
  console.log(`${socketId} is playing card ${card}`);
  room.playCard(socketId, card);
};

io.on('connection', socket => {
  console.log('New client connected');
  room.addPlayer(socket.id);
  sendInitRoomData(socket, room);
  socket.on('chatMessage', handleMessage);
  socket.on('disconnect', () => handleDisconnect(socket.id));
  socket.on('playCard', card => playCard(socket.id, card));
  socket.on('saveName', (name) => handleSetName(socket.id, name));
  socket.on('startGame', () => handleStartGame(socket.id));
  socket.on('endGame', () => handleEndGame(socket.id));
  socket.on('debug', () => room.sendGameState(socket.id));
});
