import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { toggleRulesModal } from '../store/actions';
import { selectedGameSelector } from '../store/selectors';
import { GAME_WEREWOLF } from '../constants';

const getKey = gameId => {
  return gameId === GAME_WEREWOLF ? 'werewolf-rules' : 'a-word-please-rules';
};

function RulesModal({ onClose, show }) {
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const selectedGame = useSelector(selectedGameSelector);
  const [cachedSelectedGame, setCachedSelectedGame] = useState(selectedGame);
  const initialActiveKey = getKey(selectedGame);
  const [activeKey, setActiveKey] = useState(initialActiveKey);
  const onTabSelect = key => setActiveKey(key);

  const handleClose = () => {
    showModal && dispatch(toggleRulesModal({ show: false }))
    setActiveKey(getKey(selectedGame)); // reset selected game to be default view
  };

  useEffect(() => {
    if (show !== showModal) {
      setShowModal(show);
    }
  }, [show, showModal]);

  useEffect(() => {
    setActiveKey(getKey(selectedGame));
  }, [selectedGame]);

  return (
    <Modal show={show} className='rules-modal' onHide={handleClose} scrollable>
      <Modal.Body>
        <Tabs activeKey={activeKey} onSelect={onTabSelect}>
          <Tab eventKey='a-word-please-rules' title='A Word, Please?'>
            <div className='pr-3 pt-3'>
              <p>
                <em>A Word, Please?</em> is a cooperative game where everyone works together to
                guess as many mystery words as possible.
              </p>

              <h5><u>Turns</u></h5>

              <p>
                Each turn, one player is the guesser and the other players are the clue givers. The
                mystery word will be visible to the clue givers, but not to the guesser. The clue
                givers each choose a one-word clue to help the guesser guess the word. If more than
                one player chooses the same clue word, that clue is hidden from the guesser.
              </p>

              <p>
                Once all clues have been submitted, the guesser sees all unique clues and has the
                opportunity to guess the mystery word.
              </p>

              <p>
                <em>If the guesser guesses correctly:</em> the group scores a point.
              </p>

              <p>
                <em>If the guesser guesses incorrectly:</em> the group loses a turn.
              </p>

              <p>
                <em>Skipping:</em> If the guesser is does not feel confident, he or she can skip the
                turn without guessing.
              </p>

              <h5><u>Clues</u></h5>

              <p>The following are all considered valid clues.</p>

              <ul>
                <li>Numbers and digits (007)</li>
                <li>Acronyms (FBI)</li>
                <li>Onomatopoeia (Meow)</li>
                <li>Special characters ($)</li>
              </ul>

              <p>The following are all considered invalid clues.</p>

              <ul>
                <li>The mystery word</li>
                <li>
                  The mystery word written in a foreign language. (If the mystery word
                  is <em>Friend</em>, your clue cannot be <em>Amigo</em>.)
                </li>
                <li>
                  A word that is phonetically identical to the mystery word, but whose
                  meaning is different. (For example, if the mystery word is <em>Oar</em>, your clue
                  cannot be <em>Or</em>.)
                </li>
                <li>Made up words.</li>
                <li>
                  Variants of the same word family. (For example, if the mystery word
                  is <em>Prince</em>, your clue cannot be <em>Princess</em>.)
                </li>
                <li>
                  Variants of the same word. (Plurals, gender differentiations, and spelling
                  mistakes.)
                </li>
              </ul>

              <h5><u>Honor System</u></h5>

              <p>
                Players are trusted to play by the rules. If you're really determined to cheat, there's
                probably a way to do so, but the game won't be fun.
              </p>

              <h5><u>End of the Game</u></h5>
              <p>
                Each game starts with 13 turns. The game ends when there are no more turns left.
              </p>
            </div>
          </Tab>
          <Tab eventKey='werewolf-rules' title='One Night Werewolf'>
            <div className='pr-3 pt-3'>
              <p>
                <em>Werewolf</em> is a cooperative game where everyone works together to guess as
                many mystery words as possible.
              </p>

              <h5><u>Turns</u></h5>

              <p>
                Each turn, one player is the guesser and the other players are the clue givers. The
                mystery word will be visible to the clue givers, but not to the guesser. The clue
                givers each choose a one-word clue to help the guesser guess the word. If more than
                one player chooses the same clue word, that clue is hidden from the guesser.
              </p>

              <p>
                Once all clues have been submitted, the guesser sees all unique clues and has the
                opportunity to guess the mystery word.
              </p>

              <p>
                <em>If the guesser guesses correctly:</em> the group scores a point.
              </p>

              <p>
                <em>If the guesser guesses incorrectly:</em> the group loses a turn.
              </p>

              <p>
                <em>Skipping:</em> If the guesser is does not feel confident, he or she can skip the turn
                without guessing.
              </p>

              <h5><u>Clues</u></h5>

              <p>The following are all considered valid clues.</p>

              <ul>
                <li>Numbers and digits (007)</li>
                <li>Acronyms (FBI)</li>
                <li>Onomatopoeia (Meow)</li>
                <li>Special characters ($)</li>
              </ul>

              <p>The following are all considered invalid clues.</p>

              <ul>
                <li>The mystery word</li>
                <li>
                  The mystery word written in a foreign language. (If the mystery word
                  is <em>Friend</em>, your clue cannot be <em>Amigo</em>.)
                </li>
                <li>
                  A word that is phonetically identical to the mystery word, but whose
                  meaning is different. (For example, if the mystery word is <em>Oar</em>, your clue
                  cannot be <em>Or</em>.)
                </li>
                <li>Made up words.</li>
                <li>
                  Variants of the same word family. (For example, if the mystery word
                  is <em>Prince</em>, your clue cannot be <em>Princess</em>.)
                </li>
                <li>
                  Variants of the same word. (Plurals, gender differentiations, and spelling
                  mistakes.)
                </li>
              </ul>

              <h5><u>Honor System</u></h5>

              <p>
                Players are trusted to play by the rules. If you're really determined to cheat, there's
                probably a way to do so, but the game won't be fun.
              </p>

              <h5><u>End of the Game</u></h5>
              <p>
                Each game starts with 13 turns. The game ends when there are no more turns left.
              </p>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='primary' onClick={handleClose}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RulesModal;
