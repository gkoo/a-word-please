import React from 'react';
import { useSelector } from 'react-redux';

import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import ClueBadge from './ClueBadge';

import {
  DECEPTION_ROLE_LABELS,
  ROLE_ACCOMPLICE,
  ROLE_MURDERER,
  ROLE_SCIENTIST,
  ROLE_WITNESS,
  STATE_DECEPTION_REPLACE_SCENE,
} from '../../constants';
import {
  currPlayerSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function PlayerView({
  player,
  showAccuseButtons,
  showRoles,
}) {
  const gameData = useSelector(gameDataSelector);
  const currPlayer = useSelector(currPlayerSelector);
  const socket = useSelector(socketSelector);

  const playerIsCurrPlayer = player.id === currPlayer?.id;
  const currPlayerIsScientist = currPlayer?.role === ROLE_SCIENTIST;
  const alreadyAccused = !!gameData.accuseLog[currPlayer?.id];
  const { state } = gameData;

  const accusePlayer = () => socket.emit('playerAction', {
    action: 'accusePlayer',
    suspectId: player.id,
  });

  const canAccuse = (
    showAccuseButtons &&
    !alreadyAccused &&
    !currPlayerIsScientist &&
    !playerIsCurrPlayer
  );

  const showAccomplice = [
    ROLE_SCIENTIST,
    ROLE_ACCOMPLICE,
    ROLE_MURDERER,
    ROLE_WITNESS,
  ].includes(currPlayer?.role);
  const showMurderer = showAccomplice;
  const showWitness = [ROLE_SCIENTIST, ROLE_WITNESS].includes(currPlayer?.role);

  let showRole = showRoles;
  showRole = showRole || (player.role === ROLE_ACCOMPLICE && showAccomplice);
  showRole = showRole || (player.role === ROLE_MURDERER && showMurderer);
  showRole = showRole || (player.role === ROLE_WITNESS && showWitness);

  return (
    <Card className='deception-player-card my-1'>
      <Card.Body>
        <Card.Title>
          {player.name}
          {
            showRole &&
              <>
                <br />
                <Badge variant='warning'>{DECEPTION_ROLE_LABELS[player.role]}</Badge>
              </>
          }
        </Card.Title>
        <strong>Murder Methods</strong>:{' '}
        {
          player.methodCards.map(card =>
            <h5 key={card.label}>
              <ClueBadge type='method' label={card.label} />
            </h5>
          )
        }
        <strong>Key Evidence</strong>:{' '}
        {
          player.evidenceCards.map(card =>
            <h5 key={card.label}>
              <ClueBadge type='evidence' label={card.label} />
            </h5>
          )
        }
      </Card.Body>
      {
        canAccuse &&
          <Card.Footer className='text-center'>
            <Button
              variant='danger'
              onClick={accusePlayer}
              disabled={state === STATE_DECEPTION_REPLACE_SCENE}
            >
              Accuse
            </Button>
          </Card.Footer>
      }
    </Card>
  );
}

export default PlayerView;
