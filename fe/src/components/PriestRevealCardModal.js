import React from 'react';

import Modal from 'react-bootstrap/Modal';

import Card from './Card';

function PriestRevealCardModal({ hasPriestRevealCard, priestRevealCard }) {
  return (
    <Modal show={hasPriestRevealCard}>
      <Modal.Body className='reveal-modal-body'>
        <Card card={priestRevealCard} isDiscard={false} clickable={false} />
      </Modal.Body>
    </Modal>
  );
}

export default PriestRevealCardModal;
