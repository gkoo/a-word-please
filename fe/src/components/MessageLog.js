import React, { useState, useEffect, useRef, } from 'react';
import Button from 'react-bootstrap/Button';

function MessageLog({ messages, players, socket }) {
  const [typedMessage, setTypedMessage] = useState('');

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

  const renderMessage = ({ id, senderName, text, type }) => {
    if (type === 'system') {
      return (
        <div key={id}>
          {text}
        </div>
      );
    }

    return (
      <div key={id}>
        <strong>{senderName}</strong>: {text}
      </div>
    );
  };

  return (
    <>
      <div className='message-log' ref={messagesRef}>
        <>{messages.map(renderMessage)}</>
      </div>
      <form onSubmit={onSubmit}>
        <input type="text" value={typedMessage} onChange={onTypedMessageChange}/>
        <Button onClick={onSubmit}>Submit</Button>
      </form>
    </>
  );
}

export default MessageLog;
