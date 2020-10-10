import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { fabric } from 'fabric';

import { canvasWidth, canvasHeight } from '../../constants/sfArtist';
import {
  strokesSelector,
} from '../../store/selectors';

function FinalCanvas() {
  const canvasRef = useRef(null);
  const strokes = useSelector(strokesSelector);

  useEffect(() => {
    const canvasEl = canvasRef.current;

    if (!canvasEl) { return; }
    if (!strokes) { return; }

    const fabricCanvas = new fabric.Canvas(canvasEl, {
      backgroundColor: '#fff',
      hoverCursor: 'arrow',
    });

    strokes.forEach(pathData => {
      const path = new fabric.Path(pathData.path, pathData);

      fabricCanvas.add(path);
    });
  }, [canvasRef, strokes]);

  return (
    <div className='text-center my-5'>
      <canvas
        width={canvasWidth}
        height={canvasHeight}
        ref={canvasRef}
      />
    </div>
  );
}

export default FinalCanvas;
