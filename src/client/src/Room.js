import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavBar from 'react-bootstrap/Navbar';

import AlertGroup from './components/AlertGroup';
import Game from './components/Game';
import Lobby from './components/Lobby';
import NameModal from './components/NameModal';
import RulesModal from './components/RulesModal';
import { STATE_PENDING } from './constants';
import * as actions from './store/actions';
import * as selectors from './store/selectors';

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
    <Game
      socket={socket}
      messages={messages}
    />
  );
};

function Room() {
  const dispatch = useDispatch();
  const gameState = useSelector(selectors.gameStateSelector);
  const messages = useSelector(selectors.messagesSelector);
  const name = useSelector(selectors.nameSelector);
  const showRulesModal = useSelector(selectors.showRulesModalSelector);
  const socket = useSelector(selectors.socketSelector);
  const socketConnected = useSelector(selectors.socketConnectedSelector);
  const users = useSelector(selectors.usersSelector);
  const history = useHistory();

  const roomCodeParam = useParams().roomCode;

  const onHideRulesModal = () => dispatch(actions.toggleRulesModal({ show: false }));
  const onShowRulesModal = () => dispatch(actions.toggleRulesModal({ show: true }));

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

  const navigateHome = (e) => { e.preventDefault(); history.push(`/`) };

  return (
    <Container>
      <NavBar variant='dark'>
        <Nav className="mr-auto">
          <NavBar.Brand onClick={navigateHome} href='/'>A Word, Please?</NavBar.Brand>
          <Nav.Link href="#" onClick={onShowRulesModal}>How to Play</Nav.Link>
        </Nav>
      </NavBar>
      <AlertGroup />
      {
        renderContent({ gameState, messages, roomCodeParam, socket, users })
      }
      <NameModal show={!name} />
      <RulesModal show={showRulesModal} onClose={onHideRulesModal} />
    </Container>
  );
}

export default Room;
