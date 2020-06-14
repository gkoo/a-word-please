import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Button from 'react-bootstrap/Button';
import CardDeck from 'react-bootstrap/CardDeck';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import VoteLabel from './VoteLabel';
import * as selectors from '../../store/selectors';
import {
  ROLE_WEREWOLF,
  ROLE_MINION,
  ROLE_TANNER,
  ROLE_VILLAGER,
} from '../../constants';

const getTeam = role => {
  if ([ROLE_WEREWOLF, ROLE_MINION].includes(role)) {
    return ROLE_WEREWOLF;
  }
  if (role === ROLE_TANNER) {
    return ROLE_TANNER;
  }
  return ROLE_VILLAGER;
};

function VoteResults() {
  const eliminatedPlayers = useSelector(selectors.eliminatedPlayersSelector);
  const players = useSelector(selectors.playersSelector);
  const revealingRoles = useSelector(selectors.revealingRolesSelector);
  const socket = useSelector(selectors.socketSelector);
  const votes = useSelector(selectors.votesSelector);
  const winners = useSelector(selectors.winnersSelector);

  const revealRoles = () => socket.emit('playerAction', { action: 'revealRoles' });
  const winnerPlayers = Object.values(players).filter(
    player => winners.includes(getTeam(player.role))
  );

  const talliedVotes = {}
  Object.values(votes).forEach(suspectId => {
    if (!talliedVotes[suspectId]) { talliedVotes[suspectId] = 0; }
    ++talliedVotes[suspectId];
  });

  const sortedVoteEntries = Object.entries(talliedVotes).sort((entry1, entry2) =>
    entry2[1] - entry1[1]
  );
  // List of player ids with votes, sorted by number of votes
  const playerIdsSortedByMostVotes = sortedVoteEntries.map(entry => entry[0]);

  // List of all players, grouped and sorted by who they voted for
  const playersToDisplay = Object.values(players).sort((player1, player2) => {
    const idx1 = playerIdsSortedByMostVotes.indexOf(votes[player1.id]);
    const idx2 = playerIdsSortedByMostVotes.indexOf(votes[player2.id]);
    return idx1 - idx2;
  });

  return (
    <div className='text-center'>
      <div className='mb-2'>
        <h1>Vote Results</h1>
        <div className='mb-3'>
          <strong>Eliminated</strong>:
          {eliminatedPlayers.map(player => <PlayerCheckboxLabel player={player} />)}
        </div>
        {/* sort by num votes */}
        <div className={cx({ invisible: revealingRoles })}>
          <Button onClick={revealRoles}>Reveal Roles</Button>
        </div>
        <div className={cx({ invisible: !revealingRoles })}>
          <strong>Winners</strong>:
          {winnerPlayers.map(player => <PlayerCheckboxLabel player={player} />)}
        </div>
      </div>
      {
        playersToDisplay.map(
          player => (
            <VoteLabel
              voter={player}
              suspect={players[votes[player.id]]}
              voterIsEliminated={eliminatedPlayers.indexOf(player) >= 0}
              revealingRoles={revealingRoles}
              team={getTeam(player.role)}
            />
          )
        )
      }
    </div>
  );
}

export default VoteResults;
