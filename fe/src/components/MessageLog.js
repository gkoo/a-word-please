import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';

import * as selectors from '../store/selectors';

function MessageLog() {
  const [typedMessage, setTypedMessage] = useState('');
  const socket = useSelector(selectors.socket);
  const messages = useSelector(selectors.messages);

  const onTypedMessageChange = e => setTypedMessage(e.target.value);

  const onSubmit = e => {
    e.preventDefault();
    socket.emit('chatMessage', typedMessage);
    setTypedMessage('');
  }

  return (
    <>
      <div className='message-log'>
        <ul>
          {messages.map(message => <li>{message}</li>)}
        </ul>
      </div>
      <form onSubmit={onSubmit}>
        <input type="text" value={typedMessage} onChange={onTypedMessageChange}/>
        <Button onClick={onSubmit}>Submit</Button>
      </form>
    </>
  );
}

export default MessageLog;
