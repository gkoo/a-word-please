import React, { useState } from 'react';

import Modal from 'react-bootstrap/Modal';

import PlayerGroupView from './PlayerGroupView';

function PlayerGroupModal({ show, onHide }) {
  return (
    <Modal className='deception-players-modal' show={show} onHide={onHide}>
      <Modal.Header closeButton>
      </Modal.Header>
      <Modal.Body>
        <PlayerGroupView showAccuseButtons={false} />
      </Modal.Body>
    </Modal>
  );
}

export default PlayerGroupModal;
