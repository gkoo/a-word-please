import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
  const currPlayer = useSelector(currPlayerSelector);
  const currPlayerIsScientist = currPlayer.role === ROLE_SCIENTIST;
  const gameData = useSelector(gameDataSelector);
  const murdererPlayer = useSelector(murdererSelector);
  const socket = useSelector(socketSelector);

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
        <h1 className='mb-5'>Waiting for the scientist to choose initial tiles...</h1>;
        <PlayerGroupView showAccuseButtons={false}/>
      </>
    )
  }

  return (
    <>
      <h1>Hi Scientist</h1>
      <p>The murderer is: {murdererPlayer.name}</p>
      <p>The method of murder is: {gameData.murderMethod.label}</p>
      <p>The key evidence is: {gameData.keyEvidence.label}</p>
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

      <div className='text-center mt-3'>
        <Button disabled={!selectedCauseOfDeath} onClick={onSubmit}>
          OK
        </Button>
      </div>
    </>
  );
}

export default CauseOfDeathView;
