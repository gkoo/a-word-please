import React from 'react';

import ReadyButton from '../common/ReadyButton';

function ExplainRules() {
  return (
    <>
      <p>
        When the game starts, each player except for one is shown a phrase to draw, and the category
        it belongs to. For example, the phrase could be "Burrito", and the category would be "Food".
        The lone player is the <em>Fake Artist</em> and they are only shown the category and not the
        phrase itself. Throughout the game, the <em>Fake Artist</em> must try to convince the others
        that they know the phrase.
      </p>

      <p>
        Players take turns drawing a contiguous stroke onto the canvas to prove that they are not
        the <em>Fake Artist</em>. After each player has had two turns, everyone votes on who they
        think is the <em>Fake Artist</em>. If the <em>Fake Artist</em> is caught, they can still win
        by guessing what the subject of the drawing was.
      </p>

      <ReadyButton className='mt-5'/>
    </>
  );
}

export default ExplainRules;
