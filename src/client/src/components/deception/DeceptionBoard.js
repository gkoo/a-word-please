import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

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
import {
  GAME_STATE_GAME_END,
  STATE_DECEPTION_EXPLAIN_RULES,
  STATE_DECEPTION_SHOW_ROLES,
  STATE_DECEPTION_CHOOSE_MEANS_EVIDENCE,
  STATE_DECEPTION_WITNESSING,
  STATE_DECEPTION_SCIENTIST_CAUSE_OF_DEATH,
  STATE_DECEPTION_SCIENTIST_LOCATION,
  STATE_DECEPTION_SCIENTIST_SCENE_TILES,
  STATE_DECEPTION_DELIBERATION,
  STATE_DECEPTION_REPLACE_SCENE,
} from '../../constants';
import {
  updateUserPreference,
} from '../../store/actions';
import {
  gameDataSelector,
  gameStateSelector,
  spectatorUsersSelector,
  userPreferencesSelector,
  usersSelector,
} from '../../store/selectors';

function DeceptionBoard() {
  const dispatch = useDispatch();

  const gameData = useSelector(gameDataSelector);
  const gameState = useSelector(gameStateSelector);
  const spectatorUsers = useSelector(spectatorUsersSelector);
  const users = useSelector(usersSelector);
  const userPreferences = useSelector(userPreferencesSelector);

  const hideRulesPreferenceName = 'hideRules';
  const collapseTilesPreferenceName = 'collapseTiles';

  const { playersReady, players } = gameData;
  const showReadyCheckmarks = [
    STATE_DECEPTION_EXPLAIN_RULES,
    STATE_DECEPTION_SHOW_ROLES,
  ].includes(gameState);

  const changeHideRules = (evt) => {
    dispatch(updateUserPreference(hideRulesPreferenceName, evt.target.checked));
  };

  const changeCollapseTiles = (evt) => {
    dispatch(updateUserPreference(collapseTilesPreferenceName, evt.target.checked));
  };

  return (
    <Row>
      <Col sm={8} md={9} className='main-panel py-5'>
        {
          gameState === STATE_DECEPTION_EXPLAIN_RULES && <RulesView />
        }
        {
          gameState === STATE_DECEPTION_SHOW_ROLES && <ShowRolesView />
        }
        {
          gameState === STATE_DECEPTION_CHOOSE_MEANS_EVIDENCE && <ChooseMeansView />
        }
        {
          gameState === STATE_DECEPTION_SCIENTIST_CAUSE_OF_DEATH && <CauseOfDeathView />
        }
        {
          gameState === STATE_DECEPTION_SCIENTIST_LOCATION && <LocationView />
        }
        {
          gameState === STATE_DECEPTION_SCIENTIST_SCENE_TILES && <InitialSceneTilesView />
        }
        {
          gameState === STATE_DECEPTION_DELIBERATION && <DeliberationView />
        }
        {
          gameState === STATE_DECEPTION_REPLACE_SCENE && <ReplaceSceneView />
        }
        {
          gameState === GAME_STATE_GAME_END && <GameEndView />
        }
      </Col>
      <Col sm={4} md={3} className='main-panel text-center py-5'>
        <div className='mb-4'>
          <LeaderPanel numUsers={Object.keys(users).length}/>
        </div>

        <h3><u>Players</u></h3>
        {
          Object.values(players).filter(player => player.connected).map(player =>
            <div key={player.id}>
              <PlayerCheckboxLabel
                checked={showReadyCheckmarks && !!playersReady[player.id]}
                player={player}
              />
            </div>
          )
        }
        {
          !!spectatorUsers.length &&
            <>
              <h3 className='mt-5'><u>Spectators</u></h3>
              {
                spectatorUsers.map(spectatorUser =>
                  <div key={spectatorUser.id}>
                    <PlayerCheckboxLabel player={spectatorUser}/>
                  </div>
                )
              }
            </>
        }

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
      </Col>
    </Row>
  );
}

export default DeceptionBoard;
