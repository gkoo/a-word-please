import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';

import { updateSpectrumGuess } from '../../store/actions';
import * as selectors from '../../store/selectors';

function GuesserView() {
  const dispatch = useDispatch();
  const clue = useSelector(selectors.clueSelector);
  const socket = useSelector(selectors.socketSelector);
  const spectrumGuess = useSelector(selectors.spectrumGuessSelector);
  const activePlayer = useSelector(selectors.activePlayerSelector);
  const currConcept = useSelector(selectors.currConceptSelector);
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

  const onSubmitGuess = e => {
    e.preventDefault();
    socket.emit('playerAction', { action: 'submitGuess' });
  };

  if (!clue) {
    return (
      <>
        <h1>Waiting for {activePlayer.name} to enter a clue...</h1>
      </>
    );
  }

  return (
    <>
      <div className='text-center mb-5'>
        <h2 className='spectrum-clue'>{clue}</h2>
      </div>
      <p>Adjust the slider to where you think this clue falls on the spectrum</p>
      <Form>
        <Form.Control
          type="range"
          onChange={onChange}
          min={0}
          max={180}
          value={controlledSpectrumGuess}
        />
      </Form>
      <Row className='mb-5'>
        <Col md={{ span: 6 }}>
          {currConcept[0]}
        </Col>
        <Col md={{ span: 6 }} className='text-right'>
          {currConcept[1]}
        </Col>
      </Row>
      <div className='text-center'>
        <Button type='submit' onClick={onSubmitGuess}>Enter guess</Button>
      </div>
    </>
  );
}

export default GuesserView;
