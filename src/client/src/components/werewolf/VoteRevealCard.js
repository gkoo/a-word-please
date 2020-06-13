import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import Overlay from 'react-bootstrap/Overlay'
import Tooltip from 'react-bootstrap/Tooltip';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import RoleCard from './RoleCard';
import { playersSelector, votesSelector } from '../../store/selectors';

function VoteRevealCard({ player, revealingRoles }) {
  const target = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const players = useSelector(playersSelector);
  const votes = useSelector(votesSelector);
  const suspectId = votes[player.id];
  const suspect = players[suspectId];

  useEffect(() => {
    setShowOverlay(true);
  }, [showOverlay]);

  return (
    <>
      <RoleCard
        role={player.role}
        cardContent={<PlayerCheckboxLabel player={player}/>}
        revealingRole={revealingRoles}
        selected={true}
        refTarget={target}
        className='mb-5'
      />

      <Overlay
        target={target.current}
        show={showOverlay}
        placement='top'
      >
        {
          (props) =>
            <Tooltip className='suspect-label' {...props}>
              Vote: {suspect.name}
            </Tooltip>
        }
      </Overlay>
    </>
  );
}

export default VoteRevealCard;
