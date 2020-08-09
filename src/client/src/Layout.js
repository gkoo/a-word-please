import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavBar from 'react-bootstrap/Navbar';
import * as actions from './store/actions';

import AlertGroup from './components/AlertGroup';
import AboutModal from './components/AboutModal';
import ReleaseNotesModal from './components/ReleaseNotesModal';
import RulesModal from './components/RulesModal';
import * as selectors from './store/selectors';
import { routePrefix, SITE_TITLE } from './constants';

function Layout({ children }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const navigateHome = (e) => { e.preventDefault(); history.push(`/`) };
  const onShowRulesModal = () => dispatch(actions.toggleRulesModal({ show: true }));
  const onShowAboutModal = () => dispatch(actions.toggleAboutModal({ show: true }));
  const onShowReleaseNotesModal = () => dispatch(actions.toggleReleaseNotesModal({ show: true }));

  const showRulesModal = useSelector(selectors.showRulesModalSelector);
  const showAboutModal = useSelector(selectors.showAboutModalSelector);
  const showReleaseNotesModal = useSelector(selectors.showReleaseNotesModalSelector);

  return (
    <Container>
      <NavBar variant='dark'>
        <Nav className="mr-auto">
          <NavBar.Brand onClick={navigateHome} href={`${routePrefix}/`}>{SITE_TITLE}</NavBar.Brand>
          <Nav.Link href="#" onClick={onShowRulesModal}>How to play</Nav.Link>
          <Nav.Link href="#" onClick={onShowAboutModal}>About</Nav.Link>
          <Nav.Link href="#" onClick={onShowReleaseNotesModal}>Release Notes</Nav.Link>
          <Nav.Link href="https://www.buymeacoffee.com/gkoo" target="_blank">
            Buy me a coffee
          </Nav.Link>
        </Nav>
      </NavBar>
      <AlertGroup />
      {children}
      <RulesModal show={showRulesModal} />
      <AboutModal show={showAboutModal} />
      <ReleaseNotesModal show={showReleaseNotesModal} />
    </Container>
  );
}

export default Layout;
