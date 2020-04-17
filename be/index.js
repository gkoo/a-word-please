const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

const index = require('./routes/index');

const Player = require('./Player');
const Room = require('./Room');

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use(index)

const room = new Room();

const handleMessage = msg => {
  room.handleMessage(msg);
  io.emit('playerMessage', msg);
};

const handleDisconnect = (id) => {
  const name = room.players[id].name;
  const displayName = name ? `(${name})` : '';
  room.removePlayer(id);
  console.log(`Client ${id} ${displayName} disconnected`);
}

server.listen(5000, () => {
  console.log('Starting the server on port 5000');
});

const handleSetName = (id, name) => {
  console.log(`Client ${id} set name to: ${name}`);
  room.setPlayerName(id, name);
  io.emit('newPlayer', { id, name });
};

const sendInitRoomData = (socket, room) => {
  const players = {};
  const { messages } = room;
  const roomPlayers = Object.keys(room.players).map(id => room.players[id]);
  roomPlayers.forEach(player => {
    players[player.id] = { name: player.name };
  });
  const initData = {
    players,
    messages,
  };
  socket.emit('initData', initData);
};

io.on('connection', socket => {
  console.log('New client connected');
  sendInitRoomData(socket, room);
  room.addPlayer(socket.id);
  socket.on('chatMessage', handleMessage);
  socket.on('disconnect', () => handleDisconnect(socket.id));
  socket.on('saveName', (name) => handleSetName(socket.id, name));
  //socket.emit('initMessages', sendInitMessages);
});

setInterval(() => io.sockets.emit('message', 'hi!'), 1000);
