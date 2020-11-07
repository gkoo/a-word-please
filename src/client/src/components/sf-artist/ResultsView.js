import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import BrushColorLabels from './BrushColorLabels';
import EndGameButtons from '../common/EndGameButtons';
import FinalCanvas from './FinalCanvas';
import VoteResults from '../common/VoteResults';

import {
  gameDataSelector,
  playersSelector,
  socketSelector
} from '../../store/selectors';

function ResultsView() {
  const gameData = useSelector(gameDataSelector);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);

  const { fakeArtistId, revealFake } = gameData;

  const onReveal = () => socket.emit('playerAction', {
    action: 'revealFake'
  });
  const playersInOrder = gameData.playerOrder.map(playerId => players[playerId]);

  if (!fakeArtistId) {
    return <EndGameButtons/>;
  }

  return (
    <>
      <FinalCanvas />
      <BrushColorLabels players={playersInOrder}/>
      <VoteResults voteMap={gameData.votes}/>

      {
        !revealFake &&
          <div className='my-3 text-center'>
            <Button onClick={onReveal}>Reveal the Fake Artist</Button>
          </div>
      }
      {
        revealFake &&
          <div className='text-center mt-3'>
            <h1>{players[fakeArtistId].name}</h1>
            <p>was the fake artist!</p>
            <EndGameButtons/>
          </div>
      }
    </>
  );
}

export default ResultsView;
