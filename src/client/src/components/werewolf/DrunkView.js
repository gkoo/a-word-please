import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import { socketSelector } from '../../store/selectors';
import { WEREWOLF_ROLE_LABELS, ROLE_DRUNK } from '../../constants';

function DrunkView() {
  const socket = useSelector(socketSelector);

  const endTurn = () => {
    socket.emit('playerAction', { action: 'endTurn' });
  };

  return (
    <>
      <p>{WEREWOLF_ROLE_LABELS[ROLE_DRUNK]}: Your role will now be switched with an unclaimed role.</p>
      <div className='text-center'>
        <Button onClick={endTurn}>OK</Button>
      </div>
    </>
  );
}

export default DrunkView;
