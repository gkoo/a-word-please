import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { saveName } from '../store/actions';
import { socketSelector } from '../store/selectors';

function NameModal({ show }) {
  const [name, setName] = useState('Gordon');
  const socket = useSelector(socketSelector);
  const dispatch = useDispatch();

  const onNameChange = e => setName(e.target.value);

  const handleSave = (e) => {
    if (e) { e.preventDefault(); }
    socket.emit('saveName', name);
    dispatch(saveName(name));
  }

  return (
    <Modal show={show}>
      <Modal.Header>
        <Modal.Title>Please enter a name</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSave}>
          <label>Name:</label>
          {' '}
          <input type='text' onChange={onNameChange} value={name} />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default NameModal;
