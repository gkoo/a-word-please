import React from 'react';
import cx from 'classnames';

import Badge from 'react-bootstrap/Badge';

function ClueBadge({ type, label, selected }) {
  return (
    <span className='h5 clue-label'>
      <Badge variant={ type === 'method' ? 'danger' : 'light' } className='mx-1'>
        {label}{' '}
        {
          selected && <Badge variant='dark'>*</Badge>
        }
      </Badge>
    </span>
  );
}

export default ClueBadge;
