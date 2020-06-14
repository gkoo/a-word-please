import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';

import Overlay from 'react-bootstrap/Overlay'
import Tooltip from 'react-bootstrap/Tooltip';

import { LABELS, ROLE_WEREWOLF, ROLE_TANNER, ROLE_VILLAGER } from '../../constants';

function VoteLabel({ voter, suspect, voterIsEliminated, revealingRoles, team }) {
  const target = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const roleLabelClass = cx({
    werewolf: team === ROLE_WEREWOLF,
    tanner: team === ROLE_TANNER,
    villager: team === ROLE_VILLAGER,
  });

  useEffect(() => {
    setShowOverlay(true);
  }, [showOverlay]);

  return (
    <>
      <div>
        <div
          ref={target}
          className={cx(
            `player-label text-center ${voter.color}`
          )}
        >
          <span role='img' aria-label='Eliminated player' className='mr-2'>
            {
              voterIsEliminated && '💀'
            }
          </span>
          {voter.name}
        </div>
      </div>
      <Overlay target={target.current} show={showOverlay} placement="right">
        {
          (props) =>
            <Tooltip className='clue-label' {...props}>
              {suspect.name}
            </Tooltip>
        }
      </Overlay>
      {
        revealingRoles &&
          <Overlay target={target.current} show={showOverlay} placement="left">
            {
              (props) =>
                <Tooltip className={`team-label ${roleLabelClass}`} {...props}>
                  {LABELS[voter.role]}
                </Tooltip>
            }
          </Overlay>
      }
    </>
  );
}

export default VoteLabel;
