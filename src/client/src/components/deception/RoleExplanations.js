import React from 'react';

import Table from 'react-bootstrap/Table';

import { Role, RoleLabels } from '../../constants/deception';

function RoleExplanations() {
  return (
    <>
      <Table>
        <tbody>
          <tr>
            <td>
              {RoleLabels[Role.Murderer]}
            </td>
            <td>
              In Deception, one person will play the role of the{' '}
              <span className='text-danger'><strong>murderer</strong></span>. The murderer has
              committed a gruesome murder (gasp!) and it is their job to elude suspicion from the
              investigators. The investigators do not know who the murderer is.
            </td>
          </tr>

          <tr>
            <td>
              {RoleLabels[Role.Scientist]}
            </td>
            <td>
              One person will play the role of the forensic scientist. This person acts as the game
              master and can only interact by giving clues in the form of Cause of Death, Location,
              and Scene tiles. The forensic scientist is not allowed to communicate in any other way
              with the investigators. This includes verbal communication, winks, and nods.
            </td>
          </tr>

          <tr>
            <td>{RoleLabels[Role.Accomplice]} <em>(optional)</em></td>
            <td>
              If you play with an accomplice, the murderer and the accomplice both know each other's
              identity from the start of the game, and the accomplice actively aids the murderer in
              their attempt to evade the law!
            </td>
          </tr>

          <tr>
            <td>{RoleLabels[Role.Witness]} <em>(optional)</em></td>
            <td>
              <p>
                If you play with a witness, the witness learns the identities of the murderer and the
                accomplice (if there is one), but not the means of murder or the key evidence.
              </p>
              <p>
                At the end of the game, if the murderer is caught, they have a chance to guess who the
                witness is. If the murderer guesses the witness correctly, the witness disappears and the
                murderer wins!
              </p>
            </td>
          </tr>

          <tr>
            <td>{RoleLabels[Role.Investigator]}s</td>
            <td>
              Everyone who isn't one of the special roles above is an investigator. Investigators try to
              catch the murderer. Good luck!
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}

export default RoleExplanations;
