import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import {
  DECEPTION_ROLE_LABELS,
  ROLE_ACCOMPLICE,
  ROLE_INVESTIGATOR,
  ROLE_MURDERER,
  ROLE_SCIENTIST,
  ROLE_WITNESS,
} from '../../constants';
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

  const article = currPlayer?.role === ROLE_INVESTIGATOR ? 'an' : 'the';
  const { playersReady } = gameData;

  const acknowledgeRole = (evt) => {
    evt.preventDefault();
    socket.emit('playerAction', { action: 'ready' });
  };

  return (
    <>
      {
        !currUserIsSpectator &&
          <h1>You are {article} {DECEPTION_ROLE_LABELS[currPlayer?.role]}!</h1>
      }
      {
        !currUserIsSpectator &&
          <h1>You are a spectator!</h1>
      }
      {
        currPlayer?.id !== scientist.id &&
          <p>{scientist.name} is the {DECEPTION_ROLE_LABELS[ROLE_SCIENTIST]}!</p>
      }
      {
        accomplice && [ROLE_SCIENTIST, ROLE_MURDERER, ROLE_WITNESS].includes(currPlayer?.role) &&
          <p>{accomplice.name} is the {DECEPTION_ROLE_LABELS[ROLE_ACCOMPLICE]}!</p>
      }
      {
        [ROLE_SCIENTIST, ROLE_ACCOMPLICE, ROLE_WITNESS].includes(currPlayer?.role) &&
          <p>{murderer.name} is the {DECEPTION_ROLE_LABELS[ROLE_MURDERER]}!</p>
      }
      {
        witness && currPlayer?.role === ROLE_SCIENTIST &&
          <p>{witness.name} is the {DECEPTION_ROLE_LABELS[ROLE_WITNESS]}!</p>
      }
      <div className='text-center'>
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
