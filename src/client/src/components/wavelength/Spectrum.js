import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'

import * as selectors from '../../store/selectors';

function Spectrum({ disabled, showSlider, value }) {
  const currConcept = useSelector(selectors.currConceptSelector);
  const spectrumValue = useSelector(selectors.spectrumValueSelector);
  const leftEmptyBandWidth = (spectrumValue - 25)*100/180;

  return (
    <>
      <div className='band-group'>
        <div className='spectrum-band' style={{ width: `${leftEmptyBandWidth}%` }}/> {/* empty band */}
        <div className='spectrum-band band2'/>
        <div className='spectrum-band band3'/>
        <div className='spectrum-band band4'/>
        <div className='spectrum-band band3'/>
        <div className='spectrum-band band2'/>
      </div>
      <Form>
        <Form.Control
          type="range"
          min={0}
          max={180}
          value={value}
          disabled={disabled}
        />
      </Form>
      <Row>
        <Col md={{ span: 6 }} className='text-left'>
          {currConcept[0]}
        </Col>
        <Col md={{ span: 6 }} className='text-right'>
          {currConcept[1]}
        </Col>
      </Row>
    </>
  );
}

export default Spectrum;
