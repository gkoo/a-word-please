import React, { useState, useEffect, useRef } from 'react';

import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';

function MessageLog({ messages, onNewMessage }) {
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
    const { scrollTop, scrollHeight, clientHeight } = messagesEl;
    // - 200 accounts for the height of the newly added system message
    if (scrollTop > (scrollHeight - clientHeight) - 200) {
      messagesEl.scrollTop = scrollHeight;
    }
  }, [messages.length]);

  const onSubmit = e => {
    e.preventDefault();
    onNewMessage(typedMessage);
    setTypedMessage('');
  }

  // https://stackoverflow.com/a/16348977
  const stringToColor = str => {
    let hash = 0;
    let i;
    for (i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var color = '#';
    for (i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  const renderMessage = ({ id, senderName, text, type }) => {
    if (type === 'system') {
      return (
        <ListGroup.Item key={id}>
          {text}
        </ListGroup.Item>
      );
    }
    return (
      <ListGroup.Item key={id}>
        <strong style={{color: stringToColor(senderName)}}>{senderName}</strong>: {text}
      </ListGroup.Item>
    );
  };

  return (
    <>
      <ListGroup className='message-log' ref={messagesRef}>
        {messages.map(renderMessage)}
      </ListGroup>
      <form onSubmit={onSubmit}>
        <input type="text" value={typedMessage} onChange={onTypedMessageChange}/>
        <Button onClick={onSubmit}>Submit</Button>
      </form>
    </>
  );
}

export default MessageLog;
