import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './bootstrap.min.css';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import Board from './components/Board';
import LeaderPanel from './components/LeaderPanel';
import MessageLog from './components/MessageLog';
import NameModal from './components/NameModal';
import PlayerList from './components/PlayerList';
import {
  newPlayer,
  playerDisconnect,
  playerMessage,
  receiveDebugInfo,
  receiveGameData,
  receiveInitData,
  systemMessage,
} from './store/actions';
import { nameSelector, playersSelector, socketSelector } from './store/selectors';

function App() {
  const socket = useSelector(socketSelector);
  const name = useSelector(nameSelector);
  const players = useSelector(playersSelector);
  const dispatch = useDispatch();

  // Include second arg to prevent this from running multiple times
  useEffect(() => {
    socket.on('debugInfo', data => dispatch(receiveDebugInfo(data)));
    socket.on('initData', data => dispatch(receiveInitData(data)));
    socket.on('gameData', gameData => dispatch(receiveGameData(gameData)));
    socket.on('newPlayer', player => dispatch(newPlayer(player)));
    socket.on('playerMessage', message => dispatch(playerMessage(message)));
    socket.on('playerDisconnect', playerId => dispatch(playerDisconnect(playerId)));
    socket.on('systemMessage', message => dispatch(systemMessage(message)));
  }, [socket, dispatch]);

  return (
    <>
      <Container fluid>
        <Row>
          <Col>
            <Board />
          </Col>
          <Col>
            <LeaderPanel/>
            <PlayerList players={players} />
            <MessageLog/>
          </Col>
        </Row>
      </Container>
      <NameModal show={!name} />
    </>
  );
}

export default App;
