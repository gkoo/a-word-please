import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup';

import {
  connectedPlayersSelector,
  currPlayerSelector,
  currUserIsSpectatorSelector,
} from '../../store/selectors';

function VoteWidget({ includeSelf, onVote }) {
  const [votedPlayerId, setVotedPlayerId] = useState(null);

  const currPlayer = useSelector(currPlayerSelector);
  const currUserIsSpectator = useSelector(currUserIsSpectatorSelector);
  const players = useSelector(connectedPlayersSelector);

  let candidates = players;

  if (!currPlayer) { return; }

  if (!includeSelf) {
    candidates = players.filter(player => player.id !== currPlayer.id);
  }

  const onVoteClick = (candidateId) => {
    setVotedPlayerId(candidateId);
    onVote(candidateId);
  };

  return (
    <ListGroup className='text-left'>
      {
        candidates.map(candidate =>
          <ListGroup.Item>
            <h3 className='float-left'>{candidate.name}</h3>
            {
              (!votedPlayerId || votedPlayerId === candidate.id) && !currUserIsSpectator &&
                <div className='text-right'>
                  <Button
                    variant='outline-info'
                    active={votedPlayerId === candidate.id}
                    onClick={() => onVoteClick(candidate.id)}
                  >
                    Vote
                  </Button>
                </div>
            }
          </ListGroup.Item>
        )
      }
    </ListGroup>
  );
}

export default VoteWidget;
