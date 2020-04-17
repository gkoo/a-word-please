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

const handleMessage = data => {
  io.emit('playerMessage', data);
};

const handleDisconnect = () => console.log('Client disconnected');

server.listen(5000, () => {
  console.log('Starting the server on port 5000');
});

const handleSetName = (id, name) => {
  room.setPlayerName(id, name);
  io.emit('newPlayer', { id, name });
};

io.on('connection', socket => {
  console.log('New client connected');
  room.addPlayer(socket.id);
  socket.on('chatMessage', handleMessage);
  socket.on('disconnect', handleDisconnect);
  socket.on('saveName', (name) => handleSetName(socket.id, name));
  //socket.emit('initMessages', sendInitMessages);
});

setInterval(() => io.sockets.emit('message', 'hi!'), 1000);
