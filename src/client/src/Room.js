import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import Game from './components/Game';
import Layout from './Layout';
import Lobby from './components/Lobby';
import NameModal from './components/NameModal';
import { API_BASE_URL, ROOM_STATE_LOBBY } from './constants';
import * as actions from './store/actions';
import * as selectors from './store/selectors';
import { env } from './constants';

import './bootstrap.min.css';
import './game.css';

const pingHealthEndpoint = () => window.fetch(`${API_BASE_URL}/health`).then(resp => {});

function Room() {
  const dispatch = useDispatch();
  const gameState = useSelector(selectors.gameStateSelector);
  const roomState = useSelector(selectors.roomStateSelector);
  const name = useSelector(selectors.nameSelector);
  const currUserIsSpectator = useSelector(selectors.currUserIsSpectatorSelector);
  const socket = useSelector(selectors.socketSelector);
  const socketConnected = useSelector(selectors.socketConnectedSelector);
  const connectedUsers = useSelector(selectors.connectedUsersSelector);
  const [pingInterval, setPingInterval] = useState();

  const roomCodeParam = useParams().roomCode;

  const ROOM_CODE_PREFIX = 'room-';
  const socketIoRoomName = `${ROOM_CODE_PREFIX}${roomCodeParam}`;

  useEffect(() => {
    // We open the socket every time we join a room and close the socket when we leave (go back to
    // homepage). This is so that when we leave, the server doesn't mistake us for still being part
    // of any game.
    if (!socket) {
      dispatch(actions.newSocket());
      return;
    }

    if (!socketConnected) {
      dispatch(actions.connectSocket());
      return;
    }

    socket.emit('joinRoom', socketIoRoomName);
    dispatch(actions.setRoomCode(roomCodeParam));
    return () => dispatch(actions.setRoomCode(null));
  }, [socket, dispatch, socketConnected, socketIoRoomName]);

  useEffect(() => {
    if (!socket) { return; }

    socket.on('debugInfo', data => dispatch(actions.receiveDebugInfo(data)));
    socket.on(
      'disconnect',
      () => dispatch(actions.newAlert({ message: 'You have disconnected', type: 'danger' })),
    );
    socket.on('endGame', winnerIds => dispatch(actions.endGame(winnerIds)));
    socket.on('roomData', data => dispatch(actions.receiveRoomData(data)));
    socket.on('gameData', gameData => dispatch(actions.receiveGameData(gameData)));
    socket.on('newUser', user => dispatch(actions.newUser(user)));
    socket.on('spectrumGuessUpdate', guessData => dispatch(actions.updateSpectrumGuess(guessData)));
    socket.on('userId', id => dispatch(actions.receiveUserId(id)));
    socket.on('userDisconnect', userId => dispatch(actions.userDisconnect(userId)));

    return () => {
      socket.removeAllListeners('debugInfo');
      socket.removeAllListeners('disconnect');
      socket.removeAllListeners('endGame');
      socket.removeAllListeners('roomData');
      socket.removeAllListeners('gameData');
      socket.removeAllListeners('newUser');
      socket.removeAllListeners('spectrumGuessUpdate');
      socket.removeAllListeners('userId');
      socket.removeAllListeners('userDisconnect');
    };
  }, [socket, dispatch]);

  // Attempt to rejoin room when reconnecting
  useEffect(() => {
    if (!socket) { return; }

    socket.on('reconnect', () => {
      const originalSocketId = window.localStorage.getItem('socketId');
      dispatch(actions.newAlert({ message: 'You have reconnected', type: 'success' }));
      socket.emit(
        'reconnect-room',
        {
          originalSocketId,
          name,
          isSpectator: currUserIsSpectator,
          roomCode: socketIoRoomName,
        },
      )
    });

    return () => {
      socket.removeAllListeners('reconnect');
    };
  }, [socket, dispatch, name, currUserIsSpectator, socketIoRoomName]);

  useEffect(() => {
    // Keep the server alive!
    if (env === 'production') {
      setPingInterval(window.setInterval(pingHealthEndpoint, 60000));
      return () => { console.log('clearing ping interval'); window.clearInterval(pingInterval); };
    }
  }, []);

  return (
    <Layout>
      {
        (gameState === null || gameState === undefined) && <div />
      }
      {
        roomState === ROOM_STATE_LOBBY &&
          <Lobby roomCode={roomCodeParam} users={connectedUsers} />
      }
      {
        roomState !== ROOM_STATE_LOBBY &&
          <Game socket={socket} />
      }
      <NameModal show={!name} />
    </Layout>
  );
}

export default Room;
