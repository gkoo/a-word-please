import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import {
  STATE_ENTERING_CLUES,
  STATE_REVIEWING_CLUES,
  STATE_ENTERING_GUESS,
  STATE_TURN_END,
  STATE_GAME_END,
} from '../constants';
import DuplicatesModal from './DuplicatesModal';
import EnteringCluesView from './EnteringCluesView';
import EnteringGuessView from './EnteringGuessView';
import GameEndView from './GameEndView';
import LeaderPanel from './LeaderPanel';
import TurnEndView from './TurnEndView';
import * as selectors from '../store/selectors';

function Board() {
  const clues = useSelector(selectors.cluesSelector);
  const currPlayer = useSelector(selectors.currPlayerSelector);
  const currPlayerIsGuesser = useSelector(selectors.currPlayerIsGuesserSelector);
  const currWord = useSelector(selectors.currWordSelector);
  const gameState = useSelector(selectors.gameStateSelector);
  const guesser = useSelector(selectors.guesserSelector);
  const numPoints = useSelector(selectors.numPointsSelector);
  const numRoundsLeft = useSelector(selectors.numRoundsLeftSelector);
  const players = useSelector(selectors.playersSelector);
  const users = useSelector(selectors.usersSelector);

  let clueGivers;
  if (guesser) {
    clueGivers = Object.values(players).filter(player =>
      player.id !== guesser.id && player.connected
    );
  } else {
    clueGivers = [];
  }

  return (
    <div className='board py-5'>
      <Row>
        <Col sm={8} className='main-panel py-5'>
          {
            [STATE_ENTERING_CLUES, STATE_REVIEWING_CLUES].includes(gameState) &&
              <EnteringCluesView
                clues={clues}
                clueGivers={clueGivers}
                currPlayer={currPlayer}
                currPlayerIsGuesser={currPlayerIsGuesser}
                currWord={currWord}
                guesser={guesser}
              />
          }
          {
            gameState === STATE_ENTERING_GUESS &&
              <EnteringGuessView
                clues={clues}
                clueGivers={clueGivers}
                currPlayerIsGuesser={currPlayerIsGuesser}
                currWord={currWord}
                guesser={guesser}
              />
          }
          {
            gameState === STATE_TURN_END &&
              <TurnEndView />
          }
          {
            gameState === STATE_GAME_END &&
              <GameEndView />
          }
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
            guesser &&
              <>
                <h3><u>Guesser</u></h3>
                <div className={`inline-player-label player-label ${players[guesser.id].color}`}>{guesser.name}</div>
              </>
          }
          <h3 className='mt-5'><u>Clue Givers</u></h3>
          {
            clueGivers.map(clueGiver =>
              <>
              {clues[clueGiver.id] && '✅ '}
              <div className={`player-label ${players[clueGiver.id].color}`}>
                {clueGiver.name}
              </div>
              <br />
              </>
            )
          }
        </Col>
      </Row>
      <DuplicatesModal show={gameState === STATE_REVIEWING_CLUES}/>
    </div>
  );
}

export default Board;
