import React from 'react';
import { useSelector } from 'react-redux';

import {
  currPlayerSelector,
} from '../../store/selectors';

import {
  ROLE_SCIENTIST,
  ROLE_MURDERER,
} from '../../constants';

function ChooseMeansView() {
  const currPlayer = useSelector(currPlayerSelector);
  const currPlayerIsScientist = currPlayer.role === ROLE_SCIENTIST;
  const currPlayerIsMurderer = currPlayer.role === ROLE_MURDERER;

  if (!currPlayerIsMurderer) {
    return <h1>Waiting for the murderer to choose means and evidence...</h1>;
  }

  return (
    <h1>Please choose your means of murder and key evidence</h1>
  );
}

export default ChooseMeansView;
