import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { LABELS, ROLE_DRUNK } from '../../constants';
import { socketSelector } from '../../store/selectors';

function DrunkView() {
  const socket = useSelector(socketSelector);

  const swapRoleWithUnclaimed = () => {
    socket.emit('playerAction', { action: 'swapRoleWithUnclaimed' });
  };

  return (
    <>
      <p>{LABELS[ROLE_DRUNK]}: Your role will be switched with an unclaimed role sometime during the night.</p>
      <p>You do not have any nighttime actions.</p>
    </>
  );
}

export default DrunkView;
