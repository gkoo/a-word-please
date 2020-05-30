import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import CluesView from './CluesView';
import {
  currPlayerIsGuesserSelector,
  guesserSelector,
  socketSelector,
} from '../store/selectors';

function DuplicatesModal({ show }) {
  const currPlayerIsGuesser = useSelector(currPlayerIsGuesserSelector);
  const guesser = useSelector(guesserSelector);
  const socket = useSelector(socketSelector);

  const onRevealClues = e => {
    e.preventDefault();
    socket.emit('revealClues');
  };

  return (
    <Modal show={show && !currPlayerIsGuesser} className='mt-5 duplicates-modal' animation={false}>
      <Modal.Body className='text-center'>
        <h3>Your clues</h3>
        <div>
          <CluesView redactDuplicates={false} />
        </div>
      </Modal.Body>
      <Button onClick={onRevealClues}>Show Clues To {guesser && guesser.name}</Button>
    </Modal>
  );
}

export default DuplicatesModal;
