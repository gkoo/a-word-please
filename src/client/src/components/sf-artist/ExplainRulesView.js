import React from 'react';

import ReadyButton from '../common/ReadyButton';

function ExplainRules() {
  return (
    <>
      <p>
        At the beginning of each game, each player enters a phrase to draw. When the game starts,
        one phrase is selected at random as the phrase to draw. Each player except one is shown
        the phrase to draw except for one. That player is the <em>Fake Artist</em> and must try to
        convince the others that they know the phrase.
      </p>
      <p>
        Players take turns drawing a contiguous stroke onto the canvas to prove that they are not
        the <em>Fake Artist</em>. After each player has drawn twice, the players vote on who is the
        <em>Fake Artist</em>. If the <em>Fake Artist</em> is caught, they can still win by guessing
        what the subject of the drawing was.
      </p>
      <ReadyButton/>
    </>
  );
}

export default ExplainRules;
