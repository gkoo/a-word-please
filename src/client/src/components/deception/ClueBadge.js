import React from 'react';

import Badge from 'react-bootstrap/Badge';

function ClueBadge({ type, label }) {
  return (
    <span className='h5'>
      <Badge variant={ type === 'method' ? 'danger' : 'light' } className='mx-1'>
        {label}
      </Badge>
    </span>
  );
}

export default ClueBadge;
