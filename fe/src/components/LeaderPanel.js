import React from 'react';
import { useSelector } from 'react-redux';

import * as selectors from '../store/selectors';

function LeaderPanel() {
  const currPlayer = useSelector(selectors.currPlayer);

  console.log('currPlayer: ', currPlayer);
  if (!currPlayer || !currPlayer.isLeader) {
    return <div/>;
  }

  return <div>This is the leader panel</div>;
};

export default LeaderPanel;
