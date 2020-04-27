const Room = require('./room');

let room;

const mockBroadcast = jest.fn();
const mockEmitToUser = jest.fn();

beforeEach(() => {
  room = new Room({ broadcast: mockBroadcast, emitToUser: mockEmitToUser });
});

const userId = '123';

describe('addUser', () => {
  it('adds a user', () => {
    room.addUser(userId);
    expect(Object.keys(room.users)).toHaveLength(1);
    expect(room.users[userId]).toBeTruthy();
  });

  describe('when there is only one user', () => {
    it('promotes the user to leader', () => {
      expect(Object.keys(room.users)).toHaveLength(0);
      room.addUser(userId);
      expect(Object.keys(room.users)).toHaveLength(1);
      const user = room.getUserById(userId);
      expect(user.isLeader).toEqual(true);
    });
  });

  describe('when there are two users', () => {
    it('does not change the leader', () => {
      const newUserId = '456';
      room.addUser(userId);
      room.addUser(newUserId);
      const user = room.getUserById(userId);
      expect(user.isLeader).toEqual(true);
      const newUser = room.getUserById(newUserId);
      expect(newUser.isLeader).toEqual(false);
    });
  });
});

describe('getUserById', () => {
  it('gets the correct user', () => {
    room.addUser(userId);
    const user = room.getUserById(userId);
    expect(user.id).toEqual(userId);
  });
});

describe('removeUser', () => {
  it('removes the user', () => {
    room.addUser(userId);
    expect(Object.keys(room.users)).toHaveLength(1);
    const user = room.onUserDisconnect(userId);
    expect(Object.keys(room.users)).toHaveLength(0);
  });

  describe('when the leader is removed', () => {
    it('promotes a random user', () => {
      room.addUser(userId); // initial leader
      expect(room.getUserById(userId).isLeader).toEqual(true);
      room.addUser('456');
      room.addUser('789');
      room.addUser('abc');
      room.onUserDisconnect(userId);
      expect(room.getUserById('456').isLeader).toEqual(true);
    });
  });

  describe('when there are no players left in the game', () => {
    it('destroys the game', () => {
      room.addUser('123');
      room.addUser('456');
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
    room.addUser('123');
    room.addUser('456');
  });

  it('returns the leader', () => {
    expect(subject().id).toEqual('123');
  });
});

describe('handleMessage', () => {
  beforeEach(() => {
    room.addUser('1');
    room.setUserName('1', 'Bilbo Baggins');
  });

  it('adds the message to the messages list', () => {
    const senderId = '1';
    const messageText = 'hello world!';
    room.handleMessage(senderId, messageText);
    message = room.messages.find(msg => msg.text === messageText);
    expect(message).toBeTruthy();
    expect(message.senderName).toEqual('Bilbo Baggins');
    expect(message.id).toBeTruthy();
  });
});
