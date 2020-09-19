import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import BackToLobbyButton from '../common/BackToLobbyButton';
import PlayerGroupView from './PlayerGroupView';
import { Role, RoleLabels } from '../../constants/deception';
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

  const {
    Accomplice,
    Investigator,
    Murderer,
    Scientist,
    Witness,
  } = Role;

  const { witnessGuessCorrect } = gameData;
  const witnessSuspect = players[witnessSuspectId];

  const onNewGame = () => socket.emit('startGame');

  useEffect(() => {
    setWitnessSuspectId(gameData.witnessSuspectId);
  }, [gameData.witnessSuspectId]);

  const candidatePlayers = Object.values(players).filter(player =>
    ![Accomplice, Murderer, Scientist].includes(player.role)
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
          {murderer.name} was the {RoleLabels[Murderer]}! Now {murderer.name} has the chance to
          guess who the {RoleLabels[Witness]} is and go free!
        </p>
        {
          accomplice &&
            <p>Feel free to discuss with your {RoleLabels[Accomplice]}, {accomplice.name}.</p>
        }
        {
          /* has not guessed yet */
          witnessGuessCorrect === undefined &&
            <>
              <h3>{murderer.name}, who is the {RoleLabels[Witness]}?</h3>
              {
                candidatePlayers.map(player =>
                  <Button
                    variant='outline-info'
                    className='mx-1'
                    active={witnessSuspectId === player.id}
                    onClick={() => onSuspectWitness(player.id)}
                  >
                    {player.name}
                  </Button>
                )
              }

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
                {` ${RoleLabels[Witness]}`} and was
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
                    {RoleLabels[Investigator]}s win!
                  </h1>
              }
              {
                witnessGuessCorrect &&
                  <h1>
                    {RoleLabels[Murderer]} wins!
                  </h1>
              }
              <div className='text-center my-5'>
                <ButtonGroup>
                  <Button onClick={onNewGame}>
                    New Game
                  </Button>
                  <BackToLobbyButton/>
                </ButtonGroup>
              </div>

              <PlayerGroupView
                showRoles={true}
                showAccuseButtons={false}
                showMethodAndEvidence={true}
              />
            </div>
        }
      </div>
    </>
  );
}

export default GuessWitnessView;
