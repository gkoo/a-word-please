import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import CardDeck from 'react-bootstrap/CardDeck'
import Modal from 'react-bootstrap/Modal'

import {
  currPlayerSelector,
  gameDataSelector,
  playersSelector,
} from '../../store/selectors';

function AccusePlayerModal({ show, onDetailsChange, onConfirmAccusation, endAccusation }) {
  const [selectedMurderMethod, setSelectedMurderMethod] = useState(null);
  const [selectedKeyEvidence, setSelectedKeyEvidence] = useState(null);

  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const gameData = useSelector(gameDataSelector);

  const { accuserId, accusationResult, suspectId, accusedMethod, accusedEvidence } = gameData;

  if (!accuserId || !suspectId) {
    return false;
  }

  const accuser = players[accuserId];
  const suspect = players[suspectId];
  const currPlayerIsAccuser = currPlayer?.id === accuserId;
  const showingResults = accusationResult !== undefined && accusationResult !== null;

  const onSelectDetail = (type, value) => {
    if (!currPlayerIsAccuser) { return; }
    if (showingResults) { return; }

    onDetailsChange(type, value);

    if (type === 'method') {
      setSelectedMurderMethod(value);
    }
    if (type === 'evidence') {
      setSelectedKeyEvidence(value);
    }
  };

  return (
    <Modal show={show}>
      <Modal.Header>
        <Modal.Title>
          {accuser.name} is accusing {suspect.name}!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {
          !showingResults && <p>{accuser.name}, please choose a murder method and key evidence.</p>
        }
        {
          showingResults &&
            <Alert variant={accusationResult ? 'success' : 'secondary'}>
              This guess was {accusationResult ? 'correct!' : 'incorrect.'}
            </Alert>
        }
        <CardDeck>
          <Card>
            <Card.Body>
              <h4>Murder Method</h4>
              {
                suspect.methodCards.map(methodCard => {
                  let isActiveMethod;
                  if (currPlayerIsAccuser) {
                    isActiveMethod = selectedMurderMethod === methodCard.label;
                  } else {
                    isActiveMethod = accusedMethod === methodCard.label;
                  }

                  return (
                    <Button
                      variant='outline-danger'
                      size='sm'
                      active={isActiveMethod}
                      onClick={() => onSelectDetail('method', methodCard.label)}
                      block
                    >
                      {methodCard.label}
                    </Button>
                  );
                })
              }
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <h4>Key Evidence</h4>
              {
                suspect.evidenceCards.map(evidenceCard => {
                  let isActiveEvidence;

                  if (currPlayerIsAccuser) {
                    isActiveEvidence = selectedKeyEvidence === evidenceCard.label;
                  } else {
                    isActiveEvidence = accusedEvidence === evidenceCard.label;
                  }

                  return (
                    <Button
                      variant='outline-info'
                      size='sm'
                      active={isActiveEvidence}
                      onClick={() => onSelectDetail('evidence', evidenceCard.label)}
                      block
                    >
                      {evidenceCard.label}
                    </Button>
                  );
                })
              }
            </Card.Body>
          </Card>
        </CardDeck>
      </Modal.Body>
      {
        !showingResults && selectedMurderMethod && selectedKeyEvidence &&
          <Button onClick={onConfirmAccusation}>
            Confirm Accusation
          </Button>
      }
      {
        showingResults &&
          <Button onClick={endAccusation}>
            Close
          </Button>
      }
    </Modal>
  );
}

export default AccusePlayerModal;
