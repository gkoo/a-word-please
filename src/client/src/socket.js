import io from 'socket.io-client';

export const newSocket = () => {
  return io('/');
};
