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


server.listen(5000, () => {
  console.log('Starting the server on port 5000');
});

io.on('connection', socket => {
  console.log('New client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => io.sockets.emit('message', 'hi!'), 1000);
