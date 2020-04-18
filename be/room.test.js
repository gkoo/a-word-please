const Room = require('./room');

let room;

beforeEach(() => {
  room = new Room();
});

const playerId = '123';

describe('addPlayer', () => {
  test('adds a player', () => {
    room.addPlayer(playerId);
    expect(Object.keys(room.players)).toHaveLength(1);
    expect(room.players[playerId]).toBeTruthy();
  });

  describe('when there is only one player', () => {
    test('promotes the player to leader', () => {
      expect(Object.keys(room.players)).toHaveLength(0);
      room.addPlayer(playerId);
      expect(Object.keys(room.players)).toHaveLength(1);
      const player = room.getPlayerById(playerId);
      expect(player.isLeader).toEqual(true);
    });
  });

  describe('when there are two players', () => {
    test('does not change the leader', () => {
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
  test('gets the correct player', () => {
    room.addPlayer(playerId);
    const player = room.getPlayerById(playerId);
    expect(player.id).toEqual(playerId);
  });
});

describe('removePlayer', () => {
  test('removes the player', () => {
    room.addPlayer(playerId);
    expect(Object.keys(room.players)).toHaveLength(1);
    const player = room.removePlayer(playerId);
    expect(Object.keys(room.players)).toHaveLength(0);
  });

  describe('when the leader is removed', () => {
    test('promotes a random player', () => {
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

describe('startGame', () => {
  test('returns game data for each player', () => {
    room.addPlayer('123');
    room.addPlayer('456');
    const gameData = room.startGame('123');
    playerData1 = gameData['123'];
    playerData2 = gameData['456'];
    expect(playerData1.players).toBeTruthy();
    expect(playerData2.players).toBeTruthy();
  });
});
