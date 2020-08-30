import React from 'react';
import { useSelector } from 'react-redux';

import CardDeck from 'react-bootstrap/CardDeck';

import TileCard from './TileCard';
import {
  gameDataSelector,
  playersSelector,
} from '../../store/selectors';

function TilesView() {
  const gameData = useSelector(gameDataSelector);
  const { causeOfDeathTile, sceneTiles, selectedLocationTile } = gameData;

  return (
    <>
      <CardDeck>
        {/* Cause of Death */}
        <TileCard
          id={causeOfDeathTile.id}
          label={causeOfDeathTile.label}
          options={causeOfDeathTile.options}
          value={causeOfDeathTile.selectedOption}
          tileType={causeOfDeathTile.type}
          disabled={true}
        />
        {/* Location of Crime */}
        <TileCard
          id={selectedLocationTile.id}
          label={selectedLocationTile.label}
          options={selectedLocationTile.options}
          value={selectedLocationTile.selectedOption}
          tileType={selectedLocationTile.type}
          disabled={true}
        />
      </CardDeck>

      {/* Scene Tiles */}
      <CardDeck>
        {
          sceneTiles.map(sceneTile =>
            <TileCard
              id={sceneTile.id}
              label={sceneTile.label}
              options={sceneTile.options}
              value={sceneTile.selectedOption}
              tileType={sceneTile.type}
              disabled={true}
            />
          )
        }
      </CardDeck>
    </>
  );
}

export default TilesView;
