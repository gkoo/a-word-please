import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'

import * as selectors from '../../store/selectors';
import { SPECTRUM_MAX_VALUE, SPECTRUM_BAND_WIDTH } from '../../constants';

function Spectrum({ guessValue, showBands, showSlider, value, bandSelections }) {
  const currConcept = useSelector(selectors.currConceptSelector);
  const spectrumValue = useSelector(selectors.spectrumValueSelector);

  const band1LeftBound = (spectrumValue - (SPECTRUM_BAND_WIDTH*5/2));
  // + 1/4 -----> - 1/4
  //
  // Adjust for UI toggle weirdness
  // very left edge needs to add SPECTRUM_BAND_WIDTH * 1/4
  // very right edge needs to subtract SPECTRUM_BAND_WIDTH * 1/4
  const uiFix = SPECTRUM_BAND_WIDTH * (SPECTRUM_MAX_VALUE/2 - spectrumValue)/400;
  //const band1Midpoint = band1LeftBound + SPECTRUM_BAND_WIDTH/2;
  const leftMarginPct = (band1LeftBound + uiFix)*100/SPECTRUM_MAX_VALUE;
  let sliderValueToDisplay;

  if (showSlider) {
    sliderValueToDisplay = spectrumValue;
  } else if (guessValue !== undefined && guessValue !== null) {
    sliderValueToDisplay = guessValue;
  }

  return (
    <>
      <div className='band-container'>
        {
          showBands &&
            <div className='band-group' style={{ left: `${leftMarginPct}%` }}>
              <div
                className={cx('spectrum-band band2', { selected: bandSelections?.firstBand })}
              />
              <div className={cx('spectrum-band band3', { selected: bandSelections?.secondBand })}/>
              <div className={cx('spectrum-band band4', { selected: bandSelections?.thirdBand })}/>
              <div className={cx('spectrum-band band3', { selected: bandSelections?.fourthBand })}/>
              <div className={cx('spectrum-band band2', { selected: bandSelections?.fifthBand })}/>
            </div>
        }
      </div>
      {
        (showSlider || (guessValue !== undefined && guessValue !== null)) &&
          <Form>
            <Form.Control
              type="range"
              min={0}
              max={SPECTRUM_MAX_VALUE}
              value={sliderValueToDisplay}
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
