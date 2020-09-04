import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import { ROLE_ACCOMPLICE, ROLE_WITNESS } from '../../constants';
import {
  currPlayerSelector,
  currUserIsSpectatorSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function RulesView() {
  const currPlayer = useSelector(currPlayerSelector);
  const currUserIsSpectator = useSelector(currUserIsSpectatorSelector);
  const gameData = useSelector(gameDataSelector);
  const socket = useSelector(socketSelector);

  const { includeAccomplice, includeWitness, playersReady } = gameData;

  const onReady = () => {
    socket.emit('playerAction', { action: 'ready' });
  };

  const togglePlayWithWitness = () => {
    socket.emit('playerAction', {
      action: 'toggleRole',
      role: ROLE_WITNESS,
      shouldInclude: !includeWitness,
    });
  };

  const togglePlayWithAccomplice = () => {
    socket.emit('playerAction', {
      action: 'toggleRole',
      role: ROLE_ACCOMPLICE,
      shouldInclude: !includeAccomplice,
    });
  };

  return (
    <div>
      <h1>Welcome to Deception: Murder in Hong Kong</h1>
      <h3><u>Murderer</u></h3>
      <p>
        In Deception, one person will play the role of the murderer. The murderer has committed a
        gruesome murder (gasp!) and it is their job to elude suspicion from the investigators. The
        investigators do not know who the murderer is.
      </p>
      <h3><u>Forensic Scientist</u></h3>
      <p>
        One person will play the role of the forensic scientist. This person acts as the game master
        and can only interact by giving clues in the form of Cause of Death, Location, and
        Scene tiles. The forensic scientist is not allowed to communicate in any other way with the
        investigators. This includes verbal communication, winks, and nods.
      </p>
      <h3><u>Accomplice</u></h3>
      <p>
        If you play with an accomplice, the murderer and the accomplice both know each other's
        identity from the start of the game, and the accomplice actively aids the murderer in their
        attempt to evade the law!
      </p>
      <h3><u>Witness</u></h3>
      <p>
        If you play with a witness, the witness learns the identity of the murderer and the
        accomplice, but not the means of murder or the key evidence.
      </p>
      <p>
        At the end of the game, if the murderer is caught, they have a chance to guess who the
        witness is. If the murderer guesses the witness correctly, the witness disappears and the
        murderer wins!
      </p>
      <h3><u>Investigators</u></h3>
      <p>
        Everyone who isn't one of the special roles above is an investigator. Investigators try to
        catch the murderer.
      </p>

      <div className='text-center my-3'>
        <Button
          active={includeAccomplice}
          variant='outline-info'
          className='mx-3'
          onClick={() => togglePlayWithAccomplice()}
        >
          Play with Accomplice
        </Button>
        <Button
          active={includeWitness}
          variant='outline-info'
          onClick={() => togglePlayWithWitness()}
        >
          Play with Witness
        </Button>
      </div>

      <div className='text-center'>
        {
          !currUserIsSpectator && !playersReady[currPlayer?.id] &&
            <Button onClick={onReady}>
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
    </div>
  );
}

export default RulesView;
