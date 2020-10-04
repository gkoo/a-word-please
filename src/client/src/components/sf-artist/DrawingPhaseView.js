import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { fabric } from 'fabric';

import SubjectCards from './SubjectCards';
import {
  activePlayerSelector,
  currPlayerIsActivePlayerSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function DrawingPhase() {
  const [canvas, setCanvas] = useState(null);

  const canvasRef = useRef(null);

  const activePlayer = useSelector(activePlayerSelector);
  const currPlayerIsActivePlayer = useSelector(currPlayerIsActivePlayerSelector);
  const gameData = useSelector(gameDataSelector);

  const socket = useSelector(socketSelector);

  const { turnNum, totalTurns } = gameData;

  // Receive path data from server and add it to canvas
  useEffect(() => {
    if (!socket) { return; }
    if (!canvas) { return; }

    const handleNewStroke = (data) => {
      const path = new fabric.Path(data, {
        fill: 'transparent',
        selectable: false,
        strokeWidth: 1,
        stroke: 'black',
      });

      canvas.add(path);
    };

    socket.on('newStroke', handleNewStroke);

    return () => {
      socket.removeAllListeners('newStroke');
    };
  }, [socket, canvas]);

  // Set up the fabric Canvas object
  useEffect(() => {
    if (!socket) { return; }
    const canvasEl = canvasRef.current;

    if (!canvasEl) { return; }

    const fabricCanvas = new fabric.Canvas(canvasEl, {
      backgroundColor: '#fff',
      hoverCursor: 'arrow',
    });
    setCanvas(fabricCanvas);
  }, [canvasRef, socket]);

  // Handle new path data created locally and send to server
  useEffect(() => {
    if (!socket) { return; }
    if (!canvas) { return; }

    canvas.on('path:created', (evt) => {
      // send JSON.stringify(evt.path).path
      evt.path.set('selectable', false);

      // Issues having the canvas actually add the path if we disable drawing mode too early
      setTimeout(() => {
        canvas.isDrawingMode = false;
      }, 50);

      socket.emit('playerAction', {
        action: 'newStroke',
        path: evt.path.toObject().path,
      });
    });
  }, [socket, canvas]);

  // Toggle drawing mode based on if it is the current player's turn
  useEffect(() => {
    if (!canvas) { return; }
    canvas.isDrawingMode = currPlayerIsActivePlayer;
  }, [currPlayerIsActivePlayer, canvas]);

  return (
    <>
      <SubjectCards hideFromFake={true}/>
      <div style={{ border: '1px solid #00f' }} className='text-center my-5'>
        <canvas
          id='c'
          width='300'
          height='300'
          ref={canvasRef}
        />
      </div>
      <h2 className='text-center my-2'>{activePlayer?.name}'s turn</h2>
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
