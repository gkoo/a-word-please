import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import CardDeck from 'react-bootstrap/CardDeck';

import ClueBadge from './ClueBadge';
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
    socket.emit('playerAction', {
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
      <div className='text-center mb-2'>
        <p>
          Forensic Scientist: Choose a scene tile to replace. If a scene tile isn't
          particularly helpful, or perhaps it was leading the investigators astray, remove it
          and replace it with a new randomly drawn scene tile.
        </p>
        <p>
          The method of murder is:{' '}
          <ClueBadge label={gameData.murderMethod.label} type='method'/>
        </p>
        <p>
          The key evidence is:{' '}
          <ClueBadge label={gameData.keyEvidence.label} type='evidence'/>
        </p>

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
