import React from 'react';
import { useSelector } from 'react-redux';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import {
  GAME_A_WORD_PLEASE,
  GAME_WEREWOLF,
  GAME_WAVELENGTH,
  GAME_DECEPTION,
  GAME_SF_ARTIST,
} from '../constants';
import AWordPleaseBoard from './a-word-please/AWordPleaseBoard';
import DeceptionBoard from './deception/DeceptionBoard';
import SfArtistBoard from './sf-artist/SfArtistBoard';
import WerewolfBoard from './werewolf/WerewolfBoard';
import WavelengthBoard from './wavelength/WavelengthBoard';
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
          {
            gameId === GAME_WAVELENGTH &&
              <WavelengthBoard />
          }
          {
            gameId === GAME_DECEPTION &&
              <DeceptionBoard />
          }
          {
            gameId === GAME_SF_ARTIST &&
              <SfArtistBoard />
          }
        </Col>
      </Row>
    </>
  );
}

export default Game;
