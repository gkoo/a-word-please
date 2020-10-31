import React from 'react';
import { useSelector } from 'react-redux';

import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';

import {
  currPlayerSelector,
  currUserIsSpectatorSelector,
  gameDataSelector,
} from '../../store/selectors';

function SubjectCards({ hideFromFake }) {
  const currPlayer = useSelector(currPlayerSelector);
  const gameData = useSelector(gameDataSelector);
  const isSpectator = useSelector(currUserIsSpectatorSelector);

  const { fakeArtistId, subjectEntry } = gameData;

  if (!subjectEntry) {
    return false;
  }

  const currPlayerIsFake = currPlayer?.id === fakeArtistId;
  const shouldHide = hideFromFake && (currPlayerIsFake || isSpectator);

  const { subject, category } = subjectEntry;

  return (
    <CardGroup>
      <Card>
        <Card.Header>
          Subject
        </Card.Header>
        <Card.Body>
          {!shouldHide && <p>{subject}</p>}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          Category
        </Card.Header>
        <Card.Body>
          <p>{category}</p>
        </Card.Body>
      </Card>
    </CardGroup>
  );
}

export default SubjectCards;
