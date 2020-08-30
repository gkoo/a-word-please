import React, { useEffect, useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import {
  TILE_DECEPTION_CAUSE_OF_DEATH,
  TILE_DECEPTION_LOCATION,
  TILE_DECEPTION_SCENE,
} from '../../constants';

function TileCard({
  disabled,
  label,
  onClose,
  onSelect,
  options,
  showClose,
  tileId,
  tileType,
  value,
}) {
  if (showClose && !onClose) {
    throw 'showClose is true but no onClose callback was provided!';
  }

  const [selectedOption, setSelectedOption] = useState(value);

  const onOptionChange = (option) => {
    if (disabled) { return; }
    if (!onSelect) { return; }

    // If re-selecting the same option, treat this action as a toggle (unselect the option)
    const optionToSelect = selectedOption === option ? null : option;
    const tileIdToSelect = optionToSelect ? tileId : null;

    setSelectedOption(optionToSelect);
    onSelect(optionToSelect, tileIdToSelect);
  };

  const onCloseButtonClick = () => onClose(tileId);

  let buttonVariant;

  switch (tileType) {
    case TILE_DECEPTION_CAUSE_OF_DEATH:
      buttonVariant = 'outline-danger';
      break;
    case TILE_DECEPTION_LOCATION:
      buttonVariant = 'outline-success';
      break;
    case TILE_DECEPTION_SCENE:
      buttonVariant = 'outline-warning';
      break;
    default:
      throw `Unrecognized tile type: ${tileType}`;
  }

  return (
    <Card className='deception-tile-card my-2'>
      <Card.Body>
        {
          showClose &&
            <Button
              variant='warning'
              type='button'
              className='close'
              aria-label='Close'
              onClick={onCloseButtonClick}
            >
              <span aria-hidden='true'>&times;</span>
            </Button>
        }
        <h3 className='text-center'>{label}</h3>
        {
          options.map(option =>
            <Button
              key={option}
              variant={buttonVariant}
              value={option}
              active={selectedOption === option}
              onClick={() => onOptionChange(option)}
              disabled={option !== selectedOption && disabled}
              size='sm'
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
