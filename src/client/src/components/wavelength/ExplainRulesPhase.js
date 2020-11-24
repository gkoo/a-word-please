import React from 'react';

import ReadyButton from '../common/ReadyButton';

function ExplainRulesPhase() {
  return (
    <>
      <h5><u>How to Play</u></h5>

      <p>
        Each turn, one player assumes the role of the <em>psychic</em>. The psychic is shown
        a spectrum with two descriptors on each end of the spectrum. A value is also shown
        somewhere along the spectrum and the psychic chooses a word or phrase that describes
        that point on the spectrum, relative to the two descriptors.
      </p>

      <p>
        Once the psychic has entered their clue, the rest of the team tries to guess the
        point on the spectrum based on the clue.
      </p>

      <p>
        For example, if the spectrum is "Cold" to "Hot" with the position on the spectrum
        being near the "Hot" end, the psychic might write "The Sahara Desert" as a clue,
        hoping that their team will guess a spot on the spectrum closer to "Hot".
      </p>

      <ReadyButton />
    </>
  );
}

export default ExplainRulesPhase;
