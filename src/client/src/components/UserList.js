import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup'

function UserList({ users }) {
  return (
    <Card>
      <Card.Body>
        <ListGroup className='text-center'>
          {
            Object.values(users).map(user =>
              user.name && <ListGroup.Item key={user.id}>{user.name}</ListGroup.Item>
            )
          }
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default UserList;
