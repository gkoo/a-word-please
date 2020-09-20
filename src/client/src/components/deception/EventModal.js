import React from 'react';
import { useSelector } from 'react-redux';

import CardDeck from 'react-bootstrap/CardDeck';
import Modal from 'react-bootstrap/Modal';

import AUsefulClue from './AUsefulClue';
import DeliberationView from './DeliberationView';
import TileCard from './TileCard';
import { GameState } from '../../constants/deception';
import {
  currPlayerIsScientistSelector,
  gameDataSelector,
} from '../../store/selectors';

function EventModal() {
  const gameData = useSelector(gameDataSelector);
  const currPlayerIsScientist = useSelector(currPlayerIsScientistSelector);

  const { ScientistEvent } = GameState;
  const {
    eventTileData,
    state
  } = gameData;
  const { newSceneTile, sceneTiles } = eventTileData;

  const eventTile = gameData.newSceneTile;
  const scientistOnlyTiles = [
    'A Useful Clue',
    'Erroneous Information',
    'Countdown',
  ];

  if (!currPlayerIsScientist && scientistOnlyTiles.includes(eventTile.label)) {
    return <DeliberationView />
  }

  return (
    <Modal className='deception-event-modal' show={state === ScientistEvent}>
      <Modal.Header>
        <Modal.Title>
          {eventTile.label}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{eventTile.description}</p>
        {eventTile.label === 'A Useful Clue' && <AUsefulClue />}
      </Modal.Body>
    </Modal>
  );
}

export default EventModal;
