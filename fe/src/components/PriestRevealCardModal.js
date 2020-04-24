import React from 'react';

import Modal from 'react-bootstrap/Modal';

import Card from './Card';

function PriestRevealCardModal({ priestRevealCard }) {
  return (
    <Modal show={!!priestRevealCard}>
      <Modal.Body className='reveal-modal-body'>
        <Card card={priestRevealCard} isDiscard={false} clickable={false} />
      </Modal.Body>
    </Modal>
  );
}

export default PriestRevealCardModal;
