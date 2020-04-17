import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import 'bootstrap/dist/css/bootstrap.min.css';

import MessageLog from './components/MessageLog';
import NameModal from './components/NameModal';
import {
  newPlayer,
  playerMessage,
} from './store/actions';

function App() {
  const socket = useSelector(state => state.socket);
  const name = useSelector(state => state.name);
  const players = useSelector(state => state.players);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('newPlayer', player => dispatch(newPlayer(player)));
    socket.on('playerMessage', message => dispatch(playerMessage(message)));
  });

  return (
    <>
      {
        name && (
          <p>Your name is {name}</p>
        )
      }
      <MessageLog/>
      <h3>Players</h3>
      <ul>
        {
          Object.values(players).map(
            playerData => <li>{playerData.name}</li>
          )
        }
      </ul>
      <NameModal show={!name} />
    </>
  );
}

export default App;
