import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button';

import CluePhase from './CluePhase';
import GuessPhase from './GuessPhase';
import LeaderPanel from '../LeaderPanel';
import PlayerLabel from '../common/PlayerLabel';
import RevealPhase from './RevealPhase';
import * as selectors from '../../store/selectors';
import {
  STATE_WAVELENGTH_CLUE_PHASE,
  STATE_WAVELENGTH_GUESS_PHASE,
  STATE_WAVELENGTH_REVEAL_PHASE,
} from '../../constants';

const MAX_CLUE_LENGTH = 100;

function WavelengthBoard() {
  const activePlayer = useSelector(selectors.activePlayerSelector);
  const gameState = useSelector(selectors.gameStateSelector);
  const numPoints = useSelector(selectors.numPointsSelector);
  const numRoundsLeft = useSelector(selectors.numRoundsLeftSelector);
  const users = useSelector(selectors.usersSelector);
  const wavelengthGuessers = useSelector(selectors.wavelengthGuessersSelector);

  return (
    <div className='board py-5'>
      <Row>
        <Col sm={8} className='main-panel py-5'>
          { gameState === STATE_WAVELENGTH_CLUE_PHASE && <CluePhase /> }
          { gameState === STATE_WAVELENGTH_GUESS_PHASE && <GuessPhase /> }
          { gameState === STATE_WAVELENGTH_REVEAL_PHASE && <RevealPhase /> }
        </Col>
        <Col sm={4} className='main-panel text-center py-5'>
          <LeaderPanel numUsers={Object.keys(users).length}/>
          <Row className='py-4'>
            <Col sm={6}>
              <u>Points</u>
              <br />
              {numPoints}
            </Col>
            <Col sm={6}>
              <u>Turns Left</u>
              <br />
              {numRoundsLeft}
            </Col>
          </Row>
          {
            activePlayer &&
              <>
                <h3><u>Psychic</u></h3>
                <div className={`inline-player-label player-label ${activePlayer.color}`}>
                  {activePlayer.name}
                </div>
              </>
          }
          <h3 className='mt-5'><u>Guessers</u></h3>
          {
            wavelengthGuessers.map(wavelengthGuesser =>
              <>
                <PlayerLabel player={wavelengthGuesser} />
                <br />
              </>
            )
          }
        </Col>
      </Row>
    </div>
  );
}

export default WavelengthBoard;
