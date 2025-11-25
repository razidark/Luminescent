
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';

export interface DrawingCanvasRef {
  clear: () => void;
  undo: () => void;
  getMaskAsFile: () => File | null;
  drawRects: (rects: Array<{ ymin: number; xmin: number; ymax: number; xmax: number }>) => void;
}

interface DrawingCanvasProps {
  imageElement: HTMLImageElement;
  brushSize: number;
  brushColor: string;
  onDrawEnd: (dataUrl: string | null) => void;
}

type Point = { x: number, y: number };
type DrawAction = 
  | { type: 'stroke', points: Point[], size: number, color: string }
  | { type: 'rects', rects: Array<{ ymin: number; xmin: number; ymax: number; xmax: number }> };

const DrawingCanvas = React.forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ imageElement, brushSize, brushColor, onDrawEnd }, ref) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const isDrawing = React.useRef(false);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  
  // History State
  const history = React.useRef<DrawAction[]>([]);
  const currentStroke = React.useRef<Point[]>([]);
  
  // Used to toggle cursor visibility
  const [isHovering, setIsHovering] = React.useState(false);

  const updateCanvasSize = React.useCallback(() => {
    if (imageElement) {
      const { width, height } = imageElement.getBoundingClientRect();
      setSize({ width, height });
      // We need to redraw history when size changes to keep relative positions if we were storing relative coords,
      // but here we rely on the canvas scaling. For robust resizing, we'd clear and redraw.
      // For now, simple resize might clear canvas, so we should redraw history.
      requestAnimationFrame(redraw);
    }
  }, [imageElement]);

  React.useEffect(() => {
    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (imageElement) {
      resizeObserver.observe(imageElement);
    }
    return () => {
      if (imageElement) {
        resizeObserver.unobserve(imageElement);
      }
    };
  }, [imageElement, updateCanvasSize]);

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number, y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const coords = getCoords(e);
    currentStroke.current = [coords];
    
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    
    context.beginPath();
    context.moveTo(coords.x, coords.y);
    // Draw a single dot in case they just click
    context.fillStyle = brushColor;
    context.beginPath();
    context.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
    context.fill();
    context.beginPath(); // Reset for path
    context.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Imperatively update cursor position for performance
    if (cursorRef.current) {
        cursorRef.current.style.left = `${e.nativeEvent.offsetX}px`;
        cursorRef.current.style.top = `${e.nativeEvent.offsetY}px`;
    }

    if (!isDrawing.current) return;
    const coords = getCoords(e);
    currentStroke.current.push(coords);
    
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    
    context.lineTo(coords.x, coords.y);
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
  };

  const redraw = () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!canvas || !context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      history.current.forEach(action => {
          if (action.type === 'stroke') {
              if (action.points.length === 0) return;
              
              // Handle single point (dot)
              if (action.points.length === 1) {
                  context.fillStyle = action.color;
                  context.beginPath();
                  context.arc(action.points[0].x, action.points[0].y, action.size / 2, 0, Math.PI * 2);
                  context.fill();
                  return;
              }

              context.beginPath();
              context.moveTo(action.points[0].x, action.points[0].y);
              for (let i = 1; i < action.points.length; i++) {
                  context.lineTo(action.points[i].x, action.points[i].y);
              }
              context.strokeStyle = action.color;
              context.lineWidth = action.size;
              context.lineCap = 'round';
              context.lineJoin = 'round';
              context.stroke();
          } else if (action.type === 'rects') {
              context.fillStyle = brushColor; // Use current brush color for rects consistency
              action.rects.forEach(rect => {
                  const x = (rect.xmin / 1000) * canvas.width;
                  const y = (rect.ymin / 1000) * canvas.height;
                  const w = ((rect.xmax - rect.xmin) / 1000) * canvas.width;
                  const h = ((rect.ymax - rect.ymin) / 1000) * canvas.height;
                  context.fillRect(x, y, w, h);
              });
          }
      });
      exportMask();
  };

  const exportMask = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // If history is empty, clear mask
      if (history.current.length === 0) {
          onDrawEnd(null);
          return;
      }

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
          onDrawEnd(null);
          return;
      };
      
      tempCanvas.width = imageElement.naturalWidth;
      tempCanvas.height = imageElement.naturalHeight;
      tempCtx.scale(
        imageElement.naturalWidth / size.width,
        imageElement.naturalHeight / size.height
      );
      tempCtx.drawImage(canvas, 0, 0);

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      let hasPixels = false;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) { // If pixel is not transparent
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 255;
          hasPixels = true;
        }
      }
      
      if (!hasPixels) {
          onDrawEnd(null);
          return;
      }

      tempCtx.putImageData(imageData, 0, 0);
      onDrawEnd(tempCanvas.toDataURL('image/png'));
    }
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    
    if (currentStroke.current.length > 0) {
        history.current.push({
            type: 'stroke',
            points: currentStroke.current,
            size: brushSize,
            color: brushColor
        });
    }
    
    const context = canvasRef.current?.getContext('2d');
    if (context) {
        context.closePath();
    }
    exportMask();
  };

  React.useImperativeHandle(ref, () => ({
    clear() {
      history.current = [];
      redraw();
    },
    undo() {
        if (history.current.length > 0) {
            history.current.pop();
            redraw();
        }
    },
    getMaskAsFile: () => null, 
    drawRects(rects) {
      history.current.push({ type: 'rects', rects });
      redraw();
    }
  }));

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <canvas
          ref={canvasRef}
          width={size.width}
          height={size.height}
          className="w-full h-full pointer-events-auto cursor-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={() => { stopDrawing(); setIsHovering(false); }}
          onMouseEnter={() => setIsHovering(true)}
        />
        {/* Cursor is conditionally rendered but position is updated via Ref/CSS */}
        <div
            ref={cursorRef}
            className="absolute rounded-full pointer-events-none transition-opacity duration-75 will-change-transform"
            style={{
                width: brushSize,
                height: brushSize,
                transform: 'translate(-50%, -50%)',
                border: '2px solid rgba(255, 50, 50, 0.8)',
                boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.6)', // White outline for better visibility
                backgroundColor: 'rgba(255, 50, 50, 0.1)',
                opacity: isHovering ? 1 : 0,
                left: 0, 
                top: 0
            }}
        />
    </div>
  );
});

export default DrawingCanvas;
