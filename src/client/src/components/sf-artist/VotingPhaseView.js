import React from 'react';
import { useSelector } from 'react-redux';

import BrushColorLabels from './BrushColorLabels';
import FinalCanvas from './FinalCanvas';
import VoteWidget from '../common/VoteWidget';

import {
  gameDataSelector,
  playersSelector,
  socketSelector,
} from '../../store/selectors';

function VotingPhaseView() {
  const gameData = useSelector(gameDataSelector);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);

  const playersInOrder = gameData.playerOrder.map(playerId => players[playerId]);

  const onVote = (playerId) => {
    socket.emit('playerAction', {
      action: 'vote',
      votedPlayerId: playerId,
    });
  };

  return (
    <>
      <FinalCanvas />
      <BrushColorLabels players={playersInOrder}/>
      <p>Vote for who you think is the fake artist!</p>
      <VoteWidget onVote={onVote}/>
    </>
  );
}

export default VotingPhaseView;
