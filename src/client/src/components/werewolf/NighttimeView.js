import React from 'react';
import { useSelector } from 'react-redux';

import DoppelgangerView from './DoppelgangerView';
import SeerView from './SeerView';
import RobberView from './RobberView';
import TroublemakerView from './TroublemakerView';
import DrunkView from './DrunkView';
import InsomniacView from './InsomniacView';
import WerewolfView from './WerewolfView';
import HunterView from './HunterView';
import MasonView from './MasonView';
import MinionView from './MinionView';
import TannerView from './TannerView';
import VillagerView from './VillagerView';
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
import { currPlayerSelector, wakeUpRoleSelector } from '../../store/selectors';

const getTeamLabel = role => {
  switch (role) {
    case ROLE_WEREWOLF:
    case ROLE_MINION:
      return LABELS[ROLE_WEREWOLF];
    case ROLE_TANNER:
      return LABELS[ROLE_TANNER];
    default:
      return LABELS[ROLE_VILLAGER];
  }
};

function NighttimeView() {
  const currPlayer = useSelector(currPlayerSelector);
  const wakeUpRole = useSelector(wakeUpRoleSelector);
  const isAwake = currPlayer.originalRole === wakeUpRole;

  const renderWakeUp = () => {
    switch (currPlayer.originalRole) {
      case ROLE_DOPPELGANGER:
        return <DoppelgangerView />;
      case ROLE_SEER:
        return <SeerView showWakeUp={true} />;
      case ROLE_ROBBER:
        return <RobberView showWakeUp={true} />;
      case ROLE_TROUBLEMAKER:
        return <TroublemakerView showWakeUp={true} />;
      case ROLE_DRUNK:
        return <DrunkView showWakeUp={true} />;
      case ROLE_INSOMNIAC:
        return <InsomniacView />;
      default:
        throw new Error('Unrecognized wake up role in NighttimeView');
    }
  };

  const renderPassiveView = () => {
    switch (currPlayer.originalRole) {
      case ROLE_WEREWOLF:
        return <WerewolfView />;
      case ROLE_MINION:
        return <MinionView />;
      case ROLE_MASON:
        return <MasonView />;
      case ROLE_HUNTER:
        return <HunterView />;
      case ROLE_VILLAGER:
        return <VillagerView />;
      case ROLE_TANNER:
        return <TannerView />;
      default:
        return;
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
      default:
        return;
    }
  };

  return (
    <div className='text-center'>
      <h1>
        <span>
          {isAwake ? '😳' : '😴'}
        </span>
      </h1>
      <h4>Your starting role is: {LABELS[currPlayer.lastKnownRole]} {renderEmoji()}</h4>
      <h5>
        Team {getTeamLabel(currPlayer.lastKnownRole)}
      </h5>
      {isAwake && renderWakeUp()}
      {
        !isAwake && (
          <>
            {renderPassiveView()}
            <p><em><small>Roles may change throughout the night...</small></em></p>
          </>
        )
      }
    </div>
  );
}

export default NighttimeView;
