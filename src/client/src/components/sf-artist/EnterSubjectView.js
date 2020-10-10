import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {
  socketSelector,
} from '../../store/selectors';

function EnterSubjectView() {
  const [subject, setSubject] = useState(null);
  const [category, setCategory] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const socket = useSelector(socketSelector);

  const onSubmit = (e) => {
    e.preventDefault();

    if (!subject || !category) { return; }

    socket.emit('playerAction', {
      action: 'submitSubject',
      subject,
      category,
    });
    setButtonDisabled(true);
  };

  return (
    <>
      <Row>
        <Col sm={{ offset: 1, span: 10 }} md={{ offset: 2, span: 8 }} lg={{ offset: 3, span: 6 }}>
          <h3 className='my-3'>Please enter a subject to draw</h3>
          <Form onSubmit={onSubmit}>
            <Form.Group controlId='subject'>
              <Form.Label>Subject</Form.Label>
              <Form.Control type='text' onChange={(evt) => setSubject(evt.target.value)}/>
            </Form.Group>

            <Form.Group controlId='category'>
              <Form.Label>Category</Form.Label>
              <Form.Control type='text' onChange={(evt) => setCategory(evt.target.value)}/>
            </Form.Group>

            <Button disabled={buttonDisabled} type='submit'>
              {/* TODO: Change label after click */}
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </>
  );
}

export default EnterSubjectView;
