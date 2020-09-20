import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

import EndGameButtons from '../common/EndGameButtons';
import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import * as selectors from '../../store/selectors';
import {
  WEREWOLF_ROLE_LABELS,
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

const renderVotedPlayerRow = (suspectPlayer, voterPlayers, isEliminated) => {
  return (
    <ListGroup.Item variant={isEliminated ? 'danger' : ''}>
      <h3>{isEliminated && '💀 '}{suspectPlayer.name}{isEliminated && ' 💀'}</h3>
      {voterPlayers.map(voter => <Badge>{voter.name}</Badge>)}
    </ListGroup.Item>
  );
};

const renderPlayerRow = (player, eliminatedPlayers) => {
  const team = getTeam(player.role);
  const roleLabelClass = cx({
    werewolf: team === ROLE_WEREWOLF,
    tanner: team === ROLE_TANNER,
    villager: team === ROLE_VILLAGER,
  });
  const voterIsEliminated = eliminatedPlayers.indexOf(player) >= 0;

  return (
    <tr>
      <td>
        <span role='img' aria-label='Eliminated player' className='mr-2'>
          { voterIsEliminated && '💀' }
        </span>
        {player?.name}
        <span role='img' aria-label='Eliminated player' className='ml-2'>
          { voterIsEliminated && '💀' }
        </span>
      </td>
      <td>
        <span className={`team-label ${roleLabelClass}`}>
          {WEREWOLF_ROLE_LABELS[player.role]}
        </span>
      </td>
    </tr>
  );
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
      <div className='mb-5'>
        <h1>Vote Results</h1>
      </div>
      <ListGroup className='text-left'>
        {
          playerIdsSortedByMostVotes.map(suspectId => {
            const isEliminated = eliminatedPlayers.find(player => player.id === suspectId);
            const voterIds = [];
            Object.keys(votes).forEach(voterId => {
              if (votes[voterId] === suspectId) {
                voterIds.push(voterId);
              }
            });
            const voters = voterIds.map(voterId => players[voterId]);
            return renderVotedPlayerRow(players[suspectId], voters, isEliminated);
          })
        }
      </ListGroup>
      {/* sort by num votes */}
      {
        !revealingRoles &&
          <div className='my-3'>
            <Button onClick={revealRoles}>Reveal Roles</Button>
          </div>
      }
      {
        revealingRoles &&
          <>
            <h2 className='my-5'>
              {winners.map(role => `Team ${WEREWOLF_ROLE_LABELS[role]}`).join(' and ')} win
              {winners.length === 1 && 's'}
              !
            </h2>
            <div className='my-3'>
              <strong>Winners</strong>:
              {winnerPlayers.map(player => <PlayerCheckboxLabel player={player} />)}
            </div>
            <Row>
              <Col
                md={{ offset: 1, span: 10 }}
                lg={{ offset: 2, span: 8 }}
                xl={{ offset: 3, span: 6 }}
              >
                <Table>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      playersToDisplay.map(
                        player => renderPlayerRow(player, eliminatedPlayers)
                      )
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>
            <EndGameButtons/>
          </>
      }
    </div>
  );
}

export default VoteResults;
