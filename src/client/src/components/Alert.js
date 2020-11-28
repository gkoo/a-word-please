import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import Toast from 'react-bootstrap/Toast';
import { dismissAlert } from '../store/actions';

const DELAY = 5000;

function Alert({ id, message, type }) {
  const [isShowing, setIsShowing] = useState(true);
  const dispatch = useDispatch();

  const onClose = () => {
    setIsShowing(false);
    setTimeout(() => dispatch(dismissAlert(id)), 1000);
  };

  const bgClass = type === 'danger' ? 'bg-danger' : 'bg-info';

  // https://react-bootstrap.github.io/components/alerts/
  return (
    <Toast show={isShowing} autohide delay={DELAY} onClose={onClose} className={bgClass}>
      <Toast.Body>
        {message}
      </Toast.Body>
    </Toast>
  );
}

export default Alert;
