import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Layout from '../Layout';
import ListGroup from 'react-bootstrap/ListGroup'

import { API_BASE_URL, routePrefix } from '../constants';

function SessionIndex() {
  const [sessionsData, setSessionsData] = useState(null);

  useEffect(() => {
    window.fetch(`${API_BASE_URL}/api/sessions`).then(response => {
      response.json().then(data => setSessionsData(data));
    });
  }, []);

  return (
    <Layout>
      <Row>
        <Col xs={6}>
          <h1>Rooms</h1>
          <ListGroup>
            {
              sessionsData?.rooms &&
                sessionsData.rooms.map(roomCode => {
                  const parts = roomCode.split('-');
                  const code = parts.length > 1 ? parts[1] : parts[0];
                  return (
                    <ListGroup.Item key={roomCode}>
                      <Link to={`${routePrefix}/rooms/${code}`}>{code}</Link>
                    </ListGroup.Item>
                  );
                })
            }
          </ListGroup>
        </Col>
      </Row>
    </Layout>
  );
}

export default SessionIndex;
