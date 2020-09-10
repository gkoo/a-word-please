import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Alert from 'react-bootstrap/Alert';
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
    newSceneTile,
    oldSceneTile,
    presentationSecondsLeft,
    roundNum,
    totalNumRounds,
  } = gameData;

  const onEndRound = () => socket.emit('playerAction', { action: 'endRound' });

  const onEndAccusation = () => socket.emit('playerAction', { action: 'endAccusation' });

  const onStartTimer = () => socket.emit('playerAction', { action: 'startTimer' });

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
        currPlayerIsScientist &&
          <Alert variant='info' className='mb-5'>
            <Alert.Heading>
              Forensic Scientist Instructions
            </Alert.Heading>
            {
              !isLastRound &&
                <p>
                  This is the { roundNum === 1 ? '1st' : '2nd' } of {totalNumRounds} rounds. Each
                  player gets 30 seconds to make their case. Please time them and start the next
                  round once everyone is done.
                </p>
            }
            {
              isLastRound &&
                <p>
                  This is the last round. When everyone is done making an accusation, please end the
                  game.
                </p>
            }
            <div className='text-center'>
              {
                !presentationSecondsLeft &&
                  <Button onClick={onStartTimer} className='mx-1'>
                    Start Timer
                  </Button>
              }
              <Button onClick={onEndRound} className='mx-1'>
                { roundNum < totalNumRounds ? 'Start Next Round' : 'End Game' }
              </Button>
            </div>
          </Alert>
      }
      {
        presentationSecondsLeft !== undefined &&
          <div className='text-center mb-5'>
            <p>Current Presentation Time Left:</p>
            <h1>{presentationSecondsLeft || 'Time\'s up!'}</h1>
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
