import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import RobberView from './RobberView';
import SeerView from './SeerView';
import TroublemakerView from './TroublemakerView';
import { currPlayerSelector, playersSelector, socketSelector } from '../../store/selectors';
import { LABELS, ROLE_SEER, ROLE_TROUBLEMAKER, ROLE_ROBBER, ROLE_INSOMNIAC } from '../../constants';

function DoppelgangerView() {
  const [copyPlayerId, setCopyPlayerId] = useState(null);
  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);
  const otherPlayers = Object.values(players).filter(player => player.id !== currPlayer.id);
  const copyPlayer = copyPlayerId ? players[copyPlayerId] : null;

  const rolesWithFollowUpActions = [ROLE_SEER, ROLE_TROUBLEMAKER, ROLE_ROBBER];

  // If the copied role has a followup action, let the child component handle the endTurn message.
  const canEndTurn = copyPlayer && !rolesWithFollowUpActions.includes(copyPlayer.role);

  const choosePlayerToCopy = player => {
    setCopyPlayerId(player.id);
  };

  const renderPlayerButton = player => {
    return (
      <Button key={player.id} onClick={() => choosePlayerToCopy(player)}>{player.name}</Button>
    );
  };

  const renderFollowupAction = () => {
    switch (copyPlayer.role) {
      case ROLE_SEER:
        return <SeerView showWakeUp={false} />;
      case ROLE_TROUBLEMAKER:
        return <TroublemakerView showWakeUp={false} />;
      case ROLE_ROBBER:
        return <RobberView showWakeUp={false} />;
    }
  };

  const endTurn = () => {
    socket.emit('playerAction', { action: 'copyRole' });
  };

  return (
    <>
      <h1>Wake up.</h1>
      <p>
        You may choose to look at another player's role and become that role. The player you choose
        will still retain that role when your turn is over.
      </p>
      {
        !(copyPlayer) &&
          <ButtonGroup className='mr-2'>
            {otherPlayers.map(renderPlayerButton)}
          </ButtonGroup>
      }
      {
        copyPlayer &&
          <Row>
            <Col>
              You are now
              {copyPlayer.role === ROLE_INSOMNIAC ? ' an ' : ' a ' }
              <u>{LABELS[copyPlayer.role]}</u>.
            </Col>
          </Row>
      }
      {
        copyPlayer && !canEndTurn && renderFollowupAction()
      }
      {
        canEndTurn &&
          <Row className='text-center'>
            <Col><Button onClick={endTurn}>Go back to sleep</Button></Col>
          </Row>
      }
    </>
  );
}

export default DoppelgangerView;
