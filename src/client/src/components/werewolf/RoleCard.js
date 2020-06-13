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

function RoleCard({
  id,
  callback,
  cardContent,
  chooseMode,
  className,
  includeTeam,
  refTarget,
  revealingRole,
  role,
  selected,
}) {
  const noop = () => {};
  const clickCallback = callback ? () => callback(id) : noop;
  const team = getTeam(role);
  const shouldRevealRole = revealingRole || revealingRole === undefined;

  const teamClassName = cx({
    'text-danger': team === LABELS[ROLE_WEREWOLF],
    'text-success': team === LABELS[ROLE_VILLAGER],
    'text-warning': team === LABELS[ROLE_TANNER],
    invisible: !shouldRevealRole,
  });

  const cardClassName = cx(
    `${className || ''} role-card my-2`,
    {
      'choose-mode': chooseMode,
      'werewolf': shouldRevealRole && team === LABELS[ROLE_WEREWOLF],
      'tanner': shouldRevealRole && team === LABELS[ROLE_TANNER],
      'villager': shouldRevealRole && team === LABELS[ROLE_VILLAGER],
      selected,
    },
  );

  const cardTitle = shouldRevealRole ? [getEmoji(role), LABELS[role]].join(' ') : '';
  const longTitle = [ROLE_TROUBLEMAKER, ROLE_DOPPELGANGER].includes(role);

  return (
    <Card
      className={cardClassName}
      onClick={clickCallback}
      ref={refTarget}
    >
      <Card.Img variant="top" src='/img/yoda.jpg' className={cx({ invisible: !shouldRevealRole })}/>
      <Card.Body>
        <Card.Title className={cx({ invisible: !shouldRevealRole, h6: longTitle })}>
          <span className='mr-2'>{getEmoji(role)}</span>
          {LABELS[role]}
        </Card.Title>
        {
          includeTeam &&
            <span className={teamClassName}>Team {getTeam(role)}</span>
        }
        {/* Used to display PlayerLabel */}
        {cardContent}
        {
          !cardContent &&
            <Card.Text className={cx({ invisible: !shouldRevealRole })}>
              <em><small>{getDescription(role)}</small></em>
            </Card.Text>
        }
      </Card.Body>
    </Card>
  );
}

export default RoleCard;