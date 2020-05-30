import io from 'socket.io-client';

import {
  socketIoServerUrl,
} from './constants';

export const newSocket = () => {
  return io(socketIoServerUrl);
};
