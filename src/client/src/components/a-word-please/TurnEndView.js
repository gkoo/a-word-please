import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

import CluesView from './CluesView';
import * as selectors from '../../store/selectors';

function TurnEndView() {
  const currWord = useSelector(selectors.currWordSelector);
  const currGuess = useSelector(selectors.currGuessSelector);
  const activePlayer = useSelector(selectors.activePlayerSelector);
  const skippedTurn = useSelector(selectors.skippedTurnSelector);

  const isCorrectGuess = !!currGuess && currGuess.toLowerCase() === currWord.toLowerCase();

  const classes = cx('featured-word', {
    correct: isCorrectGuess,
    incorrect: !isCorrectGuess,
  });

  return (
    <div className='text-center'>
      <Row className='my-3'>
        <Col>
          <p>The word was</p>
          <h2 className='featured-word lowercase'>{currWord}</h2>
        </Col>
      </Row>
      <Row className='mb-5'>
        <Col>
          {
            skippedTurn &&
              <>
                <p>{activePlayer && activePlayer.name} skipped the turn.</p>
              </>
          }
          {
            !skippedTurn &&
              <>
                <p>{activePlayer && activePlayer.name} guessed</p>
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
