import React from 'react';
import { useSelector } from 'react-redux';

import DoppelgangerView from './DoppelgangerView';
import SeerView from './SeerView';
import RobberView from './RobberView';
import TroublemakerView from './TroublemakerView';
import InsomniacView from './InsomniacView';
import WerewolfView from './WerewolfView';
import DrunkView from './DrunkView';
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
} from '../../constants';
import { currPlayerSelector, wakeUpRoleSelector } from '../../store/selectors';

function NighttimeView() {
  const currPlayer = useSelector(currPlayerSelector);
  const wakeUpRole = useSelector(wakeUpRoleSelector);
  const isAwake = !!currPlayer && currPlayer.originalRole === wakeUpRole;

  const renderWakeUp = () => {
    switch (currPlayer?.originalRole) {
      case ROLE_DOPPELGANGER:
        return <DoppelgangerView />;
      case ROLE_WEREWOLF:
        return <WerewolfView />;
      case ROLE_MINION:
        return <MinionView />;
      case ROLE_MASON:
        return <MasonView />;
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

  const renderPassiveView = () => {
    switch (currPlayer?.originalRole) {
      case ROLE_HUNTER:
        return <HunterView />;
      case ROLE_VILLAGER:
        return <VillagerView />;
      case ROLE_TANNER:
        return <TannerView />;
      case ROLE_INSOMNIAC:
        return <InsomniacView />;
      default:
        return;
    }
  };

  return (
    <div>
      <h1 className='mb-5'><span role='img' aria-label='Nighttime'>🌙</span></h1>
      {isAwake && renderWakeUp()}
      {!isAwake &&
        <>
          <div className='my-3'>{renderPassiveView()}</div>
          <p><em>Waiting for others to finish their turns...</em></p>
        </>
      }
    </div>
  );
}

export default NighttimeView;
