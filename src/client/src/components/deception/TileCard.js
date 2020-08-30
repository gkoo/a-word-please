import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function TileCard({ tileId, label, options, onSelect, disabled }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const onOptionChange = (option) => {
    // If re-selecting the same option, treat this action as a toggle (unselect the option)
    const optionToSelect = selectedOption === option ? null : option;
    const tileIdToSelect = optionToSelect ? tileId : null;

    setSelectedOption(optionToSelect);
    onSelect(optionToSelect, tileIdToSelect);
  };

  return (
    <Card className='deception-tile-card my-2'>
      <Card.Body>
        <h3 className='text-center'>{label}</h3>
        {
          options.map(option =>
            <Button
              key={option}
              variant='outline-info'
              value={option}
              active={selectedOption === option}
              onClick={() => onOptionChange(option)}
              disabled={disabled}
              block
            >
              {option}
            </Button>
          )
        }
      </Card.Body>
    </Card>
  );
}

export default TileCard;
