import React from 'react';
import { useSelector } from 'react-redux';

import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'

import TileCard from './TileCard';
import {
  gameDataSelector,
  scientistSelector,
} from '../../store/selectors';

function SceneTileReplacedModal({ show, onClose }) {
  const gameData = useSelector(gameDataSelector);
  const scientist = useSelector(scientistSelector);

  const { oldSceneTile, newSceneTile } = gameData;

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {scientist.name} replaced a scene tile!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table bordered>
          <thead>
            <tr>
              <th>Old Scene Tile</th>
              <th>New Scene Tile</th>
            </tr>
            <tr>
              <td>
                <TileCard
                  tileId={oldSceneTile.id}
                  label={oldSceneTile.label}
                  options={oldSceneTile.options}
                  tileType={oldSceneTile.type}
                  value={oldSceneTile.selectedOption}
                  disabled={true}
                />
              </td>
              <td>
                <TileCard
                  tileId={newSceneTile.id}
                  label={newSceneTile.label}
                  options={newSceneTile.options}
                  tileType={newSceneTile.type}
                  value={newSceneTile.selectedOption}
                  disabled={true}
                />
              </td>
            </tr>
          </thead>
        </Table>
      </Modal.Body>
    </Modal>
  );
}

export default SceneTileReplacedModal;
