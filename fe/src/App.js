import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import 'bootstrap/dist/css/bootstrap.min.css';

import Board from './components/Board';
import MessageLog from './components/MessageLog';
import NameModal from './components/NameModal';
import PlayerList from './components/PlayerList';
import {
  newPlayer,
  playerMessage,
  receiveInitData,
} from './store/actions';

function App() {
  const socket = useSelector(state => state.socket);
  const name = useSelector(state => state.name);
  const players = useSelector(state => state.players);
  const dispatch = useDispatch();

  // Include second arg to prevent this from running multiple times
  useEffect(() => {
    socket.on('initData', data => dispatch(receiveInitData(data)));
    socket.on('newPlayer', player => dispatch(newPlayer(player)));
    socket.on('playerMessage', message => dispatch(playerMessage(message)));
  }, [socket, dispatch]);

  return (
    <>
      <Board />
      <MessageLog/>
      <PlayerList players={players} />
      <NameModal show={!name} />
    </>
  );
}

export default App;
