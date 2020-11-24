import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import { socketSelector } from '../store/selectors';
import {
  GAME_A_WORD_PLEASE,
  GAME_WEREWOLF,
  GAME_WAVELENGTH,
  GAME_DECEPTION,
  GAME_SF_ARTIST,
  GAME_SHORT_LABELS
} from '../constants';

const emojiForGame = (gameId) => {
  switch (gameId) {
    case GAME_A_WORD_PLEASE:
      return '📝';
    case GAME_WEREWOLF:
      return '🐺';
    case GAME_WAVELENGTH:
      return '📻';
    case GAME_DECEPTION:
      return '🔪';
    case GAME_SF_ARTIST:
      return '🎨';
    default:
      throw new Error('Unrecognized game id!');
  }
};

function LobbyGameButton({ gameId, selected }) {
  const socket = useSelector(socketSelector);

  const onChooseGame = (gameId) => socket.emit('chooseGame', gameId);

  return (
    <Button
      variant='outline-info'
      size='lg'
      active={selected}
      onClick={() => onChooseGame(gameId)}
      block
    >
      <span role='img' aria-label={GAME_SHORT_LABELS[gameId]} className='mr-2'>
        {emojiForGame(gameId)}
      </span>
      {GAME_SHORT_LABELS[gameId]}
    </Button>
  );
}

export default LobbyGameButton;
