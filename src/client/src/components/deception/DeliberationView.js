import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import AccusePlayerModal from './AccusePlayerModal';
import PlayerGroupView from './PlayerGroupView';
import SceneTileReplacedModal from './SceneTileReplacedModal';
import TilesView from './TilesView';
import {
  currPlayerIsScientistSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function DeliberationView() {
  const [closedSceneTileReplacedModal, setClosedSceneTileReplacedModal] = useState(false);
  const gameData = useSelector(gameDataSelector);
  const socket = useSelector(socketSelector);
  const currPlayerIsScientist = useSelector(currPlayerIsScientistSelector);

  const { accusationActive, oldSceneTile, newSceneTile } = gameData;

  const onStartNextRound = () => socket.emit('handlePlayerAction', { action: 'nextRound' });

  const onEndAccusation = () => socket.emit('endAccusation');

  const onAccusedDetailsChange = (type, value) => socket.emit(
    'changeAccuseDetails',
    {
      action: 'updateAccusedMurderMethod',
      type,
      value,
    }
  );

  const onConfirmAccusation = () => socket.emit(
    'handlePlayerAction',
    { action: 'confirmAccusation' }
  );

  return (
    <>
      {
        currPlayerIsScientist &&
          <div className='text-center my-2'>
              <p>Forensic Scientist: When everyone is done making their case, start the next round.</p>
              <Button onClick={onStartNextRound}>
                Start Next Round
              </Button>
          </div>
      }
      <TilesView showHeaders={true}Card/>
      <hr />
      <h3>Players</h3>
      <p>
        At any time during deliberation, you can accuse another player who you think is the
        murderer. You are allowed to make an accusation exactly one time. When you do, you must
        specify the murder method and the key evidence that you think the murderer chose. If the
        guess is correct, the investigators win the game! If the guess is incorrect, you receive no
        additional information, and you are not allowed to accuse for the rest of the game.
      </p>
      <p>
        The murderer is allowed to make an accusation as well. The forensic scientist is not allowed
        to accuse.
      </p>
      <PlayerGroupView />
      <AccusePlayerModal
        show={accusationActive}
        endAccusation={onEndAccusation}
        onDetailsChange={onAccusedDetailsChange}
        onConfirmAccusation={onConfirmAccusation}
      />
      {
        oldSceneTile && newSceneTile &&
          <SceneTileReplacedModal
            show={!closedSceneTileReplacedModal}
            onClose={() => setClosedSceneTileReplacedModal(true)}
          />
      }
    </>
  );
}

export default DeliberationView;
