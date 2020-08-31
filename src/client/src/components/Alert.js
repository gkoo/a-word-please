import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import BootstrapAlert from 'react-bootstrap/Alert'

import { dismissAlert } from '../store/actions';

const DELAY = 5000;

function Alert({ id, message, type }) {
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      dispatch(dismissAlert(id));
    }, DELAY);
  }, [id, dispatch]);

  return (
    <BootstrapAlert variant={type}>
      {message}
    </BootstrapAlert>
  );
}

export default Alert;
