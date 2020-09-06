import React from 'react';

function RoleExplanations() {
  return (
    <>
      <h3><u>Murderer</u></h3>
      <p>
        In Deception, one person will play the role of the{' '}
        <span className='text-danger'><strong>murderer</strong></span>. The murderer has committed a
        gruesome murder (gasp!) and it is their job to elude suspicion from the investigators. The
        investigators do not know who the murderer is.
      </p>
      <h3><u>Forensic Scientist</u></h3>
      <p>
        One person will play the role of the forensic scientist. This person acts as the game master
        and can only interact by giving clues in the form of Cause of Death, Location, and
        Scene tiles. The forensic scientist is not allowed to communicate in any other way with the
        investigators. This includes verbal communication, winks, and nods.
      </p>
      <h3><u>Accomplice (optional)</u></h3>
      <p>
        If you play with an accomplice, the murderer and the accomplice both know each other's
        identity from the start of the game, and the accomplice actively aids the murderer in their
        attempt to evade the law!
      </p>
      <h3><u>Witness (optional)</u></h3>
      <p>
        If you play with a witness, the witness learns the identities of the murderer and the
        accomplice (if there is one), but not the means of murder or the key evidence.
      </p>
      <p>
        At the end of the game, if the murderer is caught, they have a chance to guess who the
        witness is. If the murderer guesses the witness correctly, the witness disappears and the
        murderer wins!
      </p>
      <h3><u>Investigators</u></h3>
      <p>
        Everyone who isn't one of the special roles above is an investigator. Investigators try to
        catch the murderer. Good luck!
      </p>
    </>
  );
}

export default RoleExplanations;
