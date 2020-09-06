import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import ClueBadge from './ClueBadge';
import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import PlayerGroupModal from './PlayerGroupModal';
import PlayerGroupView from './PlayerGroupView';
import TileCard from './TileCard';
import {
  currPlayerSelector,
  gameDataSelector,
  murdererSelector,
  socketSelector,
} from '../../store/selectors';
import { ROLE_SCIENTIST } from '../../constants';

function CauseOfDeathView() {
  const [selectedCauseOfDeath, setSelectedCauseOfDeath] = useState(null);
  const [showPlayerGroup, setShowPlayerGroup] = useState(false);

  const currPlayer = useSelector(currPlayerSelector);
  const gameData = useSelector(gameDataSelector);
  const murdererPlayer = useSelector(murdererSelector);
  const socket = useSelector(socketSelector);

  const currPlayerIsScientist = currPlayer.role === ROLE_SCIENTIST;

  const { causeOfDeathTile } = gameData;

  const onCauseOfDeathChange = (causeOfDeath) => {
    setSelectedCauseOfDeath(causeOfDeath);
  };

  const onSubmit = () => {
    if (!selectedCauseOfDeath) {
      throw new Error('Tried to submit an empty cause of death!');
    }

    socket.emit('playerAction', {
      action: 'selectCauseOfDeath',
      causeOfDeath: selectedCauseOfDeath,
    });
  };

  if (!currPlayerIsScientist) {
    return (
      <>
        <h1 className='mb-5'>Waiting for the scientist to choose initial tiles...</h1>
        <PlayerGroupView showAccuseButtons={false}/>
      </>
    )
  }

  return (
    <>
      <h1>You are the Scientist!</h1>
      <p>The murderer is: <PlayerCheckboxLabel player={murdererPlayer}/></p>
      <p>The method of murder is: <ClueBadge label={gameData.murderMethod.label} type='method'/></p>
      <p>
        The key evidence is: <ClueBadge label={gameData.keyEvidence.label} type='evidence'/>
      </p>
      <p>Choose a cause of death based on the method of murder and key evidence.</p>

      <Row>
        <Col sm={{ offset: 2, span: 8 }} md={{ offset: 3, span: 6 }}>
          <TileCard
            tileId={causeOfDeathTile.id}
            label={causeOfDeathTile.label}
            options={causeOfDeathTile.options}
            onSelect={onCauseOfDeathChange}
            tileType={causeOfDeathTile.type}
          />
        </Col>
      </Row>

      <div className='text-center my-3'>
        <Button variant='secondary' className='mx-1' onClick={() => setShowPlayerGroup(true)}>
          Show Other Players
        </Button>
        <Button disabled={!selectedCauseOfDeath} className='mx-1' onClick={onSubmit}>
          Confirm Cause of Death
        </Button>
      </div>
      <PlayerGroupModal show={showPlayerGroup} onHide={() => setShowPlayerGroup(false)} />
    </>
  );
}

export default CauseOfDeathView;
