import React from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function AlertMessageModal({ alertMessage, onClose }) {
  return (
    <Modal show={!!alertMessage}>
      <Modal.Body>
        {alertMessage}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AlertMessageModal;
