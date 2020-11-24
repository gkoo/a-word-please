import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';

import {
  Role,
  RoleLabels,
} from '../../constants/deception';
import {
  accompliceSelector,
  currPlayerSelector,
  currUserIsSpectatorSelector,
  gameDataSelector,
  murdererSelector,
  scientistSelector,
  socketSelector,
  witnessSelector,
} from '../../store/selectors';

function ShowRolesView() {
  const currPlayer = useSelector(currPlayerSelector);
  const currUserIsSpectator = useSelector(currUserIsSpectatorSelector);
  const accomplice = useSelector(accompliceSelector);
  const gameData = useSelector(gameDataSelector);
  const murderer = useSelector(murdererSelector);
  const scientist = useSelector(scientistSelector);
  const witness = useSelector(witnessSelector);
  const socket = useSelector(socketSelector);

  const { Scientist, Murderer, Investigator, Accomplice, Witness } = Role;

  const article = currPlayer?.role === Investigator ? 'an' : 'the';
  const { playersReady } = gameData;

  const acknowledgeRole = (evt) => {
    evt.preventDefault();
    socket.emit('playerAction', { action: 'ready' });
  };

  return (
    <>
      {
        !currUserIsSpectator &&
          <h1>You are {article} {RoleLabels[currPlayer?.role]}!</h1>
      }
      {
        currUserIsSpectator &&
          <h1>You are a spectator!</h1>
      }
      <CardGroup className='mt-3'>
        {
          currPlayer?.id !== scientist.id &&
            <Card>
              <Card.Body>
                <Card.Title>
                  {RoleLabels[Scientist]}
                </Card.Title>
                <Card.Text>{scientist.name}</Card.Text>
              </Card.Body>
            </Card>
        }
        {
          accomplice && [Scientist, Murderer, Witness].includes(currPlayer?.role) &&
            <Card>
              <Card.Body>
                <Card.Title>
                  {RoleLabels[Accomplice]}
                </Card.Title>
                <Card.Text>{accomplice.name}</Card.Text>
              </Card.Body>
            </Card>
        }
        {
          [Scientist, Accomplice, Witness].includes(currPlayer?.role) &&
            <Card>
              <Card.Body>
                <Card.Title>
                  {RoleLabels[Murderer]}
                </Card.Title>
                <Card.Text>
                  {murderer.name}
                </Card.Text>
              </Card.Body>
            </Card>
        }
        {
          witness && currPlayer?.role === Scientist &&
            <Card>
              <Card.Body>
                <Card.Title>
                  {RoleLabels[Witness]}
                </Card.Title>
                <Card.Text>
                  {witness.name}
                </Card.Text>
              </Card.Body>
            </Card>
        }
      </CardGroup>
      <div className='text-center my-5'>
        {
          !currUserIsSpectator && !playersReady[currPlayer?.id] &&
            <Button onClick={acknowledgeRole}>
              Ready?
            </Button>
        }
        {
          !currUserIsSpectator && playersReady[currPlayer?.id] &&
            <Button disabled>
              Waiting for others...
            </Button>
        }
      </div>
    </>
  );
}

export default ShowRolesView;
