import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button';

import CluesView from './CluesView';
import * as selectors from '../store/selectors';

const MAX_GUESS_LENGTH = 20;

function EnteringGuessView({
  clues,
  clueGivers,
  currPlayerIsGuesser,
  currWord,
  guesser,
}) {
  const [guess, setGuess] = useState('');
  const socket = useSelector(selectors.socketSelector);

  const onEnterGuess = e => {
    e.preventDefault();
    setGuess(e.target.value.substring(0, MAX_GUESS_LENGTH).replace(/[^\w]/g, ''));
  };

  const onSubmit = e => {
    e.preventDefault();
    if (!currPlayerIsGuesser) { return; }
    socket.emit('submitGuess', guess);
    setGuess('');
  };

  const onSkipTurn = e => {
    e.preventDefault();
    if (!currPlayerIsGuesser) { return; }
    socket.emit('skipTurn');
  };

  return (
    <div className='text-center'>
      <Row>
        <Col className='mb-5'>
          <h1>Here are some clues:</h1>
          <CluesView redactDuplicates={true} />
        </Col>
      </Row>
      {
        currPlayerIsGuesser &&
          <>
            <Row className='my-3'>
              <Col
                sm={{ span: 10, offset: 1 }}
                md={{ span: 8, offset: 2 }}
                lg={{ span: 6, offset: 3 }}
              >
                <Form onSubmit={onSubmit}>
                  <h1 className='mb-4'>Enter a guess</h1>
                  <InputGroup>
                    <Form.Control
                      onChange={onEnterGuess}
                      placeholder="Guess the word"
                      type="text"
                      value={guess}
                    />
                    <Button type='submit'>Submit</Button>
                  </InputGroup>
                </Form>
              </Col>
            </Row>
            <Row className='mt-5'>
              <Col sm={{ span: 10, offset: 1}} md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
                <Button variant='outline-info' onClick={onSkipTurn}>
                  Skip Turn
                </Button>
                <p className='mt-2'>
                  If you skip, you won't get to win a point this round. But if you aren't sure about
                  your guess and you get it wrong, you will lose one more turn in addition to this turn.
                </p>
              </Col>
            </Row>
          </>
      }
      {
        !currPlayerIsGuesser &&
          <Row className='text-center'>
            <Col>
              <h1>{guesser && guesser.name} is entering a guess!</h1>
            </Col>
          </Row>
      }
    </div>
  );
}

export default EnteringGuessView;
