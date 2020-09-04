import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

import PlayerGroupView from './PlayerGroupView';
import {
  DECEPTION_ROLE_LABELS,
  ROLE_INVESTIGATOR,
  ROLE_MURDERER,
  ROLE_SCIENTIST,
} from '../../constants';
import {
  currPlayerSelector,
  socketSelector,
} from '../../store/selectors';

function ChooseMeansView() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const currPlayer = useSelector(currPlayerSelector);
  const currPlayerIsMurderer = currPlayer.role === ROLE_MURDERER;
  const socket = useSelector(socketSelector);

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
      <h1>You are the {DECEPTION_ROLE_LABELS[ROLE_MURDERER]}!</h1>

      <p>
        Choose the details of your grisly murder. The {DECEPTION_ROLE_LABELS[ROLE_SCIENTIST]} will
        use these details to provide clues to the {DECEPTION_ROLE_LABELS[ROLE_INVESTIGATOR]}s.
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
                variant='outline-danger'
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

      <div className='text-center mt-3'>
        <Button onClick={onSubmit} disabled={!selectedMethod || !selectedEvidence}>OK</Button>
      </div>
    </>
  );
}

export default ChooseMeansView;
