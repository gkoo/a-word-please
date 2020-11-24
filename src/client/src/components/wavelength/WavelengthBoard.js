import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import CluePhase from './CluePhase';
import ExplainRulesPhase from './ExplainRulesPhase';
import GameEndPhase from './GameEndPhase';
import GuessPhase from './GuessPhase';
import LeaderPanel from '../LeaderPanel';
import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import PointsTable from './PointsTable';
import RevealPhase from './RevealPhase';
import SpectatorList from '../common/SpectatorList';
import * as selectors from '../../store/selectors';
import {
  STATE_WAVELENGTH_EXPLAIN_RULES,
  STATE_WAVELENGTH_CLUE_PHASE,
  STATE_WAVELENGTH_GUESS_PHASE,
  STATE_WAVELENGTH_REVEAL_PHASE,
  GAME_LABELS,
  GAME_STATE_GAME_END,
  GAME_WAVELENGTH,
} from '../../constants';

function WavelengthBoard() {
  const activePlayer = useSelector(selectors.activePlayerSelector);
  const currUserIsSpectator = useSelector(selectors.currUserIsSpectatorSelector);
  const gameState = useSelector(selectors.gameStateSelector);
  const numRoundsLeft = useSelector(selectors.numRoundsLeftSelector);
  const { playersReady } = useSelector(selectors.gameDataSelector);
  const users = useSelector(selectors.usersSelector);
  let wavelengthGuessers = useSelector(selectors.wavelengthGuessersSelector);
  wavelengthGuessers = wavelengthGuessers.filter(player => player.connected);

  return (
    <div className='board py-5'>
      <Row>
        <Col sm={8} className='main-panel py-5'>
          <h3 className='mb-4'>{GAME_LABELS[GAME_WAVELENGTH]}</h3>
          {
            ![STATE_WAVELENGTH_EXPLAIN_RULES, GAME_STATE_GAME_END].includes(gameState) &&
              <PointsTable/>
          }
          { gameState === STATE_WAVELENGTH_EXPLAIN_RULES && <ExplainRulesPhase /> }
          { gameState === STATE_WAVELENGTH_CLUE_PHASE && <CluePhase /> }
          { gameState === STATE_WAVELENGTH_GUESS_PHASE && <GuessPhase /> }
          { gameState === STATE_WAVELENGTH_REVEAL_PHASE && <RevealPhase /> }
          { gameState === GAME_STATE_GAME_END && <GameEndPhase /> }
        </Col>
        <Col sm={4} className='main-panel text-center py-5'>
          {
            !currUserIsSpectator &&
              <LeaderPanel numUsers={Object.keys(users).length}/>
          }
          <div className='text-center my-4'>
            <u>Turns Left</u>
            <br />
            {numRoundsLeft}
          </div>
          {
            activePlayer &&
              <>
                <h3><u>Psychic</u></h3>
                <div className={`inline-player-label player-label ${activePlayer.color}`}>
                  {activePlayer.name}
                </div>
              </>
          }
          <h3 className='mt-5'>
            <u>
              {gameState === STATE_WAVELENGTH_EXPLAIN_RULES ? 'Players' : 'Guessers'}
            </u>
          </h3>
          {
            wavelengthGuessers.map(wavelengthGuesser =>
              <>
                <PlayerCheckboxLabel
                  player={wavelengthGuesser}
                  checked={playersReady[wavelengthGuesser.id]}
                />
                <br />
              </>
            )
          }
          <SpectatorList />
        </Col>
      </Row>
    </div>
  );
}

export default WavelengthBoard;
