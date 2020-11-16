import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fabric } from 'fabric';

import BrushColorLabels from './BrushColorLabels';
import SubjectCards from './SubjectCards';
import { clearStrokes, saveStroke } from '../../store/actions';
import { canvasWidth, canvasHeight } from '../../constants/sfArtist';
import {
  activePlayerSelector,
  currPlayerSelector,
  currPlayerIsActivePlayerSelector,
  gameDataSelector,
  playersSelector,
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
  const players = useSelector(playersSelector);

  const socket = useSelector(socketSelector);

  const { turnNum, totalTurns } = gameData;

  useEffect(() => {
    dispatch(clearStrokes());
  }, [dispatch]);

  // Receive path data from server and add it to canvas
  useEffect(() => {
    if (!socket) { return; }
    if (!canvas) { return; }

    const handleNewStroke = (pathData) => {
      dispatch(saveStroke(pathData));
      const path = new fabric.Path(pathData.path, pathData);
      path.set({ selectable: false });
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

    const fabricCanvas = new fabric.Canvas(canvasEl, {
      backgroundColor: '#fff',
      hoverCursor: 'arrow',
    });
    setCanvas(fabricCanvas);
  }, [canvasRef, dispatch]);

  // Set the brush color and width
  useEffect(() => {
    if (!canvas) { return; }
    canvas.freeDrawingBrush.color = currPlayer?.brushColor;
    canvas.freeDrawingBrush.width = 2;
  }, [canvas]);

  // Handle new path data created locally and send to server
  useEffect(() => {
    if (!socket) { return; }
    if (!canvas) { return; }

    if (!currPlayer) { return; }

    canvas.on('path:created', (evt) => {
      const { path } = evt;
      path.set({ selectable: false, stroke: currPlayer.brushColor });

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
  }, [socket, canvas, dispatch]);

  // Toggle drawing mode based on if it is the current player's turn
  useEffect(() => {
    if (!canvas) { return; }
    canvas.isDrawingMode = currPlayerIsActivePlayer;
  }, [currPlayerIsActivePlayer, canvas]);

  if (!activePlayer) { return false; }

  let displayOrder = [];
  const { playerOrder } = gameData;
  const activePlayerIdx = gameData.playerOrder.indexOf(activePlayer.id);
  const playerIdsInOrder = displayOrder.concat(
    playerOrder.slice(activePlayerIdx + 1)
  ).concat(
    playerOrder.slice(0, activePlayerIdx)
  );
  const playersInOrder = playerIdsInOrder.map(playerId => players[playerId]);

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
      <p className='text-center'>Turns left: {totalTurns - turnNum}</p>
      {
        currPlayerIsActivePlayer &&
          <p>
            It's your turn to draw! You can only draw <strong>one</strong> contiguous brushstroke.
            Once you have added that brushstroke, your turn will be over.
          </p>
      }
      <h2 className='text-center my-2'>
        <span className='sf-artist-player-dot' style={{color: activePlayer?.brushColor}}>● </span>
        {activePlayer.name}'s turn
      </h2>
      <BrushColorLabels players={playersInOrder}/>
    </>
  );
}

export default DrawingPhase;
