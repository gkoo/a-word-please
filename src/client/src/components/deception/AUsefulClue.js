import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import CardDeck from 'react-bootstrap/CardDeck';
import TileCard from './TileCard';
import {
  gameDataSelector,
} from '../../store/selectors';

function AUsefulClue() {
  const [tileIdToReplace, setTileIdToReplace] = useState(null);
  const [newSceneTileId, setNewSceneTileId] = useState(null);
  const gameData = useSelector(gameDataSelector);
  const { eventTileData, sceneTiles } = gameData;
  const { newSceneTile } = eventTileData;
  const eventSceneTiles = eventTileData.sceneTiles;

  return (
    <>
      <h3 className='text-center'>Replace one of these tiles...</h3>
      <CardDeck>
        {
          sceneTiles.map(sceneTile =>
            <TileCard
              tileId={sceneTile.id}
              key={sceneTile.id}
              border={sceneTile.id === tileIdToReplace ? 'danger' : ''}
              label={sceneTile.label}
              options={sceneTile.options}
              value={sceneTile.selectedOption}
              tileType={sceneTile.type}
              showClose={true}
              onClose={() => setTileIdToReplace(sceneTile.id)}
              disabled={true}
            />
          )
        }
      </CardDeck>

      <h3 className='text-center mt-3'>...with one of these tiles</h3>
      <CardDeck>
        {
          eventSceneTiles.map(sceneTile =>
            <>
              <TileCard
                tileId={sceneTile.id}
                key={sceneTile.id}
                border={sceneTile.id === newSceneTileId ? 'success' : ''}
                label={sceneTile.label}
                options={sceneTile.options}
                value={sceneTile.selectedOption}
                tileType={sceneTile.type}
                disabled={true}
                showChooseButton={true}
                onChoose={() => setNewSceneTileId(sceneTile.id)}
              />
            </>
          )
        }
      </CardDeck>
    </>
  );
}

export default AUsefulClue;
