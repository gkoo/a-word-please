import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal'

import PlayerGroupModal from './PlayerGroupModal';
import TileCard from './TileCard';

import {
  gameDataSelector,
} from '../../store/selectors';

function NewSceneTileModal({ show, onClose }) {
  const [showPlayerGroup, setShowPlayerGroup] = useState(false);
  const [sceneSelection, setSceneSelection] = useState(null);
  const gameData = useSelector(gameDataSelector);
  const { newSceneTile } = gameData;

  const onTileSelectionChange = (selection) => {
    setSceneSelection(selection);
  };

  const onSubmit = () => onClose(sceneSelection);

  return (
    <>
      <Modal show={show}>
        <Modal.Header>
          <Modal.Title>
            Please choose a value from the new scene tile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col sm={{ offset: 2, span: 8 }} className='text-center'>
              <TileCard
                tileId={newSceneTile.id}
                label={newSceneTile.label}
                options={newSceneTile.options}
                onSelect={onTileSelectionChange}
                tileType={newSceneTile.type}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' className='mx-1' onClick={() => setShowPlayerGroup(true)}>
            Show Players
          </Button>
          <Button disabled={!sceneSelection} onClick={onSubmit}>
            Confirm Scene Tile Selection
          </Button>
        </Modal.Footer>
      </Modal>
      <PlayerGroupModal show={showPlayerGroup} onHide={() => setShowPlayerGroup(false)} />
    </>
  );
}

export default NewSceneTileModal;
