import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import CardDeck from 'react-bootstrap/CardDeck';

import TileCard from './TileCard';
import {
  currPlayerSelector,
  currPlayerIsScientistSelector,
  gameDataSelector,
  murdererSelector,
  socketSelector,
} from '../../store/selectors';

function InitialTilesView() {
  const [sceneSelections, setSceneSelections] = useState({});
  const currPlayerIsScientist = useSelector(currPlayerIsScientistSelector);
  const gameData = useSelector(gameDataSelector);
  const murdererPlayer = useSelector(murdererSelector);
  const socket = useSelector(socketSelector);

  const onTileSelectionChange = (selection, tileId) => {
    setSceneSelections({
      ...sceneSelections,
      [tileId]: selection,
    });
  };

  const onSubmit = () => socket.emit('handlePlayerAction', {
    action: 'selectInitialSceneTiles',
    sceneSelections,
  });

  return (
    <>
      <h1>Hi Scientist</h1>
      <p>The murderer is: {murdererPlayer.name}</p>
      <p>The method of murder is: {gameData.murderMethod}</p>
      <p>The key evidence is: {gameData.keyEvidence}</p>
      <p>
        Choose values for the scene tiles that correspond to the method of murder and key evidence.
        Press OK when you are done.
      </p>

      <div className='text-center'>
        <Button
          disabled={Object.values(sceneSelections).length < gameData.sceneTiles.length}
          onClick={onSubmit}
        >
          OK
        </Button>
      </div>

      <CardDeck>
        {
          gameData.sceneTiles.map(tile =>
            <TileCard
              tileId={tile.id}
              label={tile.label}
              options={tile.options}
              onSelect={onTileSelectionChange}
            />
          )
        }
      </CardDeck>
    </>
  );
}

export default InitialTilesView;
