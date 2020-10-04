import React from 'react';
import { useSelector } from 'react-redux';

import Voting from '../common/Voting';

import {
  currPlayerSelector,
  currUserIsSpectatorSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function VotingPhaseView() {
  const currPlayer = useSelector(currPlayerSelector);
  const currUserIsSpectator = useSelector(currUserIsSpectatorSelector);
  const socket = useSelector(socketSelector);
  const gameData = useSelector(gameDataSelector);

  const { votes } = gameData;

  const onVote = (playerId) => {
    socket.emit('playerAction', {
      action: 'vote',
      votedPlayerId: playerId,
    });
  };

  return (
    <>
      <h1>We're voting</h1>
      {
        !votes[currPlayer?.id] &&
          <Voting onVote={onVote}/>
      }
      {
        !currUserIsSpectator && votes[currPlayer?.id] &&
          <em>Waiting for others...</em>
      }
    </>
  );
}

export default VotingPhaseView;
