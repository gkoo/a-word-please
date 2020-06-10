import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ChoosingRolesView from './ChoosingRolesView';
import {
  STATE_WW_CHOOSING_ROLES,
  STATE_WW_NIGHTTIME_ACTIONS,
  STATE_WW_DAYTIME_ACTIONS,
  STATE_WW_VOTING,
} from '../../constants';
import * as selectors from '../../store/selectors';

function WerewolfBoard() {
  const gameState = useSelector(selectors.gameStateSelector);

  return (
    <div className='board py-5'>
      <Row>
        <Col>
          {
            gameState === STATE_WW_CHOOSING_ROLES &&
              <ChoosingRolesView />
          }
        </Col>
      </Row>
    </div>
  );
}

export default WerewolfBoard;
