import React from 'react';
import { useDispatch } from 'react-redux';

import Modal from 'react-bootstrap/Modal';
import { toggleReleaseNotesModal } from '../store/actions';

function ReleaseNotesModal({ show }) {
  const dispatch = useDispatch();
  const handleClose = () => show && dispatch(toggleReleaseNotesModal({ show: false }));

  return (
    <Modal show={show} onHide={handleClose} scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Release Notes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h3>Aug 29, 2020</h3>
        <ul>
          <li>
            Made reconnecting more seamless. Before, when you disconnected from the game, you had to
            refresh to rejoin the game. Now, you will automatically rejoin.
          </li>
          <li>
            Added alert notification for when you disconnect
          </li>
        </ul>

        <h3>Aug 15, 2020</h3>
        <ul>
          <li>Added Spectator option</li>
        </ul>

        <h3>Aug 9, 2020</h3>
        <ul>
          <li>Added "Back to lobby" button for game end view</li>
          <li>Added "Release notes" section</li>
        </ul>
      </Modal.Body>
    </Modal>
  );
}

export default ReleaseNotesModal;
