const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

const index = require('./routes/index');

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use(index)

const messages = ['here are', 'your first', 'messages'];

const handleMessage = data => {
  io.sockets.emit('playerMessage', data);
};

const handleDisconnect = () => console.log('Client disconnected');

server.listen(5000, () => {
  console.log('Starting the server on port 5000');
});

io.on('connection', socket => {
  console.log('New client connected');
  socket.on('chatMessage', handleMessage);
  socket.on('disconnect', handleDisconnect);
  //socket.emit('initMessages', sendInitMessages);
});

setInterval(() => io.sockets.emit('message', 'hi!'), 1000);
