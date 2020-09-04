import React from 'react';
import { useSelector } from 'react-redux';

import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import ClueBadge from './ClueBadge';

import {
  DECEPTION_ROLE_LABELS,
  ROLE_SCIENTIST,
} from '../../constants';
import {
  currPlayerSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function PlayerView({ player, showAccuseButtons, showRoles }) {
  const gameData = useSelector(gameDataSelector);
  const currPlayer = useSelector(currPlayerSelector);
  const socket = useSelector(socketSelector);

  const playerIsCurrPlayer = player.id === currPlayer?.id;
  const currPlayerIsScientist = currPlayer?.role === ROLE_SCIENTIST;
  const alreadyAccused = !!gameData.accuseLog[currPlayer?.id];

  const accusePlayer = () => socket.emit('playerAction', {
    action: 'accusePlayer',
    suspectId: player.id,
  });

  return (
    <Card className='deception-player-card my-1'>
      <Card.Body>
        <Card.Title>
          {player.name}
          {
            showRoles &&
              <>
                <br />
                <Badge variant='warning'>{DECEPTION_ROLE_LABELS[player.role]}</Badge>
              </>
          }
        </Card.Title>
        <strong>Murder Methods</strong>:{' '}
        {
          player.methodCards.map(card =>
            <h5>
              <ClueBadge type='method' label={card.label} />
            </h5>
          )
        }
        <strong>Key Evidence</strong>:{' '}
        {
          player.evidenceCards.map(card =>
            <h5>
              <ClueBadge type='evidence' label={card.label} />
            </h5>
          )
        }
      </Card.Body>
      {
        showAccuseButtons && !alreadyAccused && !currPlayerIsScientist && !playerIsCurrPlayer &&
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
