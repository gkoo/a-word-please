import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';

import { messagesSelector, socketSelector } from '../store/selectors';

function MessageLog() {
  const [typedMessage, setTypedMessage] = useState('');
  const socket = useSelector(socketSelector);
  const messages = useSelector(messagesSelector);

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
