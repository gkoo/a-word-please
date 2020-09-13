import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button'
import CardDeck from 'react-bootstrap/CardDeck';

import ClueBadge from './ClueBadge';
import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import PlayerGroupModal from './PlayerGroupModal';
import PlayerGroupView from './PlayerGroupView';
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
  const [showPlayerGroup, setShowPlayerGroup] = useState(false);

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

      <div className='text-center my-3'>
        <Button variant='secondary' className='mx-1' onClick={() => setShowPlayerGroup(true)}>
          Show Other Players
        </Button>
        <Button className='mx-1' disabled={!selectedLocationTile && !selectedLocation} onClick={onSubmit}>
          Confirm Location of Crime
        </Button>
      </div>

      <PlayerGroupModal show={showPlayerGroup} onHide={() => setShowPlayerGroup(false)} />
    </>
  );
}

export default LocationView;
