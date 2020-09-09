import React from 'react';
import { useDispatch } from 'react-redux';

import Modal from 'react-bootstrap/Modal';
import { toggleAboutModal } from '../store/actions';

function AboutModal({ show }) {
  const dispatch = useDispatch();
  const handleClose = () => show && dispatch(toggleAboutModal({ show: false }));

  return (
    <Modal show={show} onHide={handleClose} scrollable>
      <Modal.Header closeButton>
        <Modal.Title>About</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <h3>The Site</h3>
          <p>
            I started building online games during the coronavirus quarantine in early 2020, as a
            technical challenge for myself and also to do my small part to help keep people sane and
            connected during difficult times.
          </p>
          <h5>
            <em>Why is it called Koo Fitness Club?</em>
          </h5>
          <p>
            One of my goals for this project was to do as much as I could for free. I happened to
            have the koofitness.club domain already, so I just used it.
          </p>
        </div>

        <hr />

        <div>
          <h3>The Games</h3>
          <p>
            <em>A Word, Please?</em> is based on the board game{' '}
            <a
              href='https://justone-the-game.com/index.php?lang=en#download'
              target='_blank'
              rel='noopener noreferrer'
            >
              Just One
            </a>. {' '}
            <a
              href='https://smile.amazon.com/dp/B07W3PJTL2/ref=cm_sw_r_tw_dp_U_x_u1-0EbECTKQSR'
              target='_blank'
              rel='noopener noreferrer'
            >
              Buy it here
            </a>!
          </p>
          <p>
            <em>One Night Werewolf</em> is based on the tabletop game{' '} of the same name. {' '}
            <a
              href='https://smile.amazon.com/dp/B00HS7GG5G/ref=cm_sw_em_r_mt_dp_U_MB57Eb04K9MD3'
              target='_blank'
              rel='noopener noreferrer'
            >
              Buy it here!
            </a>
          </p>
        </div>

        <hr />

        <div>
          <h3>The Developer</h3>
          <p>
            You can find me on <a href="https://twitter.com/gordon_koo" target="_blank">Twitter</a>.
          </p>
        </div>
        <hr />

        <div>
          <h3>The Code</h3>
          <p>
            The site is built with React, Typescript and Node, and it uses Socket.IO for real-time
            communication.
          </p>
          <p>
            The code for these games is on <a href="https://github.com/gkoo/a-word-please" target="_blank">Github</a>!
          </p>
        </div>

        <hr />

        <p>
          Did you enjoy playing games today?{' '}
          <a
            href='https://www.buymeacoffee.com/gkoo'
            target='_blank'
            rel='noopener noreferrer'
          >
            Buy the developer a coffee!
          </a>
        </p>
      </Modal.Body>
    </Modal>
  );
}

export default AboutModal;
