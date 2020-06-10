import React from 'react';
import { useSelector } from 'react-redux';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { GAME_A_WORD_PLEASE, GAME_WEREWOLF } from '../constants';
import AWordPleaseBoard from './a-word-please/AWordPleaseBoard';
import WerewolfBoard from './werewolf/WerewolfBoard';
import { gameIdSelector } from '../store/selectors';

const renderGame = gameId => {
  console.log('renderGame');
  switch (gameId) {
    case GAME_A_WORD_PLEASE:
      return <AWordPleaseBoard />;
    case GAME_WEREWOLF:
      // TODO
      return <WerewolfBoard />;
    default:
      throw new Error('Unrecognized game id');
  }
}

function Game() {
  const gameId = useSelector(gameIdSelector);

  return (
    <>
      <Row>
        <Col>
          {renderGame(gameId)}
        </Col>
      </Row>
    </>
  );
}

export default Game;
