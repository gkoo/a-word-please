import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Form from 'react-bootstrap/Form'

import { updateSpectrumGuess } from '../../store/actions';
import { clueSelector, socketSelector, spectrumGuessSelector } from '../../store/selectors';

function GuesserView() {
  const dispatch = useDispatch();
  const clue = useSelector(clueSelector);
  const socket = useSelector(socketSelector);
  const spectrumGuess = useSelector(spectrumGuessSelector);
  const [controlledSpectrumGuess, setControlledSpectrumGuess] = useState(spectrumGuess);

  useEffect(() => {
    if (spectrumGuess !== controlledSpectrumGuess) {
      setControlledSpectrumGuess(spectrumGuess);
    }
  }, [spectrumGuess, controlledSpectrumGuess]);

  const onChange = e => {
    const newGuess = e.target.value;
    dispatch(updateSpectrumGuess(newGuess));
    socket.emit('playerAction', {
      action: 'setSpectrumGuess',
      spectrumGuess: controlledSpectrumGuess,
    });
  };

  return (
    <>
      <h1>The clue is: {clue}</h1>
      <Form>
        <Form.Group controlId="spectrumGuess">
          <Form.Label>Guess</Form.Label>
          <Form.Control
            type="range"
            onChange={onChange}
            min={0}
            max={100}
            value={controlledSpectrumGuess}
          />
        </Form.Group>
      </Form>
    </>
  );
}

export default GuesserView;
