import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import DoppelgangerView from './DoppelgangerView';
import SeerView from './SeerView';
import RobberView from './RobberView';
import TroublemakerView from './TroublemakerView';
import DrunkView from './DrunkView';
import InsomniacView from './InsomniacView';
import {
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
  LABELS,
} from '../../constants';
import { currPlayerSelector, playersSelector, wakeUpRoleSelector } from '../../store/selectors';

function NighttimeView() {
  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const wakeUpRole = useSelector(wakeUpRoleSelector);
  const isAwake = currPlayer.originalRole === wakeUpRole;

  const maybeRenderWakeUp = () => {
    if (!isAwake) { return; }

    switch (currPlayer.originalRole) {
      case ROLE_DOPPELGANGER:
        return <DoppelgangerView />;
      case ROLE_SEER:
        return <SeerView />;
      case ROLE_ROBBER:
        return <RobberView />;
      case ROLE_TROUBLEMAKER:
        return <TroublemakerView />;
      case ROLE_DRUNK:
        return <DrunkView />;
      case ROLE_INSOMNIAC:
        return <InsomniacView />;
      default:
        throw new Error('Unrecognized wake up role in NighttimeView');
    }
  };

  const renderEmoji = () => {
    switch (currPlayer.originalRole) {
      case ROLE_WEREWOLF:
        return '🐺';
      case ROLE_MASON:
        return '⚒';
      case ROLE_ROBBER:
        return '💰';
      case ROLE_SEER:
        return '🔍';
      case ROLE_DRUNK:
        return '🍺';
      case ROLE_INSOMNIAC:
        return '☕️';
      case ROLE_HUNTER:
        return '🏹';
    }
  };

  return (
    <div className='text-center'>
      <h1>
        <span>
          {isAwake ? '😳' : '😴'}
        </span>
      </h1>
      <h4>Your role is: {LABELS[currPlayer.lastKnownRole]} {renderEmoji()}</h4>
      {maybeRenderWakeUp()}
    </div>
  );
}

export default NighttimeView;
