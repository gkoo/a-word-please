import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fabric } from 'fabric';

import SubjectCards from './SubjectCards';
import { clearStrokes, saveStroke } from '../../store/actions';
import { canvasWidth, canvasHeight } from '../../constants/sfArtist';
import {
  activePlayerSelector,
  currPlayerSelector,
  currPlayerIsActivePlayerSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function DrawingPhase() {
  const [canvas, setCanvas] = useState(null);

  const canvasRef = useRef(null);

  const dispatch = useDispatch();

  const activePlayer = useSelector(activePlayerSelector);
  const currPlayer = useSelector(currPlayerSelector);
  const currPlayerIsActivePlayer = useSelector(currPlayerIsActivePlayerSelector);
  const gameData = useSelector(gameDataSelector);

  const socket = useSelector(socketSelector);

  const { turnNum, totalTurns } = gameData;

  // Receive path data from server and add it to canvas
  useEffect(() => {
    if (!socket) { return; }
    if (!canvas) { return; }

    const handleNewStroke = (pathData) => {
      dispatch(saveStroke(pathData));
      const path = new fabric.Path(pathData.path, pathData);
      canvas.add(path);
    };

    socket.on('newStroke', handleNewStroke);

    return () => {
      socket.removeAllListeners('newStroke');
    };
  }, [socket, canvas, dispatch]);

  // Set up the fabric Canvas object
  useEffect(() => {
    const canvasEl = canvasRef.current;

    if (!canvasEl) { return; }

    dispatch(clearStrokes());
    const fabricCanvas = new fabric.Canvas(canvasEl, {
      backgroundColor: '#fff',
      hoverCursor: 'arrow',
    });
    fabricCanvas.freeDrawingBrush.color = currPlayer?.brushColor;
    fabricCanvas.freeDrawingBrush.width = 2;
    setCanvas(fabricCanvas);
  }, [canvasRef, dispatch, currPlayer?.brushColor]);

  // Handle new path data created locally and send to server
  useEffect(() => {
    if (!socket) { return; }
    if (!canvas) { return; }

    canvas.on('path:created', (evt) => {
      const { path } = evt;
      path.set({ selectable: false, stroke: currPlayer?.brushColor });

      // Issues having the canvas actually add the path if we disable drawing mode too early
      setTimeout(() => {
        canvas.isDrawingMode = false;
      }, 50);

      const pathData = path.toObject();

      socket.emit('playerAction', {
        action: 'newStroke',
        path: pathData,
      });
      dispatch(saveStroke(pathData));
    });
  }, [socket, canvas, dispatch, currPlayer?.brushColor]);

  // Toggle drawing mode based on if it is the current player's turn
  useEffect(() => {
    if (!canvas) { return; }
    canvas.isDrawingMode = currPlayerIsActivePlayer;
  }, [currPlayerIsActivePlayer, canvas]);

  return (
    <>
      <SubjectCards hideFromFake={true}/>
      <div className='text-center my-5'>
        <canvas
          id='c'
          width={canvasWidth}
          height={canvasHeight}
          ref={canvasRef}
        />
      </div>
      <h2 className='text-center my-2'>
        <span style={{color: activePlayer?.brushColor}}>● </span>
        {activePlayer?.name}'s turn</h2>
      {
        currPlayerIsActivePlayer &&
          <p>
            It's your turn to draw! You can only draw <strong>one</strong> contiguous brushstroke. Once
            you have added that brushstroke, your turn will be over.
          </p>
      }
      <p>Turns left: {totalTurns - turnNum}</p>
    </>
  );
}

export default DrawingPhase;
