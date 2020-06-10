import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'

import { playersSelector, socketSelector } from '../../store/selectors';

function ChoosingRolesView() {
  const [roles, setRoles] = useState({});
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);

  const getAllCheckedRoles = () => {
    return Object.keys(roles).filter(role => !!roles[role]);
  };

  const numPlayers = Object.keys(players).length;
  const numSelectedRoles = getAllCheckedRoles().length;
  const numRolesToChoose = numPlayers + 3;

  const startGame = () => {
    if (numRolesToChoose !== numSelectedRoles) {
      return;
    }
    socket.emit('selectRoles', getAllCheckedRoles());
  };

  const onChange = e => {
    setRoles({
      ...roles,
      [e.target.id]: e.target.checked,
    });
  };

  const renderRoleCheckbox = (id, label) => {
    return (
      <Form.Group controlId={id}>
        <Form.Check id={id} label={label} onChange={onChange}/>
      </Form.Group>
    );
  };

  const allRolesChosen = () => numRolesToChoose === numSelectedRoles;

  return (
    <div>
      <div className='text-center'>
        <Button onClick={startGame} disabled={!allRolesChosen()}>Go to sleep</Button>
      </div>
      <Form>
        {/* TODO: "You have n players. Choose n+3 roles to play with" */}
        <h1>Choose the roles you want to play with</h1>

        <Row>
          <Col xs={6}>
            <h2>Team Villagers</h2>
            {renderRoleCheckbox('mason1', 'Mason')}
            {renderRoleCheckbox('mason2', 'Mason')}
            {renderRoleCheckbox('seer', 'Seer')}
            {renderRoleCheckbox('robber', 'Robber')}
            {renderRoleCheckbox('troublemaker', 'Troublemaker')}
            {renderRoleCheckbox('drunk', 'Drunk')}
            {renderRoleCheckbox('insomniac', 'Insomniac')}
            {renderRoleCheckbox('hunter', 'Hunter')}
            {renderRoleCheckbox('villager1', 'Villager')}
            {renderRoleCheckbox('villager2', 'Villager')}
            {renderRoleCheckbox('villager3', 'Villager')}
            {renderRoleCheckbox('doppelganger', 'Doppelganger')}
          </Col>
          <Col xs={6}>
            <h2>Team Werewolf</h2>
            {renderRoleCheckbox('werewolf1', 'Werewolf')}
            {renderRoleCheckbox('werewolf2', 'Werewolf')}
            {renderRoleCheckbox('werewolf3', 'Werewolf')}

            <h2>Team Tanner</h2>
            {renderRoleCheckbox('tanner', 'Tanner')}
          </Col>
        </Row>

        <Row>
          <Col>
            <p>Number of roles selected: {numSelectedRoles}</p>
            <p>Number of players: {numPlayers}</p>
            {
              numRolesToChoose > numSelectedRoles &&
                <p>Please pick {numRolesToChoose - numSelectedRoles} more roles</p>
            }
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default ChoosingRolesView;
