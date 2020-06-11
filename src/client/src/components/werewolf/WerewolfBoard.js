import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ChoosingRolesView from './ChoosingRolesView';
import DaytimeView from './DaytimeView';
import NighttimeView from './NighttimeView';
import {
  STATE_WW_CHOOSING_ROLES,
  STATE_WW_NIGHTTIME,
  STATE_WW_DAYTIME,
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
          {
            gameState === STATE_WW_NIGHTTIME &&
              <NighttimeView />
          }
          {
            gameState === STATE_WW_DAYTIME &&
              <DaytimeView />
          }
        </Col>
      </Row>
    </div>
  );
}

export default WerewolfBoard;
