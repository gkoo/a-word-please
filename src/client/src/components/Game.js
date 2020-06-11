import React from 'react';
import { useSelector } from 'react-redux';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { GAME_A_WORD_PLEASE, GAME_WEREWOLF } from '../constants';
import AWordPleaseBoard from './a-word-please/AWordPleaseBoard';
import WerewolfBoard from './werewolf/WerewolfBoard';
import { gameIdSelector } from '../store/selectors';

function Game() {
  const gameId = useSelector(gameIdSelector);

  return (
    <>
      <Row>
        <Col>
          {
            gameId === GAME_A_WORD_PLEASE &&
              <AWordPleaseBoard />
          }
          {
            gameId === GAME_WEREWOLF &&
              <WerewolfBoard />
          }
        </Col>
      </Row>
    </>
  );
}

export default Game;
