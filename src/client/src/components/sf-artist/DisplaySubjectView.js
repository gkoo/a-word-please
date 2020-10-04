import React from 'react';
import { useSelector } from 'react-redux';

import SubjectCards from './SubjectCards';
import ReadyButton from '../common/ReadyButton';

import {
  currPlayerSelector,
  gameDataSelector,
} from '../../store/selectors';

function DisplaySubjectView() {
  const currPlayer = useSelector(currPlayerSelector);
  const gameData = useSelector(gameDataSelector);

  const { fakeArtistId } = gameData;

  const currPlayerIsFake = currPlayer.id === fakeArtistId;

  return (
    <>
      <SubjectCards hideFromFake={true}/>
      {
        currPlayerIsFake &&
          <p className='my-5'>
            You are the fake artist! Try to blend in and pretend you know what everyone else is
            drawing.
          </p>
      }
      <ReadyButton/>
    </>
  );
}

export default DisplaySubjectView;
