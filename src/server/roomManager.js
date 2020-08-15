const Room = require('./room.js');

const ROOM_CODE_PREFIX = 'room-';

class RoomManager {
  constructor(io) {
    this.rooms = {};
    this.io = io;
  }

  findOrCreateRoom(roomCode) {
    let room = this.rooms[roomCode];
    if (room) { return room; }

    room = new Room({ io: this.io, roomCode });
    this.rooms[roomCode] = room;
    return room;
  }

  joinRoom(socket, roomCode) {
    // Disconnect the user from any other rooms they may have joined
    Object.values(this.rooms).forEach(room => {
      if (!room.users[socket.id]) { return; }
      if (room.roomCode === roomCode) { return; }
      room.onUserDisconnect(socket.id);
    });

    const room = this.findOrCreateRoom(roomCode);
    socket.join(roomCode);
    room.addUser(socket);
  }

  // Returns the name of the Socket IO room
  getRoom(socket) {
    const roomCode = Object.keys(socket.rooms).find(
      roomName => roomName.indexOf(ROOM_CODE_PREFIX) === 0
    );
    return this.rooms[roomCode];
  }

  handleChooseGame(socket, gameId) {
    const room = this.getRoom(socket);
    if (!room) { return; }
    room.chooseGame(gameId);
  }

  handleSetName(socket, name, isSpectator) {
    const { id } = socket;
    const room = this.getRoom(socket);
    console.log(`Client ${id} set name to: ${name}`);
    if (!room) { return; }
    room.setUserName(id, name, isSpectator);
  }

  handleReconnect(socket) {
    const room = this.getRoom(socket);
    if (!room) { return; }
    room.sendRoomData(socket);
  }

  handleStartGame(socket) {
    const room = this.getRoom(socket);
    console.log('starting game');
    if (!room) { return; }
    room.startGame(socket.id);
  }

  handleNextTurn(socket) {
    const room = this.getRoom(socket);
    if (!room) { return; }
    room.nextTurn(socket.id);
  }

  handleEndGame(socket) {
    const room = this.getRoom(socket);
    if (!room) { return; }
    room.endGame();
  }

  handlePlayerAction(socket, data) {
    const room = this.getRoom(socket);
    if (!room) { return; }
    room.handlePlayerAction(socket, data);
  }

  onUserDisconnect(socket) {
    // socket.rooms gets cleared before we can do any cleanup. Just loop through rooms to find if
    // they have the socket and clean it up.
    Object.values(this.rooms).forEach(room => {
      if (!room.users[socket.id]) { return; }

      room.onUserDisconnect(socket.id);
      // If no users left in room, clean up the room.
      if (Object.keys(room.users).length === 0) {
        delete this.rooms[room.roomCode];
      }
    });
  }

  onSetPending(socket) {
    this.getRoom(socket).setPending();
  }

  onDebug(socket) {
    this.getRoom(socket).sendGameState(socket.id);
  }
}

module.exports = RoomManager;
