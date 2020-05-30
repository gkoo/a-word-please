export const env = process.env.NODE_ENV;
export const socketIoServerUrl = (
  env === 'production' ?
    'https://a-word-please-node.herokuapp.com/' :
    'http://localhost:5000'
    //'http://10.0.1.13:5000'
);


export const STATE_PENDING = 0;
export const STATE_ENTERING_CLUES = 1;
export const STATE_REVIEWING_CLUES = 2;
export const STATE_ENTERING_GUESS = 3;
export const STATE_TURN_END = 4;
export const STATE_GAME_END = 5;
