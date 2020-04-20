import React, { useState, useEffect, useRef, } from 'react';
import { useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';

import { messagesSelector, socketSelector } from '../store/selectors';

function MessageLog() {
  const [typedMessage, setTypedMessage] = useState('');
  const socket = useSelector(socketSelector);
  const messages = useSelector(messagesSelector);
  const messagesRef = useRef(null);

  const onTypedMessageChange = e => setTypedMessage(e.target.value);

  // Scroll chat to bottom on first render
  useEffect(() => {
    // hack to get messagesRef
    setTimeout(() => {
      const messagesEl = messagesRef.current;
      if (!messagesEl) { return; }
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 500);
  }, []);

  // Scroll chat to bottom if window is scrolled far down enough.
  useEffect(() => {
    const messagesEl = messagesRef.current;
    if (!messagesEl) { return; }
    if (messagesEl.scrollTop > (messagesEl.scrollHeight - messagesEl.clientHeight) - 50) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  });

  const onSubmit = e => {
    e.preventDefault();
    socket.emit('chatMessage', typedMessage);
    setTypedMessage('');
  }

  return (
    <>
      <div className='message-log' ref={messagesRef}>
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
