import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'

import {
  currPlayerSelector,
  socketSelector,
} from '../../store/selectors';

import {
  ROLE_MURDERER,
} from '../../constants';

function ChooseMeansView() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const currPlayer = useSelector(currPlayerSelector);
  const currPlayerIsMurderer = currPlayer.role === ROLE_MURDERER;
  const socket = useSelector(socketSelector);

  if (!currPlayerIsMurderer) {
    return <h1>Waiting for the murderer to choose means and evidence...</h1>;
  }

  const onMethodChange = (value) => setSelectedMethod(value);
  const onEvidenceChange = (value) => setSelectedEvidence(value);
  const onSubmit = () => {
    if (!selectedMethod || !selectedEvidence) { return; }

    socket.emit('handlePlayerAction', {
      action: 'chooseMeansAndEvidence',
      methodId: selectedMethod,
      evidenceId: selectedEvidence,
    });
  };

  return (
    <>
      <h1>Please choose your means of murder and key evidence</h1>

      <h3>Methods of Murder</h3>
      <ToggleButtonGroup name='method-toggle' onChange={onMethodChange} type='radio'>
        {
          currPlayer?.methodCards?.map(method =>
            <ToggleButton key={method.id} value={method.id}>{method.label}</ToggleButton>
          )
        }
      </ToggleButtonGroup>

      <h3>Key Evidence</h3>
      <ToggleButtonGroup name='evidence-toggle' onChange={onEvidenceChange} type='radio'>
        {
          currPlayer?.evidenceCards?.map(evidence =>
            <ToggleButton key={evidence.id} value={evidence.id}>{evidence.label}</ToggleButton>
          )
        }
      </ToggleButtonGroup>

      <div>
        <Button onClick={onSubmit} disabled={!selectedMethod || !selectedEvidence}>OK</Button>
      </div>
    </>
  );
}

export default ChooseMeansView;
