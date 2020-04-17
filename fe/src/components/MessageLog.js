import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitMessage } from '../store/actions';

function MessageLog() {
  const [typedMessage, setTypedMessage] = useState('');
  const messages = useSelector(state => {
    return state.messages;
  });
  const dispatch = useDispatch();

  const onTypedMessageChange = (e) => {
    setTypedMessage(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(submitMessage(typedMessage));
    setTypedMessage('');
  }

  return (
    <div>
      <div className='message-log'>
        <ul>
          {messages.map(message => <li>{message}</li>)}
        </ul>
      </div>
      <form onSubmit={onSubmit}>
        <input type="text" value={typedMessage} onChange={onTypedMessageChange}/>
        <input type="submit" value="Submit"/>
      </form>
    </div>
  );
}

export default MessageLog;
