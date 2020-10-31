# A Word, Please?

https://koofitness.club

This is an online implementation of the board game "Just One". It's implemented with Node, Socket.IO, and React.

# Setup

Server code is in `src/server`, client code is in `src/client`.

## Server

```
cd src/server
yarn install
yarn start
```

This will start the server on port 5000.

## Client

```
cd src/client
yarn install
yarn start
```

This will start the server on port 3000.

### Developing the UI

Sometimes you'll want to work on the UI without having to go through the inconvenience of starting a game and getting it in the right state. To make this easier, change the value of `useTestState` in [reducer.js](./src/client/src/store/reducer.js) from `0` to `1`, then modify the `testState` variable to set up the game in the desired state.
