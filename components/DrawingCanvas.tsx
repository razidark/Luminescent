/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';

export interface DrawingCanvasRef {
  clear: () => void;
  undo: () => void;
  redo: () => void;
  invert: () => void;
  getMaskAsFile: () => File | null;
  drawRects: (rects: Array<{ ymin: number; xmin: number; ymax: number; xmax: number }>) => void;
  drawMaskImage: (maskDataUrl: string) => void;
  exportCanvas: (mode?: 'mask' | 'image') => string | null;
}

interface DrawingCanvasProps {
  imageElement: HTMLImageElement;
  brushSize: number;
  brushColor: string;
  onDrawEnd: (dataUrl: string | null) => void;
  tool?: 'brush' | 'eraser';
}

type Point = { x: number, y: number };
type DrawAction = 
  | { type: 'stroke', points: Point[], size: number, color: string, tool: 'brush' | 'eraser' }
  | { type: 'rects', rects: Array<{ ymin: number; xmin: number; ymax: number; xmax: number }> }
  | { type: 'mask', image: HTMLImageElement }
  | { type: 'invert' };

const DrawingCanvas = React.forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ imageElement, brushSize, brushColor, onDrawEnd, tool = 'brush' }, ref) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const isDrawing = React.useRef(false);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  
  // History State
  const history = React.useRef<DrawAction[]>([]);
  const redoStack = React.useRef<DrawAction[]>([]);
  const currentStroke = React.useRef<Point[]>([]);
  
  // Used to toggle cursor visibility
  const [isHovering, setIsHovering] = React.useState(false);

  const redraw = React.useCallback(() => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!canvas || !context || canvas.width === 0 || canvas.height === 0) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      history.current.forEach(action => {
          if (action.type === 'invert') {
              context.globalCompositeOperation = 'source-out';
              context.fillStyle = brushColor;
              context.fillRect(0, 0, canvas.width, canvas.height);
              context.globalCompositeOperation = 'source-over';
          } else if (action.type === 'stroke') {
              context.globalCompositeOperation = action.tool === 'eraser' ? 'destination-out' : 'source-over';
              if (action.points.length === 0) return;
              
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
              context.globalCompositeOperation = 'source-over';
              context.fillStyle = brushColor; 
              action.rects.forEach(rect => {
                  const x = (rect.xmin / 1000) * canvas.width;
                  const y = (rect.ymin / 1000) * canvas.height;
                  const w = ((rect.xmax - rect.xmin) / 1000) * canvas.width;
                  const h = ((rect.ymax - rect.ymin) / 1000) * canvas.height;
                  context.fillRect(x, y, w, h);
              });
          } else if (action.type === 'mask') {
              // Draw the mask image
              // The mask image is expected to be B&W. We want to treat white as "filled" and color it.
              
              // Save context state
              context.save();
              
              // Draw the mask image (White = subject, Black = bg)
              // We want to turn Black to Transparent, White to BrushColor.
              // We can use a temporary canvas for this operation.
              const tempC = document.createElement('canvas');
              tempC.width = canvas.width;
              tempC.height = canvas.height;
              const tempCtx = tempC.getContext('2d');
              if (tempCtx) {
                  tempCtx.drawImage(action.image, 0, 0, tempC.width, tempC.height);
                  
                  // Convert black/dark pixels to transparent, white to opaque
                  const imgData = tempCtx.getImageData(0, 0, tempC.width, tempC.height);
                  const data = imgData.data;
                  for(let i = 0; i < data.length; i+=4) {
                      const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
                      if (brightness < 128) {
                          data[i+3] = 0; // Transparent
                      } else {
                          data[i+3] = 255; // Opaque
                      }
                  }
                  tempCtx.putImageData(imgData, 0, 0);
                  
                  // Now colorize it
                  tempCtx.globalCompositeOperation = 'source-in';
                  tempCtx.fillStyle = brushColor;
                  tempCtx.fillRect(0, 0, tempC.width, tempC.height);
                  
                  // Draw temp canvas to main canvas
                  context.globalCompositeOperation = 'source-over';
                  context.drawImage(tempC, 0, 0);
              }
              
              context.restore();
          }
      });
      exportMask();
  }, [brushColor]);

  const updateCanvasSize = React.useCallback(() => {
    if (imageElement) {
      const { width, height } = imageElement.getBoundingClientRect();
      if (width > 0 && height > 0) {
          setSize({ width, height });
          requestAnimationFrame(redraw);
      }
    }
  }, [imageElement, redraw]);

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

  // ... (getCoords, startDrawing, draw, exportMask, stopDrawing remain same)
  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number, y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    redoStack.current = []; // Clear redo stack on new action
    const coords = getCoords(e);
    currentStroke.current = [coords];
    
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    
    context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
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
    if (cursorRef.current) {
        cursorRef.current.style.left = `${e.nativeEvent.offsetX}px`;
        cursorRef.current.style.top = `${e.nativeEvent.offsetY}px`;
        
        if (tool === 'eraser') {
            cursorRef.current.style.borderColor = 'rgba(255, 255, 255, 0.9)';
            cursorRef.current.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            cursorRef.current.style.boxShadow = '0 0 0 1px rgba(0, 0, 0, 0.5)';
        } else {
            cursorRef.current.style.borderColor = brushColor;
            cursorRef.current.style.backgroundColor = 'rgba(0,0,0,0.1)';
            cursorRef.current.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.6)';
        }
    }

    if (!isDrawing.current) return;
    const coords = getCoords(e);
    currentStroke.current.push(coords);
    
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    
    context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    context.lineTo(coords.x, coords.y);
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
  };

  const exportMask = (mode: 'mask' | 'image' = 'mask') => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (canvas.width === 0 || canvas.height === 0 || size.width === 0 || size.height === 0) {
          return null;
      }

      if (history.current.length === 0) {
          onDrawEnd(null);
          return null;
      }

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
          onDrawEnd(null);
          return null;
      };
      
      tempCanvas.width = imageElement.naturalWidth;
      tempCanvas.height = imageElement.naturalHeight;
      
      if (tempCanvas.width === 0 || tempCanvas.height === 0) {
          return null;
      }

      tempCtx.scale(
        imageElement.naturalWidth / size.width,
        imageElement.naturalHeight / size.height
      );
      
      try {
        tempCtx.drawImage(canvas, 0, 0);
      } catch (e) {
        console.warn("Failed to export mask:", e);
        return null;
      }

      if (mode === 'mask') {
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imageData.data;
          let hasPixels = false;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { 
              data[i] = 0;
              data[i + 1] = 0;
              data[i + 2] = 0;
              data[i + 3] = 255;
              hasPixels = true;
            }
          }
          
          if (!hasPixels) {
              onDrawEnd(null);
              return null;
          }
          tempCtx.putImageData(imageData, 0, 0);
      } else {
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imageData.data;
          let hasPixels = false;
          for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] > 0) {
                  hasPixels = true;
                  break;
              }
          }
          if (!hasPixels) {
              onDrawEnd(null);
              return null;
          }
      }

      const dataUrl = tempCanvas.toDataURL('image/png');
      onDrawEnd(dataUrl);
      return dataUrl;
    }
    return null;
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    
    if (currentStroke.current.length > 0) {
        history.current.push({
            type: 'stroke',
            points: currentStroke.current,
            size: brushSize,
            color: brushColor,
            tool: tool
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
      redoStack.current = [];
      redraw();
    },
    undo() {
        if (history.current.length > 0) {
            const action = history.current.pop();
            if (action) redoStack.current.push(action);
            redraw();
        }
    },
    redo() {
        if (redoStack.current.length > 0) {
            const action = redoStack.current.pop();
            if (action) history.current.push(action);
            redraw();
        }
    },
    invert() {
        history.current.push({ type: 'invert' });
        redoStack.current = [];
        redraw();
    },
    getMaskAsFile: () => null, 
    drawRects(rects) {
      history.current.push({ type: 'rects', rects });
      redoStack.current = [];
      redraw();
    },
    drawMaskImage(maskDataUrl) {
        const img = new Image();
        img.onload = () => {
            history.current.push({ type: 'mask', image: img });
            redoStack.current = [];
            redraw();
        };
        img.src = maskDataUrl;
    },
    exportCanvas: (mode) => exportMask(mode)
  }));

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <canvas
          ref={canvasRef}
          width={size.width}
          height={size.height}
          className={`w-full h-full pointer-events-auto ${tool === 'eraser' ? 'cursor-none' : 'cursor-none'}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={() => { stopDrawing(); setIsHovering(false); }}
          onMouseEnter={() => setIsHovering(true)}
        />
        <div
            ref={cursorRef}
            className="absolute rounded-full pointer-events-none transition-opacity duration-75 will-change-transform"
            style={{
                width: brushSize,
                height: brushSize,
                transform: 'translate(-50%, -50%)',
                border: tool === 'eraser' ? '2px solid rgba(255, 255, 255, 0.8)' : `2px solid ${brushColor}`,
                boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.3)', 
                backgroundColor: tool === 'eraser' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                opacity: isHovering ? 1 : 0,
                left: 0, 
                top: 0
            }}
        />
    </div>
  );
});

export default DrawingCanvas;