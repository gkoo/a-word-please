import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Button from 'react-bootstrap/Button'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'

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
  const [selectedRoleIdMap, setSelectedRoleIdMap] = useState({});
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);
  const roleIds = useSelector(roleIdsSelector);
  const debugEnabled = useSelector(debugEnabledSelector);

  const numPlayers = Object.keys(players).length;
  const numSelectedRoles = roleIds.length;
  const numRolesToChoose = numPlayers + 3;

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

  const onToggleRole = id => {
    if (allRolesChosen() && !roleIds.includes(id)) {
      alert(
        'You\'ve selected all the required roles. Please remove a role before selecting a new one'
      );
      return;
    }
    const selected = selectedRoleIdMap[id];
    const newRoleIdMap = {
      ...selectedRoleIdMap,
    };
    if (selectedRoleIdMap[id]) {
      delete newRoleIdMap[id];
    } else {
      newRoleIdMap[id] = true;
    }
    setSelectedRoleIdMap(newRoleIdMap);

    socket.emit('playerAction', {
      action: 'setRoleSelection',
      roleIds: Object.keys(newRoleIdMap),
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
        selected={isSelected}
      />
    );
  };

  const allRolesChosen = () => numRolesToChoose === numSelectedRoles;

  return (
    <div>
      <div>
        <Row className='mb-3 text-center'>
          <Col md={{ span: 8, offset: 2}} lg={{ span: 6, offset: 3 }}>
            <h1>Choose Roles</h1>

            <div className='my-5'>
              <Button onClick={beginNighttime} disabled={!allRolesChosen()}>Go to sleep</Button>
              {
                debugEnabled &&
                  <Button onClick={debug}>Debug</Button>
              }
            </div>

            <p>You have {numPlayers} players. Choose {numRolesToChoose} roles for this game.</p>
            {
              numSelectedRoles < numRolesToChoose &&
                <p>Please pick {numRolesToChoose - numSelectedRoles} more roles.</p>
            }

            <div className='text-left'>
              {
                numRolesToChoose === numSelectedRoles &&
                  <p>
                    All set! When you go to sleep, each player will be assigned a role. Players
                    with nighttime actions will be woken up one by one to perform those actions.
                  </p>
              }
            </div>

            <Form.Group controlId='show-selected' onChange={() => setShowOnlySelected(!showOnlySelected)}>
              <Form.Check type='checkbox' label='Show only selected roles'/>
            </Form.Group>
          </Col>
        </Row>

        <Row className='role-gallery'>
          {
            (!showOnlySelected || !!['werewolf1', 'werewolf2', 'werewolf3'].find(
              roleId => roleIds.includes(roleId)
            )) &&
              <div className='clearfix mr-5 my-3'>
                <h2>Team Werewolf</h2>
                {renderRoleCard('werewolf1', ROLE_WEREWOLF)}
                {renderRoleCard('werewolf2', ROLE_WEREWOLF)}
                {renderRoleCard('werewolf3', ROLE_WEREWOLF)}
                {renderRoleCard('minion', ROLE_MINION)}
              </div>
          }

          {
            (!showOnlySelected || roleIds.includes('tanner')) &&
              <div className='clearfix my-3'>
                <h2>Team Tanner</h2>
                {renderRoleCard('tanner', ROLE_TANNER)}
              </div>
          }

          {
            (!showOnlySelected || !![
              'mason1',
              'mason2',
              'seer',
              'robber',
              'troublemaker',
              'drunk',
              'insomniac',
              'hunter',
              'doppelganger',
              'villager1',
              'villager2',
              'villager3',
            ].find(roleId => roleIds.includes(roleId))) &&
              <div className='clearfix my-3'>
                <h2>Team Villagers</h2>
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
              </div>
          }
        </Row>
      </div>
    </div>
  );
}

export default ChoosingRolesView;
