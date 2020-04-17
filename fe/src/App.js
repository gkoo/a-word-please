import { connect } from 'react-redux';
import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';

import MessageLog from './components/MessageLog';

class App extends Component {
  componentDidMount() {
    const socket = socketIOClient('http://localhost:5000');
    socket.on('message', function(data) {
      console.log(data);
    });
  }

  render() {
    return <MessageLog />;
  }
}

const mapStateToProps = state => {
  return {
  };
};

const mapDispatchToProps = dispatch => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
