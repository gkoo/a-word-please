import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import RulesView from './RulesView';
import ChooseMeansView from './ChooseMeansView';
import {
  STATE_DECEPTION_EXPLAIN_RULES,
  STATE_DECEPTION_CHOOSE_MEANS_EVIDENCE,
  STATE_DECEPTION_WITNESSING,
  STATE_DECEPTION_SCIENTIST_INITIAL_TILES,
} from '../../constants';
import {
  gameDataSelector,
  gameStateSelector,
  socketSelector,
  spectatorUsersSelector,
} from '../../store/selectors';

function DeceptionBoard() {
  const gameData = useSelector(gameDataSelector);
  const gameState = useSelector(gameStateSelector);
  const spectatorUsers = useSelector(spectatorUsersSelector);

  const { playersReady, players } = gameData;
  const showReadyCheckmarks = gameState === STATE_DECEPTION_EXPLAIN_RULES;

  return (
    <Row>
      <Col sm={8} className='main-panel py-5'>
        {
          gameState === STATE_DECEPTION_EXPLAIN_RULES && <RulesView />
        }
        {
          gameState === STATE_DECEPTION_CHOOSE_MEANS_EVIDENCE && <ChooseMeansView />
        }
      </Col>
      <Col sm={4} className='main-panel text-center py-5'>
        <h3><u>Players</u></h3>
        {
          Object.values(players).map(player =>
            <>
              <PlayerCheckboxLabel
                checked={showReadyCheckmarks && !!playersReady[player.id]}
                player={player}
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
  );
}

export default DeceptionBoard;
