import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button';

import * as selectors from '../store/selectors';

const renderCurrWord = currWord => {
  return (
    <Row className='mb-5'>
      <Col className='text-center'>
        <h6>The word is:</h6>
        <h2 className='word-to-guess'>{currWord}</h2>
      </Col>
    </Row>
  );
};

const renderYourClue = clue => {
  return (
    <Row className='mt-4'>
      <Col className='text-center'>
        <h6>Your clue is:</h6>
        <h2 className='word-to-guess'>{clue}</h2>
      </Col>
    </Row>
  );
};

const MAX_CLUE_LENGTH = 20;

function EnteringCluesView({
  clues,
  clueGivers,
  currPlayer,
  currPlayerIsGuesser,
  currWord,
  guesser,
}) {
  const [clue, setClue] = useState('');
  const socket = useSelector(selectors.socketSelector);

  const onEnterClue = e => {
    e.preventDefault();
    setClue(e.target.value.substring(0, MAX_CLUE_LENGTH).replace(/\s/g, ''));
  };

  const onSubmit = e => {
    e.preventDefault();
    if (clue.toLowerCase() === currWord.toLowerCase()) {
      return;
    }
    socket.emit('submitClue', clue);
    setClue('');
  };

  const currPlayerClue = currPlayer && clues[currPlayer.id];

  if (currPlayerIsGuesser) {
    return (
      <Row className='text-center'>
        <Col>
          <h1>Waiting for clues...</h1>
        </Col>
      </Row>
    );
  }

  if (currPlayerClue) {
    return (
      <div className='text-center'>
        {renderCurrWord(currWord)}
        {renderYourClue(currPlayerClue.clue)}
        <h3 className='mt-3'>Waiting for others to enter their clues...</h3>
      </div>
    );
  }

  return (
    <>
      {renderCurrWord(currWord)}
      <Row>
        <Col sm={8} md={{ span: 6, offset: 3 }} className='text-center'>
          <Form onSubmit={onSubmit}>
            <InputGroup>
              <Form.Control
                onChange={onEnterClue}
                placeholder="Enter a one-word clue"
                type="text"
                value={clue}
              />
              <Button type='submit'>Submit</Button>
            </InputGroup>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col sm={{ span: 10, offset: 1 }}>
          <p className='help-text mt-3'>
            Think of a clue (one word only) that will help {guesser.name} guess the word!
            Make sure it's unique; if someone else chooses the same clue, it will not be shown
            to {guesser.name}.
          </p>
        </Col>
      </Row>
    </>
  );
}

export default EnteringCluesView;
