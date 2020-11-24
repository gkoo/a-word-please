import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup'
import Jumbotron from 'react-bootstrap/Jumbotron';
import Row from 'react-bootstrap/Row';

import Layout from './Layout';
import * as constants from './constants';
import {
  clearName,
  disconnectSocket,
  receiveGameData,
  setRoomCode,
} from './store/actions';
import { socketConnectedSelector } from './store/selectors';

import './bootstrap.min.css';

function Homepage() {
  const socketConnected = useSelector(socketConnectedSelector);
  const dispatch = useDispatch();

  const { routePrefix } = constants;
  const maxRoomCodeLength = 4;
  const history = useHistory();
  const [newRoomCode, setNewRoomCode] = useState('');
  const vowels = ['a', 'e', 'i', 'o', 'u'];

  let generatedRoomCode = '';
  for (let i = 0; i < maxRoomCodeLength; ++i) {
    let generatedChar;
    while (true) {
      const alphabetLength = 26;
      const charCode = Math.floor(Math.random() * alphabetLength);
      generatedChar = String.fromCharCode('a'.charCodeAt(0) + charCode);
      if (!vowels.includes(generatedChar)) { break; }
    }
    generatedRoomCode += generatedChar;
  }

  const onRoomCodeChange = (e) => {
    const code = e.target.value.toLowerCase();
    const lettersOnlyCode = code.replace(/[^a-z]/g, '').substring(0, 4);
    setNewRoomCode(lettersOnlyCode);
  };

  const joinRoom = () => {
    dispatch(receiveGameData({}));
    dispatch(clearName());
    dispatch(setRoomCode(newRoomCode));
    history.push(`${routePrefix}/rooms/${newRoomCode}`);
  };

  useEffect(() => {
    if (socketConnected) {
      dispatch(disconnectSocket());
    }
  }, [socketConnected, dispatch]);

  return (
    <Layout>
      <Container>
        <Row>
          <Col lg={{ offset: 1, span: 10 }} xl={{ offset: 2, span: 8 }}>
            <Jumbotron className='jumbotron'>
              <h1>Koo Fitness Club</h1>
              <p>Play games from a safe distance.</p>
              <h3>Games</h3>
              <p>
                <span role='img' aria-label='pencil icon' className='mr-2'>📝</span>
                {constants.GAME_LABELS[constants.GAME_A_WORD_PLEASE]}
              </p>
              <p>
                <span role='img' aria-label='werepig' className='mr-2'>🐺</span>
                {constants.GAME_LABELS[constants.GAME_WEREWOLF]}
              </p>
              <p>
                <span role='img' aria-label='wavelength' className='mr-2'>📻</span>
                {constants.GAME_LABELS[constants.GAME_WAVELENGTH]}
              </p>
              <p>
                <span role='img' aria-label='deception' className='mr-2'>🔪</span>
                {constants.GAME_LABELS[constants.GAME_DECEPTION]}
              </p>
              <p>
                <span role='img' aria-label='fake-artist' className='mr-2'>🎨</span>
                {constants.GAME_LABELS[constants.GAME_SF_ARTIST]}
              </p>
            </Jumbotron>
          </Col>
        </Row>
        <Row>
          <Col xs={5} lg={{ offset: 1, span: 5 }} xl={{ offset: 2, span: 4 }}>
            <Card>
              <Card.Body>
                <h5>Create a new room</h5>
                <Form.Group>
                <Link className='btn btn-primary' to={`${routePrefix}/rooms/${generatedRoomCode}`}>
                  Create a room
                </Link>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={7} lg={5} xl={4}>
            <Card>
              <Card.Body>
                <h5>Join a room</h5>
                <Form onSubmit={joinRoom}>
                  <Form.Group controlId='roomCode'>
                    <ButtonToolbar>
                      <InputGroup>
                        <Form.Control
                          placeholder='Room code'
                          value={newRoomCode}
                          onChange={onRoomCodeChange}
                        />
                      </InputGroup>
                      <ButtonGroup>
                        <Button variant='primary' type='submit'>
                          Join room
                        </Button>
                      </ButtonGroup>
                    </ButtonToolbar>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}

export default Homepage;
