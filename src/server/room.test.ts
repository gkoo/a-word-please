import http from 'http';

import MockExpress from 'mock-express';
import socketIO from 'socket.io';

import Game from './game';
import Room from './room';

let room: Room;
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
    room.addUser({ socket, originalSocketId: 'original', name: 'Gordon' });
    expect(Object.keys(room.users)).toHaveLength(1);
    expect(room.users[userId]).toBeTruthy();
  });

  describe('when there is only one user', () => {
    it('promotes the user to leader', () => {
      expect(Object.keys(room.users)).toHaveLength(0);
      room.addUser({ socket, originalSocketId: 'original', name: 'Gordon' });
      expect(Object.keys(room.users)).toHaveLength(1);
      const user = room.getUserById(userId);
      expect(user.isLeader).toEqual(true);
    });
  });

  describe('when there are two users', () => {
    it('does not change the leader', () => {
      const newUserId = '456';
      room.addUser({ socket, originalSocketId: 'original', name: 'Gordon' });
      room.addUser({
        socket: {id: newUserId },
        originalSocketId: 'original',
        name: 'Gordon2',
      });
      const user = room.getUserById(userId);
      expect(user.isLeader).toEqual(true);
      const newUser = room.getUserById(newUserId);
      expect(newUser.isLeader).toEqual(false);
    });
  });
});

describe('getUserById', () => {
  it('gets the correct user', () => {
    room.addUser({ socket, originalSocketId: 'original', name: 'Gordon' });
    const user = room.getUserById(userId);
    expect(user.id).toEqual(userId);
  });
});

describe('onUserDisconnect', () => {
  it('removes the user', () => {
    room.addUser({
      socket: { id: userId, },
      originalSocketId: 'original',
      name: 'Gordon2',
    });
    expect(Object.keys(room.users)).toHaveLength(1);
    const user = room.onUserDisconnect(userId);
    expect(Object.keys(room.users)).toHaveLength(1);
  });

  describe('when the leader is removed', () => {
    it('promotes a random user', () => {
      room.addUser({ socket, originalSocketId: 'original', name: 'Gordon' }); // initial leader
      expect(room.getUserById(userId).isLeader).toEqual(true);
      room.addUser({
        socket: { id: '456' },
        originalSocketId: 'original',
        name: 'Gordon2',
      });
      room.addUser({
        socket: { id: '789' },
        originalSocketId: 'original',
        name: 'Gordon2',
      });
      room.addUser({
        socket: { id: 'abc' },
        originalSocketId: 'original',
        name: 'Gordon2',
      });
      room.onUserDisconnect(userId);
      expect(room.getUserById('456').isLeader).toEqual(true);
    });
  });

  describe('when there are no players left in the game', () => {
    it('destroys the game', () => {
      room.addUser({
        socket: { id: '123' },
        originalSocketId: 'original',
        name: 'Gordon2',
      });
      room.addUser({
        socket: { id: '456' },
        originalSocketId: 'original',
        name: 'Gordon2',
      });
      room.startGame();
      expect(Object.keys(room.users)).toHaveLength(2);
      room.onUserDisconnect('123');
      room.onUserDisconnect('456');
      expect(Object.values(room.users).filter(user => user.connected)).toHaveLength(0);
      expect(room.game).toBeFalsy();
    });
  });
});

describe('getLeader', () => {
  const subject = () => room.getLeader();

  beforeEach(() => {
    room.addUser({
      socket: { id: '123' },
      originalSocketId: 'original',
      name: 'Gordon2',
    });
    room.addUser({
      socket: { id: '456' },
      originalSocketId: 'original',
      name: 'Gordon2',
    });
  });

  it('returns the leader', () => {
    expect(subject().id).toEqual('123');
  });
});
