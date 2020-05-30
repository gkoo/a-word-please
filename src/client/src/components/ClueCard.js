import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import Overlay from 'react-bootstrap/Overlay'
import Tooltip from 'react-bootstrap/Tooltip';
import cx from 'classnames';

import { playersSelector } from '../store/selectors';

const renderClue = (clue, isDuplicate, isRedacted) => {
  if (!isRedacted) {
    return (
      <>
        {clue}
        {
          isDuplicate &&
            <span role='img' aria-label='duplicate-guess'>
              { ' ❌' }
            </span>
        }
      </>
    );
  }

  return (
    <div>
      <span role='img' aria-label='duplicate-guess'>🤐</span>
    </div>
  );
};

function ClueCard({ clueData, playerId, isRedacted }) {
  const target = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const players = useSelector(playersSelector);

  const player = players[playerId];

  useEffect(() => {
    setShowOverlay(true);
  }, [showOverlay]);

  return (
    <>
      <div ref={target} className={`player-label ${player.color}`}>
        {player.name}
      </div>
      <br />
      <Overlay target={target.current} show={showOverlay} placement="right">
        {
          (props) =>
            <Tooltip className={cx('clue-label', { duplicate: clueData.isDuplicate })} {...props}>
              {renderClue(clueData.clue, clueData.isDuplicate, isRedacted)}
            </Tooltip>
        }
      </Overlay>
    </>
  );
}

export default ClueCard;
