import React from 'react';
import { useSelector } from 'react-redux';

import VoteWidget from '../common/VoteWidget';

import {
  socketSelector,
} from '../../store/selectors';

function VotingPhaseView() {
  const socket = useSelector(socketSelector);

  const onVote = (playerId) => {
    socket.emit('playerAction', {
      action: 'vote',
      votedPlayerId: playerId,
    });
  };

  return (
    <>
      <p>Vote for who you think is the fake artist!</p>
      <VoteWidget onVote={onVote}/>
    </>
  );
}

export default VotingPhaseView;
