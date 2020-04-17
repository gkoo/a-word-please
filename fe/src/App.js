import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MessageLog from './components/MessageLog';
import { playerMessage } from './store/actions';

function App() {
  const socket = useSelector(state => state.socket);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('playerMessage', data => {
      dispatch(playerMessage(data));
    });
  });

  return <MessageLog />;
}

export default App;
