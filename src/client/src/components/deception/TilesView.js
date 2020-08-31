import React from 'react';
import { useSelector } from 'react-redux';

import CardDeck from 'react-bootstrap/CardDeck';

import TileCard from './TileCard';
import {
  gameDataSelector,
} from '../../store/selectors';

function TilesView({ showHeaders }) {
  const gameData = useSelector(gameDataSelector);
  const { causeOfDeathTile, sceneTiles, selectedLocationTile } = gameData;

  return (
    <>
      {
        showHeaders &&
          <>
            <h3>Cause of Death and Location Tiles</h3>
            <p>
              The forensic scientist has provided information for the investigators below. Use this
              information to narrow down which player is most likely to be the murderer!
            </p>
          </>
      }
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

      {
        showHeaders &&
          <>
            <h3>Scene Tiles</h3>
            <p>
              At the end of each round, the forensic scientist will replace one scene tile with a new one
              to lead the investigators closer to catching the culprit.
            </p>
          </>
      }
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
