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

const sockets = {};

const room = new Room();

const handleMessage = msg => {
  room.handleMessage(msg);
  io.emit('playerMessage', msg);
};

const handleDisconnect = (id) => {
  const name = room.players[id].name;
  const displayName = name ? `(${name})` : '';
  delete sockets[id];
  room.removePlayer(id);
  console.log(`Client ${id} ${displayName} disconnected`);
  io.emit('playerDisconnect', id);
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
  const gameDataForPlayers = room.startGame(socketId);
  if (!gameDataForPlayers) {
    console.log('Couldn\'t start game: no game data');
    return;
  }

  io.emit('systemMessage', 'Game started');
  Object.keys(gameDataForPlayers).forEach(playerId => {
    const socket = sockets[playerId];
    socket.emit('gameData', gameDataForPlayers[playerId]);
  });
  console.log('starting game');
};

const handleEndGame = socketId => {
  const success = room.endGame(socketId);
  if (!success) {
    console.log('Couldn\'t end game');
    return;
  }
  console.log('ending game');
  io.emit('gameEnd');
  io.emit('systemMessage', 'Game ended');
}

io.on('connection', socket => {
  console.log('New client connected');
  sockets[socket.id] = socket;
  room.addPlayer(socket.id);
  sendInitRoomData(socket, room);
  socket.on('chatMessage', handleMessage);
  socket.on('disconnect', () => handleDisconnect(socket.id));
  socket.on('saveName', (name) => handleSetName(socket.id, name));
  socket.on('startGame', () => handleStartGame(socket.id));
  socket.on('endGame', () => handleEndGame(socket.id));
});
