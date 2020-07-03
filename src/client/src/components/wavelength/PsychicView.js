import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button';

import Spectrum from './Spectrum';
import * as selectors from '../../store/selectors';

const MAX_CLUE_LENGTH = 100;

function PsychicView() {
  const [formClue, setFormClue] = useState('');
  const clue = useSelector(selectors.clueSelector);
  const spectrumValue = useSelector(selectors.spectrumValueSelector);
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

  return (
    <>
      <Spectrum disabled={true} value={spectrumValue} />
      {
        !clue &&
          <Form onSubmit={onSubmit}>
            <h1 className='mb-4'>Enter a clue</h1>
            <InputGroup>
              <Form.Control
                onChange={onEnterClue}
                placeholder="Guess the word"
                type="text"
                value={formClue}
              />
              <Button type='submit'>Submit</Button>
            </InputGroup>
          </Form>
      }
      {
        clue &&
          <>
            <h1>Here's your clue</h1>
            <p>{clue}</p>
          </>
      }
    </>
  );
}

export default PsychicView;
