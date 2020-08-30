import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import { socketSelector } from '../../store/selectors';

function RulesView() {
  const socket = useSelector(socketSelector);

  const onReady = () => socket.emit('handlePlayerAction', { action: 'readRules' });

  return (
    <div className='text-center'>
      <h1>Welcome to Deception: Murder in Palo Alto</h1>
      <p>One person will be forensic scientist.</p>
      <p>One person will be murderer.</p>
      <p>Everyone else investigators.</p>

      <Button onClick={onReady}>
        Ready?
      </Button>
    </div>
  );
}

export default RulesView;
