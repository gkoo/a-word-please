const Room = require('./room');

let room;

const mockBroadcast = jest.fn();
const mockEmitToPlayer = jest.fn();

beforeEach(() => {
  room = new Room({ broadcast: mockBroadcast, emitToPlayer: mockEmitToPlayer });
});

const playerId = '123';

describe('addPlayer', () => {
  it('adds a player', () => {
    room.addPlayer(playerId);
    expect(Object.keys(room.players)).toHaveLength(1);
    expect(room.players[playerId]).toBeTruthy();
  });

  describe('when there is only one player', () => {
    it('promotes the player to leader', () => {
      expect(Object.keys(room.players)).toHaveLength(0);
      room.addPlayer(playerId);
      expect(Object.keys(room.players)).toHaveLength(1);
      const player = room.getPlayerById(playerId);
      expect(player.isLeader).toEqual(true);
    });
  });

  describe('when there are two players', () => {
    it('does not change the leader', () => {
      const newPlayerId = '456';
      room.addPlayer(playerId);
      room.addPlayer(newPlayerId);
      const player = room.getPlayerById(playerId);
      expect(player.isLeader).toEqual(true);
      const newPlayer = room.getPlayerById(newPlayerId);
      expect(newPlayer.isLeader).toEqual(false);
    });
  });
});

describe('getPlayerById', () => {
  it('gets the correct player', () => {
    room.addPlayer(playerId);
    const player = room.getPlayerById(playerId);
    expect(player.id).toEqual(playerId);
  });
});

describe('removePlayer', () => {
  it('removes the player', () => {
    room.addPlayer(playerId);
    expect(Object.keys(room.players)).toHaveLength(1);
    const player = room.removePlayer(playerId);
    expect(Object.keys(room.players)).toHaveLength(0);
  });

  describe('when the leader is removed', () => {
    it('promotes a random player', () => {
      room.addPlayer(playerId); // initial leader
      expect(room.getPlayerById(playerId).isLeader).toEqual(true);
      room.addPlayer('456');
      room.addPlayer('789');
      room.addPlayer('abc');
      room.removePlayer(playerId);
      expect(room.getPlayerById('456').isLeader).toEqual(true);
    });
  });
});
