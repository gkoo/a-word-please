import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import {
  TILE_DECEPTION_CAUSE_OF_DEATH,
  TILE_DECEPTION_LOCATION,
  TILE_DECEPTION_SCENE,
} from '../../constants/deception';

function TileCard({
  border,
  collapse,
  disabled,
  label,
  onChoose,
  onClose,
  onSelect,
  options,
  showChooseButton,
  showClose,
  tileId,
  tileType,
  value,
}) {
  if (showClose && !onClose) {
    throw new Error('showClose is true but no onClose callback was provided!');
  }
  if (showChooseButton && !onChoose) {
    throw new Error('showChooseButton is true but no onChoose callback was provided!');
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
      throw new Error(`Unrecognized tile type: ${tileType}`);
  }

  let optionsToDisplay = options;

  if (collapse) {
    optionsToDisplay = options.filter(option => selectedOption === option);
  }

  return (
    <Card className='deception-tile-card my-2' border={border}>
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
          optionsToDisplay.map(option =>
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
      {
        showChooseButton &&
          <Card.Footer className='text-center'>
            <Button onClick={onChoose}>Choose</Button>
          </Card.Footer>
      }
    </Card>
  );
}

export default TileCard;
