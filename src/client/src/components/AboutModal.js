import React from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function RulesModal({ onClose, show }) {
  return (
    <Modal show={show} className='rules-modal'>
      <Modal.Header>
        <Modal.Title>About</Modal.Title>
      </Modal.Header>
      <Modal.Body className='rules-modal-body'>
        <p>
          <em>A Word, Please?</em> is based on the board game{' '}
          <a
            href='https://justone-the-game.com/index.php?lang=en#download'
            target='_blank'
            rel='noopener noreferrer'
          >
            Just One
          </a>. You can{' '}
          <a
            href='https://smile.amazon.com/dp/B07W3PJTL2/ref=cm_sw_r_tw_dp_U_x_u1-0EbECTKQSR'
            target='_blank'
            rel='noopener noreferrer'
          >
            buy it here
          </a>!
        </p>

        <div className='text-center my-3'>
          <img className='just-one-cover' src='/justone.jpg' alt='Cover of Just One board game' />
        </div>

        <p>
          The code for this game is on{' '}
          <a
            href='https://www.github.com/gkoo/a-word-please'
            target='_blank'
            rel='noopener noreferrer'
          >
            Github
          </a>!
        </p>

        <p>
          Did you enjoy this game?{' '}
          <a
            href='https://www.buymeacoffee.com/gkoo'
            target='_blank'
            rel='noopener noreferrer'
          >
            Buy the developer a coffee!
          </a>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='primary' onClick={onClose}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RulesModal;
