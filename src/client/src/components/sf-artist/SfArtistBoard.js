import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import DisplaySubjectView from './DisplaySubjectView';
import DrawingPhaseView from './DrawingPhaseView';
import EnterSubjectView from './EnterSubjectView';
import ExplainRulesView from './ExplainRulesView';
import LeaderPanel from '../LeaderPanel';
import ResultsView from './ResultsView';
import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import VotingPhaseView from './VotingPhaseView';
import SpectatorList from '../common/SpectatorList';
import { GameState } from '../../constants/sfArtist';
import {
  connectedPlayersSelector,
  gameDataSelector,
  gameStateSelector,
  usersSelector,
} from '../../store/selectors';

function SfArtistBoard() {
  const connectedPlayers = useSelector(connectedPlayersSelector);
  const gameData = useSelector(gameDataSelector);
  const gameState = useSelector(gameStateSelector);
  const users = useSelector(usersSelector);

  const { playersReady } = gameData;

  const {
    GameEnd,
    ExplainRules,
    EnterSubjectPhase,
    DisplaySubject,
    DrawingPhase,
    VotingPhase,
  } = GameState;

  const showReadyCheckmarks = [
    ExplainRules,
    EnterSubjectPhase,
    DisplaySubject,
    VotingPhase,
  ].includes(gameState);

  return (
    <>
      <Row>
        <Col sm={8} md={9} className='main-panel py-5'>
          <h3>A Fake Artist in San Francisco</h3>
          {
            gameState === ExplainRules && <ExplainRulesView />
          }
          {
            gameState === EnterSubjectPhase && <EnterSubjectView />
          }
          {
            gameState === DisplaySubject && <DisplaySubjectView />
          }
          {
            gameState === DrawingPhase && <DrawingPhaseView />
          }
          {
            gameState === VotingPhase && <VotingPhaseView />
          }
          {
            gameState === GameEnd && <ResultsView />
          }
        </Col>
        <Col sm={4} md={3} className='main-panel text-center py-5'>
          <div className='mb-4'>
            <LeaderPanel numUsers={Object.keys(users).length}/>
          </div>

          <h3><u>Players</u></h3>
          {
            connectedPlayers.filter(player => player.connected).map(player =>
              <div key={player.id}>
                <PlayerCheckboxLabel
                  checked={showReadyCheckmarks && !!playersReady[player.id]}
                  player={player}
                />
              </div>
            )
          }
          <SpectatorList />
        </Col>
      </Row>
    </>
  );
}

export default SfArtistBoard;
