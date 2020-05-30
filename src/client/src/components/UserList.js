import React from 'react';

import Card from 'react-bootstrap/Card';

function PlayerList({ users }) {
  return (
    <Card style={{ height: '100%' }}>
      <Card.Body>
        {
          Object.values(users).map(user => {
            return user.name && (
              <div key={user.id}>
                {user.isLeader && '👑'} {user.name}
              </div>
            )
          })
        }
      </Card.Body>
    </Card>
  );
};

export default PlayerList;
