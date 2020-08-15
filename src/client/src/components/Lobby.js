import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';

import LeaderPanel from './LeaderPanel';
import UserList from './UserList';
import StartGameButton from './common/StartGameButton';
import { toggleRulesModal } from '../store/actions';
import { selectedGameSelector, socketSelector } from '../store/selectors';
import { GAME_A_WORD_PLEASE, GAME_WEREWOLF, GAME_WAVELENGTH } from '../constants';

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
          <Col xs={12} md={8} lg={{ offset: 1, span: 7 }} className='text-center'>
            <Card>
              <Card.Body>
                <Button
                  variant='outline-info'
                  size='lg'
                  active={selectedGame === GAME_A_WORD_PLEASE}
                  onClick={() => onChooseGame(GAME_A_WORD_PLEASE)}
                  className='mr-2'
                  block
                >
                  <span role='img' aria-label='A Word, Please?' className='mr-2'>📝</span>
                  A Word, Please?
                </Button>

                <Button
                  variant='outline-info'
                  size='lg'
                  active={selectedGame === GAME_WEREWOLF}
                  onClick={() => onChooseGame(GAME_WEREWOLF)}
                  block
                >
                  <span role='img' aria-label='Werewolf' className='mr-2'>🐺</span>
                  Werewolf
                </Button>

                <Button
                  variant='outline-info'
                  size='lg'
                  active={selectedGame === GAME_WAVELENGTH}
                  onClick={() => onChooseGame(GAME_WAVELENGTH)}
                  block
                >
                  <span role='img' aria-label='Wavelength' className='mr-2'>📻</span>
                  Wavelength
                </Button>

                {
                  !selectedGame &&
                    <h3 className='my-3'>Please choose a game</h3>
                }
                {
                  selectedGame &&
                    <div className='p-3'>
                      <Row>
                        <Col>
                          {
                            selectedGame === GAME_A_WORD_PLEASE &&
                              <>
                                <h2>A Word, Please?</h2>
                                <p>Work together to guess all of the words!</p>
                                <p>
                                  But make sure your clues aren't the same, or else they'll be hidden!
                                </p>
                              </>
                          }
                          {
                            selectedGame === GAME_WEREWOLF &&
                              <>
                                <h2>One Night Werewolf</h2>
                                <p>
                                  <em>
                                    You either die a Villager or live long enough to see yourself
                                    become a Werewolf...
                                  </em>
                                </p>
                              </>
                          }
                          {
                            selectedGame === GAME_WAVELENGTH &&
                              <>
                                <h2>Wavelength</h2>
                                <p>
                                  <em>Are you and your friends on the same wavelength?</em>
                                </p>
                              </>
                          }
                        </Col>
                      </Row>
                      <Row>
                        <Col className='text-center'>
                          <Button variant='link' onClick={onShowRulesModal}>How to play</Button>
                        </Col>
                      </Row>
                      <Row>
                        <Col className='text-center'>
                          <StartGameButton />
                        </Col>
                      </Row>
                    </div>
                }
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4} lg={3}>
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
