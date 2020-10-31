import React from 'react';

import cx from 'classnames';

import { useSelector } from 'react-redux';
import { SPECTRUM_MAX_VALUE, SPECTRUM_BAND_WIDTH } from '../../constants';
import * as selectors from '../../store/selectors';

function SpectrumBands({ bandSelections }) {
  const spectrumValue = useSelector(selectors.spectrumValueSelector);

  // + 1/4 -----> - 1/4
  //
  // Adjust for UI toggle weirdness
  // very left edge needs to add SPECTRUM_BAND_WIDTH * 1/4
  // very right edge needs to subtract SPECTRUM_BAND_WIDTH * 1/4
  const uiFix = SPECTRUM_BAND_WIDTH * (SPECTRUM_MAX_VALUE/2 - spectrumValue)/400;

  const band1LeftBound = (spectrumValue - (SPECTRUM_BAND_WIDTH*5/2));
  const leftMarginPct = (band1LeftBound + uiFix)*100/SPECTRUM_MAX_VALUE;

  return (
    <div className='band-container'>
      <div className='band-group' style={{ left: `${leftMarginPct}%` }}>
        <div
          className={cx('spectrum-band band2', { selected: bandSelections?.firstBand })}
        />
        <div className={cx('spectrum-band band3', { selected: bandSelections?.secondBand })}/>
        <div className={cx('spectrum-band band4', { selected: bandSelections?.thirdBand })}/>
        <div className={cx('spectrum-band band3', { selected: bandSelections?.fourthBand })}/>
        <div className={cx('spectrum-band band2', { selected: bandSelections?.fifthBand })}/>
      </div>
    </div>
  );
}

export default SpectrumBands;
