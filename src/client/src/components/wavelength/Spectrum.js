import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'

import * as selectors from '../../store/selectors';

function Spectrum({ guessValue, showBands, showSlider, value, bandSelections }) {
  const currConcept = useSelector(selectors.currConceptSelector);
  const spectrumValue = useSelector(selectors.spectrumValueSelector);
  const leftMargin = (spectrumValue - 25)*100/180;

  return (
    <>
      {
        showBands &&
          <div className='band-group'>
            <div
              className={cx('spectrum-band band2', { selected: bandSelections?.firstBand })}
              style={{ marginLeft: `${leftMargin}%` }}
            />
            <div className={cx('spectrum-band band3', { selected: bandSelections?.secondBand })}/>
            <div className={cx('spectrum-band band4', { selected: bandSelections?.thirdBand })}/>
            <div className={cx('spectrum-band band3', { selected: bandSelections?.fourthBand })}/>
            <div className={cx('spectrum-band band2', { selected: bandSelections?.fifthBand })}/>
          </div>
      }
      {
        showSlider &&
          <Form>
            <Form.Control
              type="range"
              min={0}
              max={180}
              value={spectrumValue}
              disabled
            />
          </Form>
      }
      {
        guessValue &&
          <Form>
            <Form.Control
              type="range"
              min={0}
              max={180}
              value={guessValue}
              disabled
            />
          </Form>
      }
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
