import React from 'react';
import { useSelector } from 'react-redux';

import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import { ROLE_SCIENTIST } from '../../constants';
import {
  currPlayerSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function PlayerView({ player }) {
  const gameData = useSelector(gameDataSelector);
  const currPlayer = useSelector(currPlayerSelector);
  const socket = useSelector(socketSelector);

  const className = 'mx-1';

  const playerIsCurrPlayer = player.id === currPlayer.id;
  const currPlayerIsScientist = currPlayer.role === ROLE_SCIENTIST;
  const alreadyAccused = !!gameData.accuseLog[currPlayer.id];

  const accusePlayer = () => socket.emit('handlePlayerAction', {
    action: 'accusePlayer',
    suspectId: player.id,
  });

  return (
    <Card className='deception-player-card my-1'>
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
      {
        !alreadyAccused && !currPlayerIsScientist && !playerIsCurrPlayer &&
          <Card.Footer className='text-center'>
            <Button variant='danger' onClick={accusePlayer}>
              Accuse
            </Button>
          </Card.Footer>
      }
    </Card>
  );
}

export default PlayerView;
