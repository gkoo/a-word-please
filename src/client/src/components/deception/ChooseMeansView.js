import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

import PlayerGroupModal from './PlayerGroupModal';
import PlayerGroupView from './PlayerGroupView';
import {
  Role,
  RoleLabels,
} from '../../constants/deception';
import {
  accompliceSelector,
  currPlayerSelector,
  gameDataSelector,
  murdererSelector,
  scientistSelector,
  socketSelector,
} from '../../store/selectors';

function ChooseMeansView() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showPlayerGroup, setShowPlayerGroup] = useState(false);

  const { Accomplice, Investigator, Murderer, Scientist } = Role;

  const accomplice = useSelector(accompliceSelector);
  const currPlayer = useSelector(currPlayerSelector);
  const gameData = useSelector(gameDataSelector);
  const murderer = useSelector(murdererSelector);
  const scientist = useSelector(scientistSelector);
  const socket = useSelector(socketSelector);

  const currPlayerIsMurderer = currPlayer?.role === Murderer;
  const currPlayerCanView = [Murderer, Scientist, Accomplice].includes(currPlayer?.role);

  useEffect(() => {
    setSelectedMethod(gameData.murderMethod?.id);
  }, [gameData.murderMethod]);

  useEffect(() => {
    setSelectedEvidence(gameData.keyEvidence?.id);
  }, [gameData.keyEvidence]);

  if (!currPlayerCanView) {
    return (
      <>
        <h1 className='mb-5'>Waiting for the murderer to choose means and evidence...</h1>
        <PlayerGroupView showAccuseButtons={false}/>
      </>
    );
  }

  const onMethodChange = (methodId) => {
    if (!currPlayerIsMurderer) {
      return;
    }

    setSelectedMethod(methodId);

    socket.emit('playerAction', { action: 'setMethod', methodId: methodId });
  }

  const onEvidenceChange = (evidenceId) => {
    if (!currPlayerIsMurderer) {
      return;
    }

    setSelectedEvidence(evidenceId);

    socket.emit('playerAction', { action: 'setEvidence', evidenceId: evidenceId });
  }

  const onSubmit = () => {
    if (!selectedMethod || !selectedEvidence) { return; }

    socket.emit('playerAction', {
      action: 'confirmMeansAndEvidence',
    });
  };

  return (
    <>
      <h1>
        {currPlayerIsMurderer ? 'You are' : `${murderer.name} is` } the {RoleLabels[Murderer]}!
      </h1>
      {
        currPlayerIsMurderer &&
          <>
            <p>
              Choose the details of your grisly murder. The {RoleLabels[Scientist]} will
              use these details to provide clues to the {RoleLabels[Investigator]}s.
            </p>
            {
              accomplice &&
                <p>
                  {scientist.name} ({RoleLabels[Scientist]}) and {accomplice.name} (
                    {RoleLabels[Accomplice]}) are also watching as you make your decision.
                </p>
            }
            {
              !accomplice &&
                <p>
                  {scientist.name} ({RoleLabels[Scientist]}) is also watching as you make your
                  decision.
                </p>
            }
          </>
      }
      {
        !currPlayerIsMurderer &&
          <p>
            {murderer.name} is choosing how the murder went down.
          </p>
      }

      <Card className='my-2'>
        <Card.Body>
          <Card.Title>
            <h3>Methods of Murder</h3>
          </Card.Title>
          {
            currPlayerIsMurderer &&
              <p>Your instrument of death. Choose wisely.</p>
          }
          {
            !currPlayerIsMurderer &&
              <p>{murderer.name}'s instrument of death.</p>
          }
          {
            murderer.methodCards?.map(method =>
              <Button
                variant='outline-danger'
                className='mx-1'
                active={selectedMethod === method.id}
                onClick={() => onMethodChange(method.id)}
              >
                {method.label}
              </Button>
            )
          }
        </Card.Body>
      </Card>

      <Card className='my-2'>
        <Card.Body>
          <Card.Title>
            <h3>Key Evidence</h3>
          </Card.Title>
          <p>No killer is perfect. What did you leave behind?</p>
          {
            murderer.evidenceCards?.map(evidence =>
              <Button
                variant='outline-light'
                className='mx-1'
                active={selectedEvidence === evidence.id}
                onClick={() => onEvidenceChange(evidence.id)}
              >
                {evidence.label}
              </Button>
            )
          }
        </Card.Body>
      </Card>

      <div className='text-center my-3'>
        <Button variant='secondary' className='mx-1' onClick={() => setShowPlayerGroup(true)}>
          Show Players
        </Button>
        {
          currPlayerIsMurderer &&
            <Button onClick={onSubmit} className='mx-1' disabled={!selectedMethod || !selectedEvidence}>
              Confirm Means and Evidence
            </Button>
        }
      </div>

      <PlayerGroupModal show={showPlayerGroup} onHide={() => setShowPlayerGroup(false)} />
    </>
  );
}

export default ChooseMeansView;
