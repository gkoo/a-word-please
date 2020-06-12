import React from 'react';
import cx from 'classnames';

import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import {
  LABELS,
  ROLE_WEREWOLF,
  ROLE_MINION,
  ROLE_MASON,
  ROLE_SEER,
  ROLE_ROBBER,
  ROLE_TROUBLEMAKER,
  ROLE_DRUNK,
  ROLE_INSOMNIAC,
  ROLE_HUNTER,
  ROLE_VILLAGER,
  ROLE_DOPPELGANGER,
  ROLE_TANNER,
} from '../../constants';

const getTeam = role => {
  switch (role) {
    case ROLE_WEREWOLF:
    case ROLE_MINION:
      return LABELS[ROLE_WEREWOLF];
    case ROLE_TANNER:
      return LABELS[ROLE_TANNER];
    default:
      return LABELS[ROLE_VILLAGER];
  };
};

const getDescription = role => {
  switch (role) {
    case ROLE_WEREWOLF:
      return 'Avoid suspicion and cast doubt on the villagers';
    case ROLE_MINION:
      return 'Help the werewolves win';
    case ROLE_TANNER:
      return 'Win if you are eliminated';
    case ROLE_MASON:
      return 'Look for the other mason';
    case ROLE_SEER:
      return 'Look at another player\'s role or two unclaimed roles';
    case ROLE_ROBBER:
      return 'Switch roles with another player';
    case ROLE_TROUBLEMAKER:
      return 'Switch two other players\' roles';
    case ROLE_DRUNK:
      return 'Your role is switched with an unclaimed role';
    case ROLE_INSOMNIAC:
      return 'Look at your role at the end of the night';
    case ROLE_HUNTER:
      return 'If you die, the person you vote for also dies';
    case ROLE_DOPPELGANGER:
      return 'Assume the role of another player';
    case ROLE_VILLAGER:
      return 'Just an ordinary person';
    default:
      return '';
  };
};

const getEmoji = role => {
  switch (role) {
    case ROLE_WEREWOLF:
      return '🐺';
    case ROLE_MINION:
      return '🦹🏽‍♀️';
    case ROLE_TANNER:
      return '😫';
    case ROLE_MASON:
      return '⚒';
    case ROLE_ROBBER:
      return '💰';
    case ROLE_SEER:
      return '🔍';
    case ROLE_TROUBLEMAKER:
      return '🤪';
    case ROLE_DRUNK:
      return '🍺';
    case ROLE_INSOMNIAC:
      return '☕️';
    case ROLE_HUNTER:
      return '🏹';
    case ROLE_DOPPELGANGER:
      return '👯‍♀️';
    case ROLE_VILLAGER:
      return '🤷🏽‍♀️';
    default:
      return;
  }
};

function RoleCard({ id, role, chooseMode, selected, callback }) {
  const noop = () => {};
  const clickCallback = callback ? () => callback(id) : noop;

  return (
    <div className={cx('role-card', { 'choose-mode': chooseMode, selected })}>
      <Card
        className='my-1'
        onClick={clickCallback}
      >
        <Card.Img variant="top" src="/img/yoda.jpg" />
        <Card.Body>
          <Card.Title>{getEmoji(role)} {LABELS[role]}</Card.Title>
          <Card.Text>
            <em><small>{getDescription(role)}</small></em>
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
}

export default RoleCard;
