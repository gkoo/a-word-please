import React from 'react';
import { useDispatch } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

import LeaderPanel from './LeaderPanel';
import MessageLog from './MessageLog';
import UserList from './UserList';
import { toggleRulesModal } from '../store/actions';

function Lobby({ messages, roomCode, users, socket }) {
  const onNewChatMessage = msg => socket.emit('chatMessage', msg);
  const dispatch = useDispatch();

  const onShowRulesModal = () => dispatch(toggleRulesModal({ show: true }));

  return (
    <>
      <Container className="lobby-container">
        <Row>
          <Col className='lobby-title'>
            <h5>room code</h5>
            <h1 className='room-code'>{roomCode}</h1>
          </Col>
        </Row>
        <Row>
          <Col className='text-center'>
            <Button variant='link' onClick={onShowRulesModal}>How to play</Button>
          </Col>
        </Row>
        <Row className='mb-5'>
          <Col className='center'>
            <LeaderPanel numUsers={Object.keys(users).length}/>
          </Col>
        </Row>
        <Row>
          <Col xs={6} lg={{ offset: 3, span: 3 }}>
            <UserList users={users} />
          </Col>
          <Col xs={6} lg={{ span: 3 }}>
            <MessageLog
              messages={messages}
              onNewMessage={onNewChatMessage}
            />
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
