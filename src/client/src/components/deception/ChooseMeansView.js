import React, { useState } from 'react';
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
  currPlayerSelector,
  socketSelector,
} from '../../store/selectors';

function ChooseMeansView() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showPlayerGroup, setShowPlayerGroup] = useState(false);

  const { Investigator, Murderer, Scientist } = Role;

  const currPlayer = useSelector(currPlayerSelector);
  const socket = useSelector(socketSelector);

  const currPlayerIsMurderer = currPlayer?.role === Murderer;

  if (!currPlayerIsMurderer) {
    return (
      <>
        <h1 className='mb-5'>Waiting for the murderer to choose means and evidence...</h1>
        <PlayerGroupView showAccuseButtons={false}/>
      </>
    );
  }

  const onSubmit = () => {
    if (!selectedMethod || !selectedEvidence) { return; }

    socket.emit('playerAction', {
      action: 'chooseMeansAndEvidence',
      methodId: selectedMethod,
      evidenceId: selectedEvidence,
    });
  };

  return (
    <>
      <h1>You are the {RoleLabels[Murderer]}!</h1>

      <p>
        Choose the details of your grisly murder. The {RoleLabels[Scientist]} will
        use these details to provide clues to the {RoleLabels[Investigator]}s.
      </p>

      <Card className='my-2'>
        <Card.Body>
          <Card.Title>
            <h3>Methods of Murder</h3>
          </Card.Title>
          <p>Your instrument of death. Choose wisely.</p>
          {
            currPlayer?.methodCards?.map(method =>
              <Button
                variant='outline-danger'
                className='mx-1'
                active={selectedMethod === method.id}
                onClick={() => setSelectedMethod(method.id)}
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
            currPlayer?.evidenceCards?.map(evidence =>
              <Button
                variant='outline-light'
                className='mx-1'
                active={selectedEvidence === evidence.id}
                onClick={() => setSelectedEvidence(evidence.id)}
              >
                {evidence.label}
              </Button>
            )
          }
        </Card.Body>
      </Card>

      <div className='text-center my-3'>
        <Button variant='secondary' className='mx-1' onClick={() => setShowPlayerGroup(true)}>
          Show Other Players
        </Button>
        <Button onClick={onSubmit} className='mx-1' disabled={!selectedMethod || !selectedEvidence}>
          Confirm Means and Evidence
        </Button>
      </div>

      <PlayerGroupModal show={showPlayerGroup} onHide={() => setShowPlayerGroup(false)} />
    </>
  );
}

export default ChooseMeansView;
