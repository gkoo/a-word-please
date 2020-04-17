import * as actions from './actions';

const initialState = {
  messages: [],
};

export default function reducer(state = initialState, action) {
  switch(action.type) {
    case actions.SUBMIT_MESSAGE:
      const messages = [...state.messages, action.payload.message];
      return {
        ...state,
        messages,
      };
    default:
      return state;
  }
};
