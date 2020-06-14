import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import CardDeck from 'react-bootstrap/CardDeck';
import ListGroup from 'react-bootstrap/ListGroup'

import RoleCard from './RoleCard';
import {
  debugEnabledSelector,
  playersSelector,
  roleIdsSelector,
  socketSelector,
} from '../../store/selectors';
import {
  ROLE_WEREWOLF,
  ROLE_MINION,
  ROLE_MASON,
  ROLE_SEER,
  ROLE_ROBBER,
  ROLE_TROUBLEMAKER,
  ROLE_DRUNK,
  ROLE_INSOMNIAC,
  ROLE_HUNTER,
  ROLE_VILLAGER,
  ROLE_DOPPELGANGER,
  ROLE_TANNER,
} from '../../constants';

function ChoosingRolesView() {
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [ticking, setTicking] = useState(false);
  const [showFixedHeader, setShowFixedHeader] = useState(false);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);
  const roleIds = useSelector(roleIdsSelector);
  const debugEnabled = useSelector(debugEnabledSelector);
  const inlineInstructionsEl = useRef(null);

  const numPlayers = Object.keys(players).length;
  const numSelectedRoles = roleIds.length;
  const numRolesToChoose = numPlayers + 3;

  // Add the scroll event listener, and clean it up on unmount.
  useEffect(() => {
    const scrollListener = e => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!inlineInstructionsEl?.current) { return; }
          const inlineInstructionsTop = inlineInstructionsEl.current.offsetTop + 100; // hax
          if (window.scrollY > inlineInstructionsTop) {
            setShowFixedHeader(true);
          } else {
            setShowFixedHeader(false);
          }
          setTicking(false);
        });
        setTicking(true);
      }
    };

    window.addEventListener('scroll', scrollListener);

    // Clean up upon unmount.
    return () => window.removeEventListener('scroll', scrollListener);
  }, []);

  const debug = () => {
    socket.emit('debug');
  };

  const beginNighttime = () => {
    if (numRolesToChoose !== numSelectedRoles) {
      alert(`Please choose exactly ${numRolesToChoose} roles before continuing.`);
      return;
    }
    socket.emit('playerAction', { action: 'beginNighttime' });
  };

  const onToggleRole = toggledRoleId => {
    if (allRolesChosen() && !roleIds.includes(toggledRoleId)) {
      alert(
        'You\'ve selected all the required roles. Please remove a role before selecting a new one'
      );
      return;
    }
    if (toggledRoleId === ROLE_DOPPELGANGER) {
      alert('Please upgrade to premium to access the Doppelganger role by buying me a coffee.');
      return;
    }
    const roleIdIndex = roleIds.indexOf(toggledRoleId);
    let newRoleIds;
    if (roleIdIndex >= 0) {
      newRoleIds = roleIds.slice(0, roleIdIndex).concat(roleIds.slice(roleIdIndex+1));
    } else {
      newRoleIds = [...roleIds];
      newRoleIds.push(toggledRoleId);
    }

    socket.emit('playerAction', {
      action: 'setRoleSelection',
      roleIds: newRoleIds,
    });
  };

  const renderRoleCard = (id, role) => {
    const isSelected = roleIds.includes(id);

    if (showOnlySelected && !isSelected) {
      return;
    }

    return (
      <RoleCard
        id={id}
        role={role}
        chooseMode={true}
        callback={onToggleRole}
        includeTeam={true}
        selected={isSelected}
      />
    );
  };

  const renderInstructions = ({ domId }) => {
    return (
      <div id={domId}>
        <div className='my-3'>
          <Button onClick={beginNighttime} disabled={!allRolesChosen()}>Go to sleep</Button>
          {
            debugEnabled &&
              <Button onClick={debug}>Debug</Button>
          }
        </div>
        <p>{numPlayers} players. {numSelectedRoles}/{numRolesToChoose} roles selected.</p>

        {
          numRolesToChoose === numSelectedRoles &&
            <p>
              All set! When you go to sleep, each player will be assigned a role. Players
              with nighttime actions will be woken up one by one to perform those actions.
            </p>
        }

        <Form.Group controlId='show-selected' onChange={() => setShowOnlySelected(!showOnlySelected)}>
          <Form.Check type='checkbox' label='Show only selected roles'/>
        </Form.Group>
      </div>
    );
  };

  const allRolesChosen = () => numRolesToChoose === numSelectedRoles;

  return (
    <div>
      <Row className='mb-3 text-center'>
        <Col md={{ span: 8, offset: 2}} lg={{ span: 6, offset: 3 }}>
          <h1>Choose Roles</h1>

          <ListGroup className='mb-3'>
            {
              Object.values(players).map(player =>
                <ListGroup.Item key={player.id}>{player.name}</ListGroup.Item>
              )
            }
          </ListGroup>
          <div ref={inlineInstructionsEl}>
            {renderInstructions({ domId: 'instructions-inline' })}
          </div>
        </Col>
      </Row>

      <div className='gallery'>
        <CardDeck>
          {renderRoleCard('werewolf1', ROLE_WEREWOLF)}
          {renderRoleCard('werewolf2', ROLE_WEREWOLF)}
          {renderRoleCard('werewolf3', ROLE_WEREWOLF)}
          {renderRoleCard('minion', ROLE_MINION)}
          {renderRoleCard('tanner', ROLE_TANNER)}
          {renderRoleCard('mason1', ROLE_MASON)}
          {renderRoleCard('mason2', ROLE_MASON)}
          {renderRoleCard('seer', ROLE_SEER)}
          {renderRoleCard('robber', ROLE_ROBBER)}
          {renderRoleCard('troublemaker', ROLE_TROUBLEMAKER)}
          {renderRoleCard('drunk', ROLE_DRUNK)}
          {renderRoleCard('insomniac', ROLE_INSOMNIAC)}
          {renderRoleCard('hunter', ROLE_HUNTER)}
          {renderRoleCard('doppelganger', ROLE_DOPPELGANGER)}
          {renderRoleCard('villager1', ROLE_VILLAGER)}
          {renderRoleCard('villager2', ROLE_VILLAGER)}
          {renderRoleCard('villager3', ROLE_VILLAGER)}
        </CardDeck>
      </div>
      <div className={cx('fixed-header text-center', { show: showFixedHeader })}>
        <Container>
          <Row>
            <Col md={{ span: 8, offset: 2}} lg={{ span: 6, offset: 3 }}>
              {renderInstructions({ domId: 'instructions-fixed' })}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default ChoosingRolesView;
