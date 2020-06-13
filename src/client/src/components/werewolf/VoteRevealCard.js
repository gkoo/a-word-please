import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import Overlay from 'react-bootstrap/Overlay'
import Tooltip from 'react-bootstrap/Tooltip';

import PlayerLabel from './PlayerLabel';
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
        cardContent={<PlayerLabel player={player}/>}
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
              {suspect.name}
            </Tooltip>
        }
      </Overlay>
    </>
  );
}

export default VoteRevealCard;
