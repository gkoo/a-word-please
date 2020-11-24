import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';

import LobbyGameButton from './LobbyGameButton';
import StartGameButton from './common/StartGameButton';
import UserList from './UserList';
import { toggleRulesModal } from '../store/actions';
import { selectedGameSelector } from '../store/selectors';
import {
  GAME_A_WORD_PLEASE,
  GAME_DECEPTION,
  GAME_WEREWOLF,
  GAME_WAVELENGTH,
  GAME_SF_ARTIST,
  GAME_LABELS,
} from '../constants';

function Lobby({ messages, roomCode, users }) {
  const dispatch = useDispatch();

  const onShowRulesModal = () => dispatch(toggleRulesModal({ show: true }));
  const selectedGame = useSelector(selectedGameSelector);

  const startButtonDisabled = selectedGame === GAME_DECEPTION && users.length < 4;

  const startButtonHelpText = 'Requires at least 4 players';

  const allGameIds = [
    GAME_A_WORD_PLEASE,
    GAME_DECEPTION,
    GAME_WEREWOLF,
    GAME_WAVELENGTH,
    GAME_SF_ARTIST,
  ];

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
                <h3 className='my-3'>Please choose a game</h3>
                {
                  allGameIds.map(gameId =>
                    <LobbyGameButton
                      key={gameId}
                      gameId={gameId}
                      selected={selectedGame === gameId}
                    />
                  )
                }

                {
                  selectedGame &&
                    <div className='p-3'>
                      <Row>
                        <Col>
                          {
                            selectedGame === GAME_A_WORD_PLEASE &&
                              <>
                                <h2>{GAME_LABELS[GAME_A_WORD_PLEASE]}</h2>
                                <p>Work together to guess all of the words!</p>
                                <p>
                                  But make sure your clues aren't the same, or else they'll be hidden!
                                </p>
                              </>
                          }
                          {
                            selectedGame === GAME_WEREWOLF &&
                              <>
                                <h2>{GAME_LABELS[GAME_WEREWOLF]}</h2>
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
                                <h2>{GAME_LABELS[GAME_WAVELENGTH]}</h2>
                                <p>
                                  <em>Are you and your friends on the same wavelength?</em>
                                </p>
                              </>
                          }
                          {
                            selectedGame === GAME_DECEPTION &&
                              <>
                                <h2>{GAME_LABELS[GAME_DECEPTION]}</h2>
                                <p>
                                  <em>Analyze the evidence to find the murderer!</em>
                                </p>
                              </>
                          }
                          {
                            selectedGame === GAME_SF_ARTIST &&
                              <>
                                <h2>{GAME_LABELS[GAME_SF_ARTIST]}</h2>
                                <p>
                                  <em>Fake it til you make it!</em>
                                </p>
                              </>
                          }
                        </Col>
                      </Row>
                      {
                        [GAME_WAVELENGTH, GAME_A_WORD_PLEASE].includes(selectedGame) &&
                          <Row>
                            <Col className='text-center'>
                              <Button variant='link' onClick={onShowRulesModal}>How to play</Button>
                            </Col>
                          </Row>
                      }
                      <Row>
                        <Col className='text-center'>
                          {
                            startButtonDisabled && <p>{startButtonHelpText}</p>
                          }
                          <StartGameButton disabled={startButtonDisabled}/>
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
