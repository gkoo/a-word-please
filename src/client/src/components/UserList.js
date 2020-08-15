import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup'

function UserList({ users }) {
  const userList = Object.values(users).filter(user => !!user.name);
  const spectators = userList.filter(user => user.isSpectator);
  const players = userList.filter(user => !user.isSpectator);

  if (userList.length === 0) {
    return <div/>;
  }

  return (
    <Card>
      <Card.Body>
        {
          !!players.length &&
            <>
              <h5>Players</h5>
              <ListGroup className='text-center'>
                {
                  players.map(
                    user => user.name && <ListGroup.Item key={user.id}>{user.name}</ListGroup.Item>
                  )
                }
              </ListGroup>
            </>
        }

        {
          !!spectators.length &&
            <>
              <h5>Spectators</h5>
              <ListGroup className='text-center'>
                {
                  spectators.map(
                    user => user.name && <ListGroup.Item key={user.id}>{user.name}</ListGroup.Item>
                  )
                }
              </ListGroup>
            </>
        }
      </Card.Body>
    </Card>
  );
};

export default UserList;
