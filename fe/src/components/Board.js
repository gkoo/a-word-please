import React from 'react';
import { useSelector } from 'react-redux';

import { activePlayerSelector, currPlayerHandSelector } from '../store/selectors';

function Board() {
  const currPlayerHand = useSelector(currPlayerHandSelector);
  const activePlayer = useSelector(activePlayerSelector);

  return (
    <>
      <div>
        {
          activePlayer &&
            <>
              <h3>Active Player</h3>
              <p>{activePlayer.name}</p>
            </>
        }
        <h3>Your Hand</h3>
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
