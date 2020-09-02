import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button'
import CardDeck from 'react-bootstrap/CardDeck';

import TileCard from './TileCard';
import {
  currPlayerIsScientistSelector,
  gameDataSelector,
  murdererSelector,
  socketSelector,
} from '../../store/selectors';

function LocationView() {
  const [selectedLocationTile, setSelectedLocationTile] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const currPlayerIsScientist = useSelector(currPlayerIsScientistSelector);
  const gameData = useSelector(gameDataSelector);
  const murdererPlayer = useSelector(murdererSelector);
  const socket = useSelector(socketSelector);

  const onLocationChange = (location, tileId) => {
    setSelectedLocation(location);
    setSelectedLocationTile(tileId);
  };

  const onSubmit = () => {
    if (selectedLocationTile === null) {
      throw new Error('Tried to submit an empty location!');
    }

    socket.emit('playerAction', {
      action: 'selectLocation',
      locationTileId: selectedLocationTile,
      location: selectedLocation,
    });
  };

  if (!currPlayerIsScientist) {
    // TODO: should show everyone's clue cards here?
    return <h1>Waiting for the scientist to choose initial tiles...</h1>;
  }

  return (
    <>
      <h1>Hi Scientist</h1>
      <p>The murderer is: {murdererPlayer.name}</p>
      <p>The method of murder is: {gameData.murderMethod.label}</p>
      <p>The key evidence is: {gameData.keyEvidence.label}</p>
      <p>
        Choose a location based on the method of murder and key evidence. You can only choose one.
      </p>

      <CardDeck>
        {
          gameData.locationTiles.map(locationTile => {
            const disabled = !!selectedLocation && !!locationTile.options.every(
              option => option !== selectedLocation
            );

            return (
              <TileCard
                tileId={locationTile.id}
                tileType={locationTile.type}
                label={locationTile.label}
                options={locationTile.options}
                onSelect={onLocationChange}
                disabled={disabled}
              />
            )
          })
        }
      </CardDeck>

      <div className='text-center mt-3'>
        <Button disabled={!selectedLocationTile && !selectedLocation} onClick={onSubmit}>
          OK
        </Button>
      </div>
    </>
  );
}

export default LocationView;
