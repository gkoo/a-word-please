import React from 'react';
import { useSelector } from 'react-redux';

import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';

import {
  playersSelector,
} from '../../store/selectors';

const renderVotedPlayerRow = (suspectPlayer, voterPlayers, isEliminated, renderSkulls) => {
  const shouldShowSkulls = isEliminated && renderSkulls;

  return (
    <ListGroup.Item key={suspectPlayer.id} variant={isEliminated ? 'danger' : ''}>
      {voterPlayers.map(voter => <Badge key={voter.id}>{voter.name}</Badge>)}
      <span> voted for:</span>
      <h3>{shouldShowSkulls && '💀 '}{suspectPlayer.name}{shouldShowSkulls && ' 💀'}</h3>
    </ListGroup.Item>
  );
};

function VoteResults({ voteMap, eliminatedPlayers, renderSkulls }) {
  const players = useSelector(playersSelector);

  if (Object.keys(voteMap).length === 0) {
    return false;
  }

  const talliedVotes = {}
  Object.values(voteMap).forEach(suspectId => {
    if (!talliedVotes[suspectId]) { talliedVotes[suspectId] = 0; }
    ++talliedVotes[suspectId];
  });

  const sortedVoteEntries = Object.entries(talliedVotes).sort((entry1, entry2) =>
    entry2[1] - entry1[1]
  );

  const highestNumVotes = sortedVoteEntries[0][1];

  // List of player ids with votes, sorted by number of votes
  const playerIdsSortedByMostVotes = sortedVoteEntries.map(entry => entry[0]);

  const highestVotedPlayers = playerIdsSortedByMostVotes.filter(
    playerId => talliedVotes[playerId] === highestNumVotes
  );

  return (
    <ListGroup className='text-left'>
      {
        playerIdsSortedByMostVotes.map(suspectId => {
          const isEliminated = highestVotedPlayers.find(playerId => playerId === suspectId);

          // Voters who voted for this player
          const voterIds = Object.keys(voteMap).filter(voterId =>
            voteMap[voterId] === suspectId
          );
          const voters = voterIds.map(voterId => players[voterId]);

          return renderVotedPlayerRow(players[suspectId], voters, isEliminated, renderSkulls);
        })
      }
    </ListGroup>
  );
}

export default VoteResults;
