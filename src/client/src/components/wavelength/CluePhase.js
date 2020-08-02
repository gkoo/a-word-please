import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button';

import Spectrum from './Spectrum';
import * as selectors from '../../store/selectors';

const MAX_CLUE_LENGTH = 100;

function CluePhase() {
  const [formClue, setFormClue] = useState('');
  const activePlayer = useSelector(selectors.activePlayerSelector);
  const currConcept = useSelector(selectors.currConceptSelector);
  const currPlayerIsActivePlayer = useSelector(selectors.currPlayerIsActivePlayerSelector);
  const socket = useSelector(selectors.socketSelector);

  const onEnterClue = e => {
    e.preventDefault();
    setFormClue(e.target.value.substring(0, MAX_CLUE_LENGTH));
  };

  const onSubmit = e => {
    e.preventDefault();
    socket.emit('playerAction', {
      action: 'submitClue',
      clue: formClue,
    });
  };

  if (!currPlayerIsActivePlayer) {
    return (
      <h1 className='text-center'>Waiting for {activePlayer.name} to enter a clue...</h1>
    );
  }

  return (
    <>
      <div className='mb-5'>
      <Spectrum showSlider={true} showBands={true} />
      </div>

      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <p>
            Enter a clue or phrase that will help your teammates guess the correct point on the spectrum
            from <em>{currConcept[0]}</em> to <em>{currConcept[1]}</em>.
          </p>
          <Form onSubmit={onSubmit}>
            <InputGroup>
              <Form.Control
                onChange={onEnterClue}
                placeholder="Enter a clue or phrase"
                type="text"
                value={formClue}
              />
              <Button type='submit'>Submit</Button>
            </InputGroup>
          </Form>
        </Col>
      </Row>
    </>
  );
}

export default CluePhase;
