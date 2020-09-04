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
  userPreferencesSelector,
} from '../../store/selectors';

function DeliberationView() {
  const [closedSceneTileReplacedModal, setClosedSceneTileReplacedModal] = useState(false);
  const gameData = useSelector(gameDataSelector);
  const socket = useSelector(socketSelector);
  const currPlayerIsScientist = useSelector(currPlayerIsScientistSelector);
  const userPreferences = useSelector(userPreferencesSelector);

  const { hideRules } = userPreferences;

  const {
    accusationActive,
    oldSceneTile,
    newSceneTile,
    roundNum,
    totalNumRounds,
  } = gameData;

  const onEndRound = () => socket.emit('playerAction', { action: 'endRound' });

  const onEndAccusation = () => socket.emit('playerAction', { action: 'endAccusation' });

  const onAccusedDetailsChange = (type, value) => socket.emit(
    'playerAction',
    {
      action: 'changeAccuseDetails',
      type,
      value,
    }
  );

  const onConfirmAccusation = () => socket.emit(
    'playerAction',
    { action: 'confirmAccusation' }
  );

  const isLastRound = roundNum >= totalNumRounds;

  return (
    <>
      {
        currPlayerIsScientist && !isLastRound &&
          <div className='text-center my-2'>
            {
              !isLastRound &&
                <p>Forensic Scientist: When everyone is done making their case, start the next round.</p>
            }
            {
              isLastRound &&
                <p>
                  Forensic Scientist: This is the last round. When everyone is done making an
                  accusation, please end the round
                </p>
            }
            <Button onClick={onEndRound}>
              { roundNum < totalNumRounds ? 'Start Next Round' : 'End Game' }
            </Button>
          </div>
      }
      <TilesView showHeaders={!hideRules} />
      <hr />
      {
        !hideRules &&
          <>
            <h3>Players</h3>
            <p>
              At any time during deliberation, you can accuse another player who you think is the
              murderer. You are allowed to make an accusation exactly one time. When you do, you must
              specify the murder method and the key evidence that you think the murderer chose.
            </p>
            <p>
              If the guess is correct, the investigators win the game! If the guess is incorrect,
              you receive no additional information&mdash;you do not get to learn if you guessed
              only the evidence correct, only the player correct, etc.&mdash;and you are not allowed
              to accuse for the rest of the game.
            </p>
            <p>
              The murderer is allowed to make an accusation as well. The forensic scientist is not allowed
              to accuse.
            </p>
          </>
      }
      <PlayerGroupView showAccuseButtons={true} />
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
