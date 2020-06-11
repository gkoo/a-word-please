import React, { useEffect, useRef, useState } from 'react';

import Overlay from 'react-bootstrap/Overlay'
import Tooltip from 'react-bootstrap/Tooltip';

function VoteLabel({ voter, suspect }) {
  const target = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    setShowOverlay(true);
  }, [showOverlay]);

  return (
    <>
      <div>
        <div ref={target} className={`player-label text-center ${voter.color}`}>{voter.name}</div>
      </div>
      <Overlay target={target.current} show={showOverlay} placement="right">
        {
          (props) =>
            <Tooltip className='clue-label' {...props}>
              {suspect.name}
            </Tooltip>
        }
      </Overlay>
    </>
  );
}

export default VoteLabel;
