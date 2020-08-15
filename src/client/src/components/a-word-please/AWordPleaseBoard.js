import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import {
  STATE_AWP_ENTERING_CLUES,
  STATE_AWP_REVIEWING_CLUES,
  STATE_AWP_ENTERING_GUESS,
  GAME_STATE_TURN_END,
  GAME_STATE_GAME_END,
} from '../../constants';
import DuplicatesModal from './DuplicatesModal';
import EnteringCluesView from './EnteringCluesView';
import EnteringGuessView from './EnteringGuessView';
import GameEndView from './GameEndView';
import LeaderPanel from '../LeaderPanel';
import TurnEndView from './TurnEndView';
import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import * as selectors from '../../store/selectors';

function AWordPleaseBoard() {
  const clues = useSelector(selectors.cluesSelector);
  const currPlayer = useSelector(selectors.currPlayerSelector);
  const currPlayerIsGuesser = useSelector(selectors.currPlayerIsActivePlayerSelector);
  const currWord = useSelector(selectors.currWordSelector);
  const gameState = useSelector(selectors.gameStateSelector);
  const activePlayer = useSelector(selectors.activePlayerSelector);
  const numPoints = useSelector(selectors.numPointsSelector);
  const numRoundsLeft = useSelector(selectors.numRoundsLeftSelector);
  const players = useSelector(selectors.playersSelector);
  const users = useSelector(selectors.usersSelector);
  const spectatorUsers = useSelector(selectors.spectatorUsersSelector);

  let clueGivers;
  if (activePlayer) {
    clueGivers = Object.values(players).filter(player =>
      player.id !== activePlayer.id && player.connected
    );
  } else {
    clueGivers = [];
  }

  return (
    <div className='board py-5'>
      <Row>
        <Col sm={8} className='main-panel py-5'>
          {
            [STATE_AWP_ENTERING_CLUES, STATE_AWP_REVIEWING_CLUES].includes(gameState) &&
              <EnteringCluesView
                clues={clues}
                clueGivers={clueGivers}
                currPlayer={currPlayer}
                currPlayerIsGuesser={currPlayerIsGuesser}
                currWord={currWord}
                guesser={activePlayer}
              />
          }
          {
            gameState === STATE_AWP_ENTERING_GUESS &&
              <EnteringGuessView
                clues={clues}
                clueGivers={clueGivers}
                currPlayerIsGuesser={currPlayerIsGuesser}
                currWord={currWord}
                guesser={activePlayer}
              />
          }
          {
            gameState === GAME_STATE_TURN_END &&
              <TurnEndView />
          }
          {
            gameState === GAME_STATE_GAME_END &&
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
            activePlayer &&
              <>
                <h3><u>Guesser</u></h3>
                <div className={`inline-player-label player-label ${players[activePlayer.id].color}`}>
                  {activePlayer.name}
                </div>
              </>
          }
          <h3 className='mt-5'><u>Clue Givers</u></h3>
          {
            clueGivers.map(clueGiver =>
              <>
                <PlayerCheckboxLabel
                  checked={!!clues[clueGiver.id]}
                  player={clueGiver}
                />
                <br />
              </>
            )
          }
          {
            !!spectatorUsers.length &&
              <>
                <h3 className='mt-5'><u>Spectators</u></h3>
                {
                  spectatorUsers.map(spectatorUser =>
                    <>
                      <PlayerCheckboxLabel
                        player={spectatorUser}
                      />
                      <br />
                    </>
                  )
                }
              </>
          }
        </Col>
      </Row>
      <DuplicatesModal show={gameState === STATE_AWP_REVIEWING_CLUES}/>
    </div>
  );
}

export default AWordPleaseBoard;
