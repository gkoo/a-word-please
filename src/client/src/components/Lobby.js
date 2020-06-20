import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

import LeaderPanel from './LeaderPanel';
import UserList from './UserList';
import { toggleRulesModal } from '../store/actions';
import { selectedGameSelector, socketSelector } from '../store/selectors';
import { GAME_A_WORD_PLEASE, GAME_WEREWOLF } from '../constants';

function Lobby({ messages, roomCode, users }) {
  const dispatch = useDispatch();

  const onShowRulesModal = () => dispatch(toggleRulesModal({ show: true }));
  const socket = useSelector(socketSelector);
  const selectedGame = useSelector(selectedGameSelector);

  const onChooseGame = (gameId) => {
    socket.emit('chooseGame', gameId);
  };

  return (
    <>
      <Container className="lobby-container">
        <Row>
          <Col className='lobby-title'>
            <h5>room code</h5>
            <h1 className='room-code'>{roomCode}</h1>
          </Col>
        </Row>
        <Row className='my-3'>
          <Col xs={6} md={{ offset: 2, span: 8 }} className='text-center'>
            <h3>Choose a game</h3>
            <Button
              variant='outline-info'
              size='lg'
              active={selectedGame === GAME_A_WORD_PLEASE}
              onClick={() => onChooseGame(GAME_A_WORD_PLEASE)}
              className='mr-2'
            >
              <span role='img' aria-label='A Word, Please?' className='mr-2'>📝</span>
              A Word, Please?
            </Button>
            <Button
              variant='outline-info'
              size='lg'
              active={selectedGame === GAME_WEREWOLF}
              onClick={() => onChooseGame(GAME_WEREWOLF)}
            >
              <span role='img' aria-label='Werewolf' className='mr-2'>🐺</span>
              Werewolf
            </Button>
          </Col>
        </Row>
        {
          selectedGame &&
            <div className='my-3'>
              <Row>
                <Col className='text-center'>
                  <Button variant='link' onClick={onShowRulesModal}>How to play</Button>
                </Col>
              </Row>
              <Row>
                <Col className='text-center'>
                  <LeaderPanel numUsers={Object.keys(users).length}/>
                </Col>
              </Row>
            </div>
        }
        <Row>
          <Col xs={{ span: 6, offset: 3 }}>
            <UserList users={users} />
          </Col>
        </Row>
        <Row className='share-link'>
          <Col xs={{ offset: 3, span: 6 }}>
            Share this link and invite your friends!
            <Form.Control value={window.location.href} disabled />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Lobby;
