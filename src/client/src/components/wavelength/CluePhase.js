import React from 'react';

import { useSelector } from 'react-redux';

import GuesserView from './GuesserView';
import PsychicView from './PsychicView';
import { currPlayerIsActivePlayerSelector } from '../../store/selectors';

function CluePhase() {
  const currPlayerIsActivePlayer = useSelector(currPlayerIsActivePlayerSelector);

  return (
    <>
      {
        currPlayerIsActivePlayer &&
          <PsychicView />
      }
      {
        !currPlayerIsActivePlayer &&
          <GuesserView />
      }
    </>
  );
}

export default CluePhase;
