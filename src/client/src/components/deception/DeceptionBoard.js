import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

import RoleExplanations from './RoleExplanations';
import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import RulesView from './RulesView';
import CauseOfDeathView from './CauseOfDeathView';
import ChooseMeansView from './ChooseMeansView';
import DeliberationView from './DeliberationView';
import GameEndView from './GameEndView';
import InitialSceneTilesView from './InitialSceneTilesView';
import LeaderPanel from '../LeaderPanel';
import LocationView from './LocationView';
import ReplaceSceneView from './ReplaceSceneView';
import ShowRolesView from './ShowRolesView';
import SpectatorList from '../common/SpectatorList';
import { GameState } from '../../constants/deception';
import {
  updateUserPreference,
} from '../../store/actions';
import {
  connectedPlayersSelector,
  gameDataSelector,
  gameStateSelector,
  userPreferencesSelector,
  usersSelector,
} from '../../store/selectors';

function DeceptionBoard() {
  const dispatch = useDispatch();
  const [showRolesModal, setShowRolesModal] = useState(false);

  const {
    ExplainRules,
    ShowRoles,
    ChooseMeansEvidence,
    ScientistCauseOfDeath,
    ScientistLocation,
    ScientistSceneTiles,
    Deliberation,
    ReplaceScene,
    GameEnd,
  } = GameState;
  const connectedPlayers = useSelector(connectedPlayersSelector);
  const gameData = useSelector(gameDataSelector);
  const gameState = useSelector(gameStateSelector);
  const users = useSelector(usersSelector);
  const userPreferences = useSelector(userPreferencesSelector);

  const hideRulesPreferenceName = 'hideRules';
  const collapseTilesPreferenceName = 'collapseTiles';

  const { playersReady } = gameData;
  const showReadyCheckmarks = [
    ExplainRules,
    ShowRoles,
  ].includes(gameState);

  const changeHideRules = (evt) => {
    dispatch(updateUserPreference(hideRulesPreferenceName, evt.target.checked));
  };

  const changeCollapseTiles = (evt) => {
    dispatch(updateUserPreference(collapseTilesPreferenceName, evt.target.checked));
  };

  return (
    <>
      <Row>
        <Col sm={8} md={9} className='main-panel py-5'>
          {
            gameState === ExplainRules && <RulesView />
          }
          {
            gameState === ShowRoles && <ShowRolesView />
          }
          {
            gameState === ChooseMeansEvidence && <ChooseMeansView />
          }
          {
            gameState === ScientistCauseOfDeath && <CauseOfDeathView />
          }
          {
            gameState === ScientistLocation && <LocationView />
          }
          {
            gameState === ScientistSceneTiles && <InitialSceneTilesView />
          }
          {
            gameState === Deliberation && <DeliberationView />
          }
          {
            gameState === ReplaceScene && <ReplaceSceneView />
          }
          {
            gameState === GameEnd && <GameEndView />
          }
        </Col>
        <Col sm={4} md={3} className='main-panel text-center py-5'>
          <div className='mb-4'>
            <LeaderPanel numUsers={Object.keys(users).length}/>
          </div>

          <h3><u>Players</u></h3>
          {
            connectedPlayers.filter(player => player.connected).map(player =>
              <div key={player.id}>
                <PlayerCheckboxLabel
                  checked={showReadyCheckmarks && !!playersReady[player.id]}
                  player={player}
                />
              </div>
            )
          }
          <SpectatorList />

          <h3 className='mt-5'><u>Options</u></h3>
          <Form className='mt-3 mb-2'>
            <Form.Group
              controlId='collapseTiles'
              onChange={changeCollapseTiles}
              value={userPreferences[collapseTilesPreferenceName]}
            >
              <Form.Check type='checkbox' label="Collapse tiles" />
            </Form.Group>
            <Form.Group
              controlId='hideRules'
              onChange={changeHideRules}
              value={userPreferences[hideRulesPreferenceName]}
            >
              <Form.Check type='checkbox' label="Hide rules" />
            </Form.Group>
          </Form>
          <Button onClick={() => setShowRolesModal(true)}>
            Show Role Explanations
          </Button>
        </Col>
      </Row>
      <Modal show={showRolesModal} onHide={() => setShowRolesModal(false)}>
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>
          <RoleExplanations />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DeceptionBoard;
