const http = require('http');

const MockExpress = require('mock-express');
const socketIO = require('socket.io');

const Game = require('./game');
const Room = require('./room');

let room;

const mockApp = MockExpress();
const mockServer = http.createServer(mockApp);
const mockIo = socketIO(mockServer);

beforeEach(() => {
  room = new Room({ io: mockIo, roomCode: 'abcd' });
});

const userId = '123';
const socket = { id: userId };

describe('addUser', () => {
  it('adds a user', () => {
    room.addUser(socket);
    expect(Object.keys(room.users)).toHaveLength(1);
    expect(room.users[userId]).toBeTruthy();
  });

  describe('when there is only one user', () => {
    it('promotes the user to leader', () => {
      expect(Object.keys(room.users)).toHaveLength(0);
      room.addUser(socket);
      expect(Object.keys(room.users)).toHaveLength(1);
      const user = room.getUserById(userId);
      expect(user.isLeader).toEqual(true);
    });
  });

  describe('when there are two users', () => {
    it('does not change the leader', () => {
      const newUserId = '456';
      room.addUser(socket);
      room.addUser({ id: newUserId });
      const user = room.getUserById(userId);
      expect(user.isLeader).toEqual(true);
      const newUser = room.getUserById(newUserId);
      expect(newUser.isLeader).toEqual(false);
    });
  });
});

describe('getUserById', () => {
  it('gets the correct user', () => {
    room.addUser(socket);
    const user = room.getUserById(userId);
    expect(user.id).toEqual(userId);
  });
});

describe('removeUser', () => {
  it('removes the user', () => {
    room.addUser({ id: userId, name: 'John' });
    expect(Object.keys(room.users)).toHaveLength(1);
    const user = room.onUserDisconnect(userId);
    expect(Object.keys(room.users)).toHaveLength(0);
  });

  describe('when the leader is removed', () => {
    it('promotes a random user', () => {
      room.addUser(socket); // initial leader
      expect(room.getUserById(userId).isLeader).toEqual(true);
      room.addUser({ id: '456' });
      room.addUser({ id: '789' });
      room.addUser({ id: 'abc' });
      room.onUserDisconnect(userId);
      expect(room.getUserById('456').isLeader).toEqual(true);
    });
  });

  describe('when there are no players left in the game', () => {
    it('destroys the game', () => {
      room.addUser({ id: '123' });
      room.addUser({ id: '456' });
      room.startGame('123');
      expect(Object.keys(room.users)).toHaveLength(2);
      room.onUserDisconnect('123');
      room.onUserDisconnect('456');
      expect(Object.keys(room.users)).toHaveLength(0);
      expect(room.game).toBeFalsy();
    });
  });
});

describe('getLeader', () => {
  const subject = () => room.getLeader();

  beforeEach(() => {
    room.addUser({ id: '123' });
    room.addUser({ id: '456' });
  });

  it('returns the leader', () => {
    expect(subject().id).toEqual('123');
  });
});
