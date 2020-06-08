import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';

const app = express();
const server = http.Server(app);
const io = socketIO(server);

import RoomManager from './roomManager.js';

const port = process.env.PORT || 5000;
app.set('port', port);

const moduleURL = new URL(import.meta.url);
const dirname = path.dirname(moduleURL.pathname);
app.use(express.static(path.join(dirname, '../client/build')));

app.get('/health', (req, res) => res.send('ok'));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(dirname, '../client/build/index.html'));
});

const roomManager = new RoomManager(io);

// Callbacks to pass to room
const emitToSocket = (socketId, eventName, data) =>
  io.sockets.connected[socketId] && io.sockets.connected[socketId].emit(eventName, data);

server.listen(port, () => {
  console.log(`Starting the server on port ${port}`);
});

io.on('connection', socket => {
  console.log('New client connected');
  socket.on('disconnect', () => roomManager.onUserDisconnect(socket));
  socket.on('joinRoom', (roomCode) => roomManager.joinRoom(socket, roomCode));
  socket.on('saveName', name => roomManager.handleSetName(socket, name));
  socket.on('setPending', () => roomManager.onSetPending(socket));
  socket.on('startGame', () => roomManager.handleStartGame(socket));
  socket.on('nextTurn', () => roomManager.handleNextTurn(socket));
  socket.on('endGame', () => roomManager.handleEndGame(socket));
  socket.on('debug', () => roomManager.onDebug(socket));
  socket.on('submitClue', clue => {
    const room = roomManager.getRoom(socket);
    if (room) {
      roomManager.getRoom(socket).receiveClue(socket.id, clue);
    }
  });
  socket.on('revealClues', () => {
    roomManager.getRoom(socket) && roomManager.getRoom(socket).revealClues()
  });
  socket.on('submitGuess', guess => {
    roomManager.getRoom(socket) && roomManager.getRoom(socket).receiveGuess(socket.id, guess)
  });
  socket.on('skipTurn', guess => {
    roomManager.getRoom(socket) && roomManager.getRoom(socket).skipTurn()
  });
});