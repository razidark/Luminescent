/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useImperativeHandle, forwardRef, WheelEvent, MouseEvent, TouchEvent, ReactNode, useEffect, useCallback } from 'react';

export interface ZoomPanRef {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  zoomToActualSize: () => void;
}

interface ZoomPanWrapperProps {
  children: ReactNode;
  minScale?: number;
  maxScale?: number;
  zoomStep?: number;
  imageRef: React.RefObject<HTMLImageElement>;
  imageUrl: string | null;
}

const getTouchDistance = (touches: React.TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
};

const ZoomPanWrapper = forwardRef<ZoomPanRef, ZoomPanWrapperProps>(({
  children,
  minScale = 0.5,
  maxScale = 8,
  zoomStep = 0.2,
  imageRef,
  imageUrl,
}, ref) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const isSpacebarPressed = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const pinchStartDistance = useRef(0);
  
  const getCursor = () => {
    if (isPanning.current) return 'grabbing';
    if (isSpacebarPressed.current) return 'grab';
    return 'default';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
        return;
      }
      if (e.code === 'Space' && !isSpacebarPressed.current) {
        e.preventDefault();
        isSpacebarPressed.current = true;
        if(containerRef.current) containerRef.current.style.cursor = getCursor();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacebarPressed.current = false;
        if(isPanning.current) {
            isPanning.current = false;
        }
        if(containerRef.current) containerRef.current.style.cursor = getCursor();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const clampPosition = (pos: { x: number; y: number; }, currentScale: number) => {
    if (!containerRef.current) return pos;

    const contentWidth = containerRef.current.clientWidth;
    const contentHeight = containerRef.current.clientHeight;

    const scaledWidth = contentWidth * currentScale;
    const scaledHeight = contentHeight * currentScale;

    const maxPanX = Math.max(0, (scaledWidth - contentWidth) / 2);
    const maxPanY = Math.max(0, (scaledHeight - contentHeight) / 2);

    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, pos.x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, pos.y)),
    };
  };

  const updateZoom = (newScale: number, centerX: number, centerY: number) => {
    const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
    
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const mouseRelX = centerX - rect.left;
    const mouseRelY = centerY - rect.top;

    const newX = mouseRelX - (mouseRelX - position.x) * (clampedScale / scale);
    const newY = mouseRelY - (mouseRelY - position.y) * (clampedScale / scale);

    const newPosition = clampPosition({ x: newX, y: newY }, clampedScale);

    setPosition(newPosition);
    setScale(clampedScale);
  };

  const fitToScreen = useCallback(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image || !image.naturalWidth || !image.naturalHeight) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    
    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    const newScale = Math.min(scaleX, scaleY);

    setScale(Math.min(newScale, maxScale));
    setPosition({ x: 0, y: 0 });
  }, [imageRef, maxScale]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const handleLoadAndResize = () => {
        fitToScreen();
    };
    
    // Attach resize listener once the image is confirmed loaded.
    const handleLoad = () => {
        fitToScreen();
        window.addEventListener('resize', handleLoadAndResize);
    };

    if (image.complete) {
        handleLoad();
    } else {
        image.addEventListener('load', handleLoad, { once: true });
    }

    return () => {
        if (image) {
            image.removeEventListener('load', handleLoad);
        }
        window.removeEventListener('resize', handleLoadAndResize);
    };
  }, [imageRef, fitToScreen, imageUrl]);
  
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const newScale = scale - e.deltaY * 0.001 * scale;
      updateZoom(newScale, e.clientX, e.clientY);
    }
  };
  
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (isSpacebarPressed.current && e.button === 0) {
      e.preventDefault();
      isPanning.current = true;
      startPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      if (containerRef.current) containerRef.current.style.cursor = getCursor();
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isPanning.current) {
      e.preventDefault();
      const newPos = {
        x: e.clientX - startPos.current.x,
        y: e.clientY - startPos.current.y,
      };
      setPosition(clampPosition(newPos, scale));
    }
  };

  const handleMouseUp = () => {
    isPanning.current = false;
    if (containerRef.current) containerRef.current.style.cursor = getCursor();
  };
  
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 2) {
          isPanning.current = false;
          pinchStartDistance.current = getTouchDistance(e.touches);
      } else if (e.touches.length > 2) { // Use 3+ fingers to pan
          isPanning.current = true;
          startPos.current = {
              x: e.touches[0].clientX - position.x,
              y: e.touches[0].clientY - position.y,
          };
      }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
      if (isPanning.current && e.touches.length > 2) {
          const newPos = {
              x: e.touches[0].clientX - startPos.current.x,
              y: e.touches[0].clientY - position.y,
          };
          setPosition(clampPosition(newPos, scale));
      } else if (e.touches.length === 2) {
          const currentDistance = getTouchDistance(e.touches);
          if (pinchStartDistance.current > 0) {
              const scaleFactor = currentDistance / pinchStartDistance.current;
              const newScale = scale * scaleFactor;
              
              const touch1 = e.touches[0];
              const touch2 = e.touches[1];
              const midX = (touch1.clientX + touch2.clientX) / 2;
              const midY = (touch1.clientY + touch2.clientY) / 2;
              
              updateZoom(newScale, midX, midY);
          }
          pinchStartDistance.current = currentDistance;
      }
  };

  const handleTouchEnd = () => {
      isPanning.current = false;
      pinchStartDistance.current = 0;
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
        if (!containerRef.current) return;
        const { clientWidth, clientHeight, offsetLeft, offsetTop } = containerRef.current;
        updateZoom(scale + zoomStep, offsetLeft + clientWidth / 2, offsetTop + clientHeight / 2);
    },
    zoomOut: () => {
        if (!containerRef.current) return;
        const { clientWidth, clientHeight, offsetLeft, offsetTop } = containerRef.current;
        updateZoom(scale - zoomStep, offsetLeft + clientWidth / 2, offsetTop + clientHeight / 2);
    },
    reset: fitToScreen,
    zoomToActualSize: () => {
        if (!containerRef.current || !imageRef.current) return;
        const naturalWidth = imageRef.current.naturalWidth;
        const displayedWidthAtCurrentScale = imageRef.current.clientWidth;
        if (!naturalWidth || !displayedWidthAtCurrentScale) return;
  
        const displayedWidthAtScale1 = displayedWidthAtCurrentScale / scale;
        if (displayedWidthAtScale1 === 0) return;
        const newScale = naturalWidth / displayedWidthAtScale1;
        
        const { clientWidth, clientHeight } = containerRef.current;
        const rect = containerRef.current.getBoundingClientRect();
        updateZoom(newScale, rect.left + clientWidth / 2, rect.top + clientHeight / 2);
    }
  }));

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden touch-none"
      style={{ cursor: getCursor() }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="w-full h-full flex justify-center items-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isPanning.current ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
});

export default ZoomPanWrapper;
