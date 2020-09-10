import React from 'react';
import { useSelector } from 'react-redux';

import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import ClueBadge from './ClueBadge';

import {
  Role,
  RoleLabels,
  GameState,
} from '../../constants/deception';
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

  const { ReplaceScene } = GameState;
  const { Accomplice, Murderer, Scientist, Witness } = Role;
  const playerIsCurrPlayer = player.id === currPlayer?.id;
  const currPlayerIsScientist = currPlayer?.role === Scientist;
  const alreadyAccused = !!gameData.accuseLog[currPlayer?.id];
  const { state } = gameData;

  const accusePlayer = () => socket.emit('playerAction', {
    action: 'accusePlayer',
    suspectId: player.id,
  });

  const canAccuse = (
    currPlayer &&
    showAccuseButtons &&
    !alreadyAccused &&
    !currPlayerIsScientist &&
    !playerIsCurrPlayer
  );

  const showAccomplice = [
    Scientist,
    Accomplice,
    Murderer,
    Witness,
  ].includes(currPlayer?.role);
  const showMurderer = showAccomplice;
  const showWitness = [Scientist, Witness].includes(currPlayer?.role);

  let showRole = showRoles;
  showRole = showRole || (player.role === Accomplice && showAccomplice);
  showRole = showRole || (player.role === Murderer && showMurderer);
  showRole = showRole || (player.role === Witness && showWitness);

  return (
    <Card className='deception-player-card my-1'>
      <Card.Body>
        <Card.Title>
          {player.name}
          {
            showRole &&
              <>
                <br />
                <Badge variant='warning'>{RoleLabels[player.role]}</Badge>
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
              disabled={state === ReplaceScene}
            >
              Accuse
            </Button>
          </Card.Footer>
      }
    </Card>
  );
}

export default PlayerView;
