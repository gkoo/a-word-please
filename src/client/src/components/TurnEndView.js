import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

import CluesView from './CluesView';
import * as selectors from '../store/selectors';

function TurnEndView() {
  const currWord = useSelector(selectors.currWordSelector);
  const currGuess = useSelector(selectors.currGuessSelector);
  const guesser = useSelector(selectors.guesserSelector);
  const skippedTurn = useSelector(selectors.skippedTurnSelector);

  const isCorrectGuess = !!currGuess && currGuess.toLowerCase() === currWord.toLowerCase();

  const classes = cx('word-to-guess', {
    correct: isCorrectGuess,
    incorrect: !isCorrectGuess,
  });

  return (
    <div className='text-center'>
      <Row className='my-3'>
        <Col>
          <p>The word was</p>
          <h2 className='word-to-guess'>{currWord}</h2>
        </Col>
      </Row>
      <Row className='mb-5'>
        <Col>
          {
            skippedTurn &&
              <>
                <p>{guesser && guesser.name} skipped the turn.</p>
              </>
          }
          {
            !skippedTurn &&
              <>
                <p>{guesser && guesser.name} guessed</p>
                <h1 className={classes}>
                  {currGuess}
                </h1>
                {
                  !isCorrectGuess &&
                    <p>A turn has been taken away.</p>
                }
              </>
          }
        </Col>
      </Row>
      <CluesView largeView={true} />
    </div>
  );
}

export default TurnEndView;
