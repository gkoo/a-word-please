import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import RulesView from './RulesView';
import CauseOfDeathView from './CauseOfDeathView';
import ChooseMeansView from './ChooseMeansView';
import DeliberationView from './DeliberationView';
import GameEndView from './GameEndView';
import InitialSceneTilesView from './InitialSceneTilesView';
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
  gameDataSelector,
  gameStateSelector,
  spectatorUsersSelector,
} from '../../store/selectors';

function DeceptionBoard() {
  const gameData = useSelector(gameDataSelector);
  const gameState = useSelector(gameStateSelector);
  const spectatorUsers = useSelector(spectatorUsersSelector);

  const { playersReady, players } = gameData;
  const showReadyCheckmarks = [
    STATE_DECEPTION_EXPLAIN_RULES,
    STATE_DECEPTION_SHOW_ROLES,
  ].includes(gameState);

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
      </Col>
    </Row>
  );
}

export default DeceptionBoard;
