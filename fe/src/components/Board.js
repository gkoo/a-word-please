import React from 'react';
import { useSelector } from 'react-redux';

import { currPlayerHandSelector } from '../store/selectors';

function Board() {
  const currPlayerHand = useSelector(currPlayerHandSelector)
  return (
    <>
      <h1>Welcome to the Game!</h1>
      <div>
        <h2>Your Hand</h2>
        {
          currPlayerHand &&
            <ul>
              {currPlayerHand.map(card => <li>{card}</li>)}
            </ul>
        }
      </div>
    </>
  );
}

export default Board;
