import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import Game from './components/Game';
import Layout from './Layout';
import Lobby from './components/Lobby';
import NameModal from './components/NameModal';
import { STATE_PENDING } from './constants';
import * as actions from './store/actions';
import * as selectors from './store/selectors';
import { env } from './constants';

import './bootstrap.min.css';
import './game.css';

const renderContent = ({
  gameState,
  messages,
  roomCodeParam,
  socket,
  users,
}) => {
  if (gameState === null || gameState === undefined) {
    return <div />;
  }
  if (gameState === STATE_PENDING) {
    return (
      <Lobby
        messages={messages}
        roomCode={roomCodeParam}
        socket={socket}
        users={users}
      />
    );
  }
  return (
    <Game socket={socket} messages={messages} />
  );
};

const pingHealthEndpoint = () => window.fetch('/health').then(resp => {});

function Room() {
  const dispatch = useDispatch();
  const gameState = useSelector(selectors.gameStateSelector);
  const messages = useSelector(selectors.messagesSelector);
  const name = useSelector(selectors.nameSelector);
  const socket = useSelector(selectors.socketSelector);
  const socketConnected = useSelector(selectors.socketConnectedSelector);
  const users = useSelector(selectors.usersSelector);
  const [pingInterval, setPingInterval] = useState();

  const roomCodeParam = useParams().roomCode;

  const ROOM_CODE_PREFIX = 'room-';

  useEffect(() => {
    // We open the socket every time we join a room and close the socket when we leave (go back to
    // homepage). This is so that when we leave, we don't continue to receive messages and the
    // server doesn't mistake us for still being part of any game.
    if (!socket) {
      dispatch(actions.newSocket());
      return;
    }

    if (!socketConnected) {
      dispatch(actions.connectSocket());
      return;
    }

    const socketIoRoomName = `${ROOM_CODE_PREFIX}${roomCodeParam}`;
    socket.emit('joinRoom', socketIoRoomName);
  }, [socket, dispatch, socketConnected, roomCodeParam]);

  useEffect(() => {
    if (!socket) { return; }

    socket.on('debugInfo', data => dispatch(actions.receiveDebugInfo(data)));
    socket.on('endGame', winnerIds => dispatch(actions.endGame(winnerIds)));
    socket.on('initData', data => dispatch(actions.receiveInitData(data)));
    socket.on('gameData', gameData => dispatch(actions.receiveGameData(gameData)));
    socket.on('newUser', user => dispatch(actions.newUser(user)));
    socket.on('userDisconnect', userId => dispatch(actions.userDisconnect(userId)));

    return () => {
      socket.removeAllListeners('debugInfo');
      socket.removeAllListeners('endGame');
      socket.removeAllListeners('initData');
      socket.removeAllListeners('gameData');
      socket.removeAllListeners('newUser');
      socket.removeAllListeners('userDisconnect');
    };
  }, [socket, dispatch]);

  useEffect(() => {
    // Keep the server alive!
    if (env === 'production') {
      console.log('setting ping interval');
      setPingInterval(window.setInterval(pingHealthEndpoint, 60000));
      return () => { console.log('clearing ping interval'); window.clearInterval(pingInterval); };
    }
  }, []);

  return (
    <Layout>
      {
        renderContent({ gameState, messages, roomCodeParam, socket, users })
      }
      <NameModal show={!name} />
    </Layout>
  );
}

export default Room;