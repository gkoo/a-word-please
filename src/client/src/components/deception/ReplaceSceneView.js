import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import CardDeck from 'react-bootstrap/CardDeck';

import DeliberationView from './DeliberationView';
import NewSceneTileModal from './NewSceneTileModal';
import TileCard from './TileCard';
import {
  currPlayerIsScientistSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function ReplaceSceneView() {
  const [tileIdToReplace, setTileIdToReplace] = useState(null);

  const currPlayerIsScientist = useSelector(currPlayerIsScientistSelector);
  const gameData = useSelector(gameDataSelector);
  const socket = useSelector(socketSelector);

  const { sceneTiles } = gameData;

  const onReplace = (tileId) => {
    if (tileIdToReplace) { return; }

    setTileIdToReplace(tileId);
  };

  const onSubmit = (newSceneSelection) => {
    socket.emit('handlePlayerAction', {
      action: 'replaceSceneTile',
      newSceneSelection,
      tileIdToReplace,
    });
    setTileIdToReplace(null); // To close the modal
  };

  if (!currPlayerIsScientist) {
    return <DeliberationView />
  }

  return (
    <>
      <h1>Welcome to the Replace Scene View!</h1>
      <div className='text-center my-2'>
        {
          currPlayerIsScientist &&
            <>
              <p>
                Forensic Scientist: Choose a scene tile to replace.
              </p>
              <p>
                <Button
                  variant='link'
                >
                  {/* make this pop up a modal with the DeliberationView */}
                  View Board
                </Button>
              </p>
            </>
        }

        <CardDeck>
          {
            sceneTiles.map(sceneTile =>
              <TileCard
                tileId={sceneTile.id}
                key={sceneTile.id}
                label={sceneTile.label}
                options={sceneTile.options}
                value={sceneTile.selectedOption}
                tileType={sceneTile.type}
                showClose={true}
                onClose={onReplace}
                disabled={true}
              />
            )
          }
        </CardDeck>
      </div>
      <NewSceneTileModal show={!!tileIdToReplace} onClose={onSubmit} />
    </>
  );
}

export default ReplaceSceneView;
