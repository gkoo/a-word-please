import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import { fabric } from 'fabric';

import { socketSelector } from '../../store/selectors';

function SfArtistBoard() {
  const [canvas, setCanvas] = useState(null);
  const [lastPath, setLastPath] = useState(null);
  const [drawingModeEnabled, setDrawingModeEnabled] = useState(false);
  const canvasRef = useRef(null);

  const socket = useSelector(socketSelector);

  useEffect(() => {
    if (!socket) { return; }
    if (!canvas) { return; }

    socket.on('newStroke', handleNewStroke);

    return () => {
      socket.removeAllListeners('newStroke');
    };
  }, [socket, canvas]);

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

  useEffect(() => {
    if (!canvas) { return; }
    canvas.on('path:created', onPathCreated);
  }, [canvas]);

  const onPathCreated = (evt) => {
    // send JSON.stringify(evt.path).path
    setLastPath(evt.path.toObject().path);
    evt.path.set('selectable', false);

    setTimeout(() => {
      canvas.isDrawingMode = false;
      setDrawingModeEnabled(false);
    }, 50);

    socket.emit('playerAction', {
      action: 'newStroke',
      path: evt.path.toObject().path,
    });
  };

  const addPath = () => {
    const path = new fabric.Path(lastPath, {
      fill: 'transparent',
      strokeWidth: 1,
      stroke: 'black',
    });
    canvas.add(path);
  };

  const clearCanvas = () => {
    canvas.clear();
    canvas.setBackgroundColor('#fff');
  };

  const toggleDrawingMode = () => {
    canvas.isDrawingMode = !drawingModeEnabled;
    setDrawingModeEnabled(!drawingModeEnabled);
  };

  const handleNewStroke = (data) => {
    const path = new fabric.Path(data, {
      fill: 'transparent',
      strokeWidth: 1,
      stroke: 'black',
    });

    canvas.add(path);
  };

  return (
    <div>
      <h1>SF Artist</h1>
      <div style={{ border: '1px solid #00f' }}>
        <canvas
          id='c'
          width='300'
          height='300'
          ref={canvasRef}
        />
      </div>
      <p>Drawing mode is: {drawingModeEnabled ? 'on' : 'off'}</p>
      <Button onClick={toggleDrawingMode}>Toggle Drawing Mode</Button>
      <Button onClick={clearCanvas}>Clear Canvas</Button>
      <Button onClick={addPath}>Add Path</Button>
    </div>
  );
}

export default SfArtistBoard;
