import React from 'react';

import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';

function PlayerView({ player }) {
  const className = 'mx-1';

  return (
    <Card>
      <Card.Body>
        <h5>{player.name}</h5>
        <p>
          <strong>Murder Methods</strong>:{' '}
          {
            player.methodCards.map(card =>
              <Badge variant='danger' className={className}>
                {card.label}
              </Badge>
            )
          }
        </p>
        <p>
          <strong>Key Evidence</strong>:{' '}
          {
            player.evidenceCards.map(card =>
              <Badge variant='info' className={className}>
                {card.label}
              </Badge>
            )
          }
        </p>
      </Card.Body>
    </Card>
  );
}

export default PlayerView;
