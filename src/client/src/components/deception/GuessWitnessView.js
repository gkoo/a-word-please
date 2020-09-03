import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';

import PlayerGroupView from './PlayerGroupView';
import { DECEPTION_ROLE_LABELS, ROLE_ACCOMPLICE, ROLE_INVESTIGATOR, ROLE_MURDERER, ROLE_SCIENTIST, ROLE_WITNESS } from '../../constants';
import {
  accompliceSelector,
  currPlayerIsMurdererSelector,
  gameDataSelector,
  murdererSelector,
  playersSelector,
  socketSelector,
} from '../../store/selectors';

function GuessWitnessView() {
  const [witnessSuspectId, setWitnessSuspectId] = useState(null);
  const accomplice = useSelector(accompliceSelector);
  const gameData = useSelector(gameDataSelector);
  const murderer = useSelector(murdererSelector);
  const currPlayerIsMurderer = useSelector(currPlayerIsMurdererSelector);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);

  const { witnessGuessCorrect } = gameData;
  const witnessSuspect = players[witnessSuspectId];

  const onNewGame = () => socket.emit('startGame');

  useEffect(() => {
    setWitnessSuspectId(gameData.witnessSuspectId);
  }, [gameData.witnessSuspectId]);

  const candidatePlayers = Object.values(players).filter(player =>
    ![ROLE_ACCOMPLICE, ROLE_MURDERER, ROLE_SCIENTIST].includes(player.role)
  );

  const onConfirmGuess = () => socket.emit('playerAction', { action: 'guessWitness' });

  const onSuspectWitness = (playerId) => {
    if (!currPlayerIsMurderer) { return; }

    setWitnessSuspectId(playerId);
    socket.emit('playerAction', { action: 'setWitnessGuess', playerId });
  };

  return (
    <>
      <div className='text-center'>
        <h1>CAUGHT!</h1>
        <p>
          {murderer.name} was the {DECEPTION_ROLE_LABELS[ROLE_MURDERER]}! Now he has the chance to
          guess who the {DECEPTION_ROLE_LABELS[ROLE_WITNESS]} is and go free!
        </p>
        {
          accomplice &&
            <p>Feel free to discuss with your {DECEPTION_ROLE_LABELS[ROLE_ACCOMPLICE]}, {accomplice.name}.</p>
        }
        {
          /* has not guessed yet */
          witnessGuessCorrect === undefined &&
            <>
              <h3>{murderer.name}, who is the {DECEPTION_ROLE_LABELS[ROLE_WITNESS]}?</h3>
              <ToggleButtonGroup name='witness-suspects' value={witnessSuspectId} onChange={onSuspectWitness}>
                {
                  candidatePlayers.map(player =>
                    <ToggleButton variant='outline-info' value={player.id}>
                      {player.name}
                    </ToggleButton>
                  )
                }
              </ToggleButtonGroup>

              {
                currPlayerIsMurderer &&
                  <div className='mt-3'>
                    <Button onClick={onConfirmGuess}>
                      Confirm Guess
                    </Button>
                  </div>
              }
            </>
        }
        {
          /* showing guess results */
          witnessSuspect && witnessGuessCorrect !== undefined &&
            <div className='mt-5'>
              <p>
                {murderer.name} guessed {witnessSuspect.name} is the
                {` ${DECEPTION_ROLE_LABELS[ROLE_WITNESS]}`} and was
                <span
                  className={cx({
                    'text-success': witnessGuessCorrect,
                    'text-danger': !witnessGuessCorrect,
                  })}
                >
                  {witnessGuessCorrect ? ' correct' : ' wrong'}
                </span>!
              </p>
              {
                !witnessGuessCorrect &&
                  <h1>
                    {DECEPTION_ROLE_LABELS[ROLE_INVESTIGATOR]}s win!
                  </h1>
              }
              {
                witnessGuessCorrect &&
                  <h1>
                    {DECEPTION_ROLE_LABELS[ROLE_MURDERER]} wins!
                  </h1>
              }
              <div className='text-center my-5'>
                <Button onClick={onNewGame}>
                  New Game
                </Button>
              </div>

              <PlayerGroupView showRoles={true} showAccuseButtons={false} />
            </div>
        }
      </div>
    </>
  );
}

export default GuessWitnessView;
