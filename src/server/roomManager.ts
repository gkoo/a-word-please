import Room from './room';

const ROOM_CODE_PREFIX = 'room-';

class RoomManager {
  rooms: { [roomCode: string]: Room };
  io: SocketIO.Server;

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

  joinRoom({ socket, roomCode, originalSocketId, name }) {
    // Disconnect the user from any other rooms they may have joined
    Object.values(this.rooms).forEach(room => {
      if (!room.users[socket.id]) { return; }
      if (room.roomCode === roomCode) { return; }
      room.onUserDisconnect(socket.id);
    });

    const room = this.findOrCreateRoom(roomCode);
    socket.join(roomCode);
    room.addUser({ socket, originalSocketId, name });
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

  handleReconnect(socket, { originalSocketId, name, isSpectator, roomCode }) {
    this.joinRoom({ socket, roomCode, originalSocketId, name });
  }

  handleStartGame(socket) {
    const room = this.getRoom(socket);
    console.log('starting game');
    if (!room) { return; }
    room.startGame();
  }

  handleNextTurn(socket) {
    const room = this.getRoom(socket);
    if (!room) { return; }
    room.nextTurn();
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
    console.log(`${socket.id} disconnected`);
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

  onDebug(socket) {
    this.getRoom(socket).sendGameState(socket.id);
  }
}

module.exports = RoomManager;
