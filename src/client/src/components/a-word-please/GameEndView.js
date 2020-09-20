import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import EndGameButtons from '../common/EndGameButtons';
import * as selectors from '../../store/selectors';

function GameEndView() {
  const socket = useSelector(selectors.socketSelector);
  const numPoints = useSelector(selectors.numPointsSelector);

  let message = '';

  switch (numPoints) {
    case 13:
      message = 'You are a true master of language and a champion of gamery!';
      break;
    case 12:
      message = 'Wowsers! It\'s hard to do better than 12!';
      break;
    case 11:
      message = 'Golly gee! It\'s almost like you\'ve played this before! (Have you?)';
      break;
    case 10:
      message = 'Awesome! This would be a perfect score, if it were out of 10.';
      break;
    case 9:
      message = 'Good job! Aim for 10 next time!';
      break;
    case 8:
    case 7:
      message = 'Hey, you did A-OK! I mean, you did okay.';
      break;
    case 6:
    case 5:
    case 4:
      message = 'Look on the bright side: it could have been worse.';
      break;
    case 3:
    case 2:
    case 1:
    case 0:
      message = 'Well... I hope you at least had fun.';
      break;
    default:
      message = 'You are so cool.';
  }

  return (
    <div className='text-center'>
      <h1>Game Over!</h1>
      <h2>Total Points: {numPoints}</h2>
      <p>{message}</p>
      <EndGameButtons/>
    </div>
  )
}

export default GameEndView;
