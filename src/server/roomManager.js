import Room from './room.js';

export const broadcastTo = (roomId, eventName, data) => io.to(roomId).emit(eventName, data);

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
    room.addUser(socket.id);
    room.sendInitRoomData(socket);
  };

  // Returns the name of the Socket IO room
  getRoom(socket) {
    const roomCode = Object.keys(socket.rooms).find(
      roomName => roomName.indexOf(ROOM_CODE_PREFIX) === 0
    );
    return this.rooms[roomCode];
  }

  handleSetName(socket, name) {
    const { id } = socket;
    const room = this.getRoom(socket);
    console.log(`Client ${id} set name to: ${name}`);
    if (!room) { return; }
    room.setUserName(socket, id, name);
  }

  handleStartGame(socket) {
    const room = this.getRoom(socket);
    console.log('starting game');
    if (!room) { return; }
    room.startGame(socket.id);
  }

  handleNextTurn(socket) {
    const room = getRoom(socket);
    if (!room) { return; }
    room.nextTurn(socket.id);
  }

  handleEndGame(socket) {
    const room = getRoom(socket);
    if (!room) { return; }
    room.endGame(socket.id);
  }

  onUserDisconnect(socket) {
    // socket.rooms gets cleared before we can do any cleanup. Just loop through rooms to find if
    // they have the socket and clean it up.
    Object.values(this.rooms).forEach(room => {
      if (room.users[socket.id]) {
        room.onUserDisconnect(socket.id);
      }
    });
  }

  onSetPending(socket) {
    getRoom(socket).setPending();
  }

  onDebug(socket) {
    getRoom(socket).sendGameState(socket.id);
  }
}

export default RoomManager;
