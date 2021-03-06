import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import RoleCard from './RoleCard';
import { currPlayerSelector, playersSelector, socketSelector, unclaimedRolesSelector } from '../../store/selectors';
import { WEREWOLF_ROLE_LABELS } from '../../constants/werewolf';

function SeerView() {
  const [revealedPlayerId, setRevealedPlayerId] = useState(null);
  const [revealedUnclaimedRoles, setRevealedUnclaimedRoles] = useState(null);
  const unclaimedRoles = useSelector(unclaimedRolesSelector);
  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);
  const otherPlayers = Object.values(players).filter(player => player.id !== currPlayer?.id);
  const revealedPlayer = revealedPlayerId ? players[revealedPlayerId] : null;

  const choosePlayerToReveal = player => {
    setRevealedPlayerId(player.id);
  };

  const revealTwoCards = () => {
    setRevealedUnclaimedRoles(unclaimedRoles.slice(0, 2));
  };

  const endTurn = () => {
    socket.emit('playerAction', { action: 'endTurn' });
  };

  const renderPlayerButton = player => {
    return (
      <Button key={player.id} onClick={() => choosePlayerToReveal(player)}>{player.name}</Button>
    );
  };

  return (
    <>
      <h1>Wake up.</h1>
      <p>
        You may choose to look at another player's role or choose to see
        two of the unclaimed role cards.
      </p>
      {
        !(revealedPlayer || revealedUnclaimedRoles) &&
          <>
            <ButtonGroup className='mr-2'>
              {otherPlayers.map(renderPlayerButton)}
            </ButtonGroup>
            <ButtonGroup>
              <Button onClick={revealTwoCards}>2 Unclaimed Roles</Button>
            </ButtonGroup>
          </>
      }
      {
        revealedPlayer &&
          <Row className='mb-3'>
            <Col>
              <PlayerCheckboxLabel player={revealedPlayer} />
              <RoleCard role={revealedPlayer.role}/>
            </Col>
          </Row>
      }
      {
        revealedUnclaimedRoles &&
          <Row>
            <Col>
              Two of the roles currently unclaimed are{' '}
              <u>{WEREWOLF_ROLE_LABELS[revealedUnclaimedRoles[0]]}</u> and{' '}
              <u>{WEREWOLF_ROLE_LABELS[revealedUnclaimedRoles[1]]}</u>.
            </Col>
          </Row>
      }
      {
        (revealedPlayer || revealedUnclaimedRoles) &&
          <Row className='text-center'>
            <Col><Button onClick={endTurn}>Go back to sleep</Button></Col>
          </Row>
      }
    </>
  );
}

export default SeerView;
