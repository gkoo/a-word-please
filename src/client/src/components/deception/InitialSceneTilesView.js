import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import CardDeck from 'react-bootstrap/CardDeck';

import ClueBadge from './ClueBadge';
import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import PlayerGroupView from './PlayerGroupView';
import PlayerGroupModal from './PlayerGroupModal';
import TileCard from './TileCard';
import {
  currPlayerIsScientistSelector,
  gameDataSelector,
  murdererSelector,
  socketSelector,
} from '../../store/selectors';

function InitialTilesView() {
  const [sceneSelections, setSceneSelections] = useState({});
  const [showPlayerGroup, setShowPlayerGroup] = useState(false);

  const gameData = useSelector(gameDataSelector);
  const currPlayerIsScientist = useSelector(currPlayerIsScientistSelector);
  const murdererPlayer = useSelector(murdererSelector);
  const socket = useSelector(socketSelector);

  const onTileSelectionChange = (selection, tileId) => {
    setSceneSelections({
      ...sceneSelections,
      [tileId]: selection,
    });
  };

  const onGoBack = () => socket.emit('playerAction', { action: 'goBack' });

  const onSubmit = () => {
    socket.emit('playerAction', {
      action: 'selectInitialSceneTiles',
      sceneSelections,
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
      <p>
        Choose values for the scene tiles that correspond to the method of murder and key evidence.
        Press OK when you are done.
      </p>

      <CardDeck>
        {
          gameData.sceneTiles.map(tile =>
            <TileCard
              tileId={tile.id}
              tileType={tile.type}
              label={tile.label}
              options={tile.options}
              onSelect={onTileSelectionChange}
            />
          )
        }
      </CardDeck>

      <div className='text-center my-3'>
        <ButtonGroup>
          <Button variant='secondary' className='mx-1' onClick={() => onGoBack()}>
            Back
          </Button>
          <Button variant='secondary' className='mx-1' onClick={() => setShowPlayerGroup(true)}>
            Show Players
          </Button>
          <Button
            className='mx-1'
            disabled={Object.values(sceneSelections).length < gameData.sceneTiles.length}
            onClick={onSubmit}
          >
            Confirm Scene Tile Selections
          </Button>
        </ButtonGroup>
      </div>

      <PlayerGroupModal show={showPlayerGroup} onHide={() => setShowPlayerGroup(false)} />
    </>
  );
}

export default InitialTilesView;
