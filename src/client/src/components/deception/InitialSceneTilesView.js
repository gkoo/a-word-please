import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import CardDeck from 'react-bootstrap/CardDeck';

import PlayerGroupView from './PlayerGroupView';
import TileCard from './TileCard';
import {
  currPlayerIsScientistSelector,
  gameDataSelector,
  murdererSelector,
  socketSelector,
} from '../../store/selectors';

function InitialTilesView() {
  const [sceneSelections, setSceneSelections] = useState({});
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

  const onSubmit = () => {
    socket.emit('playerAction', {
      action: 'selectInitialSceneTiles',
      sceneSelections,
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

      <div className='text-center'>
        <Button
          disabled={Object.values(sceneSelections).length < gameData.sceneTiles.length}
          onClick={onSubmit}
        >
          OK
        </Button>
      </div>
    </>
  );
}

export default InitialTilesView;
