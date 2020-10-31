import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'

import * as selectors from '../../store/selectors';
import { SPECTRUM_MAX_VALUE } from '../../constants';

function Spectrum({ disabled, value }) {

  const currConcept = useSelector(selectors.currConceptSelector);
  const socket = useSelector(selectors.socketSelector);

  const [controlledSpectrumGuess, setControlledSpectrumGuess] = useState(SPECTRUM_MAX_VALUE / 2);

  // Enable updates from props
  useEffect(() => {
    // Only allowed if the player isn't able to control the spectrum
    if (!disabled) { return; }

    if (value !== controlledSpectrumGuess) {
      setControlledSpectrumGuess(value);
    }
  }, [disabled, value, controlledSpectrumGuess]);

  const onChange = e => {
    const newGuess = e.target.value;
    setControlledSpectrumGuess(newGuess);
    socket.emit('playerAction', {
      action: 'setSpectrumGuess',
      spectrumGuess: controlledSpectrumGuess,
    });
  };

  return (
    <>
      <Form>
        <Form.Control
          type="range"
          onChange={onChange}
          min={0}
          max={SPECTRUM_MAX_VALUE}
          value={controlledSpectrumGuess}
          disabled={disabled}
        />
      </Form>
      <Row>
        <Col md={{ span: 6 }} className='text-left'>
          {currConcept[0]}
        </Col>
        <Col md={{ span: 6 }} className='text-right'>
          {currConcept[1]}
        </Col>
      </Row>
    </>
  );
}

export default Spectrum;
