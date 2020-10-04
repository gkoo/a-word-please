import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button'

import {
  connectedPlayersSelector,
  currPlayerSelector,
} from '../../store/selectors';

function Voting({ includeSelf, onVote }) {
  const [votedPlayerId, setVotedPlayerId] = useState(null);

  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(connectedPlayersSelector);

  let candidates = players;

  if (!currPlayer) { return; }

  if (!includeSelf) {
    candidates = players.filter(player => player.id !== currPlayer.id);
  }

  return (
    <div className='text-center'>
      {
        candidates.map(player =>
          <Button
            active={player.id === votedPlayerId}
            className='mx-1'
            variant='outline-info'
            onClick={() => setVotedPlayerId(player.id)}
          >
            {player.name}
          </Button>
        )
      }
      <div className='mt-4'>
        <Button disabled={!votedPlayerId} onClick={() => onVote(votedPlayerId)}>Confirm Vote</Button>
      </div>
    </div>
  );
}

export default Voting;
