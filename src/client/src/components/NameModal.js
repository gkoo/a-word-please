import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';

import { saveName } from '../store/actions';
import { socketSelector } from '../store/selectors';

function NameModal({ show }) {
  const [name, setName] = useState('');
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
        <Modal.Title>Welcome to A Word, Please?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSave}>
          <Row>
            <Col xs={4}>
              <label>Please enter a name:</label>
            </Col>
            <Col>
              <input type='text' onChange={onNameChange} value={name} />
            </Col>
          </Row>
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
