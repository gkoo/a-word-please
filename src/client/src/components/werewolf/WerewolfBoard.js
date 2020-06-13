import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ChoosingRolesView from './ChoosingRolesView';
import GameplayView from './GameplayView';
import RolesModal from './RolesModal';
import { STATE_WW_CHOOSING_ROLES, } from '../../constants';
import * as selectors from '../../store/selectors';

function WerewolfBoard() {
  const gameState = useSelector(selectors.gameStateSelector);
  const showRolesModal = useSelector(selectors.showRolesModalSelector);

  return (
    <div className='board werewolf py-5'>
      <Row>
        <Col>
          {
            gameState === STATE_WW_CHOOSING_ROLES &&
              <ChoosingRolesView />
          }
          {
            gameState !== STATE_WW_CHOOSING_ROLES &&
              <GameplayView />
          }
        </Col>
      </Row>
      <RolesModal show={showRolesModal}/>
    </div>
  );
}

export default WerewolfBoard;
