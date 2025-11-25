
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useImperativeHandle, forwardRef, WheelEvent, MouseEvent, TouchEvent, ReactNode, useEffect, useCallback } from 'react';

export interface ZoomPanRef {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  zoomToActualSize: () => void;
  rotateLeft: () => void;
  rotateRight: () => void;
  flipHorizontal: () => void;
  flipVertical: () => void;
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
  minScale = 0.1,
  maxScale = 20,
  zoomStep = 0.5,
  imageRef,
  imageUrl,
}, ref) => {
  // Use refs for state to avoid re-renders during gestures
  const transform = useRef({ x: 0, y: 0, scale: 1, rotation: 0, flipX: false, flipY: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isPanning = useRef(false);
  const isSpacebarPressed = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const pinchStartDistance = useRef(0);
  const pinchStartScale = useRef(1);
  const lastTapTime = useRef(0);
  
  // Helper to apply transforms directly to DOM
  const updateTransform = useCallback((animate = false) => {
    if (!contentRef.current) return;
    const { x, y, scale, rotation, flipX, flipY } = transform.current;
    
    contentRef.current.style.transition = animate ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
    contentRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale}) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`;
    
    // Update cursor based on state
    if (containerRef.current) {
        if (isPanning.current) containerRef.current.style.cursor = 'grabbing';
        else if (isSpacebarPressed.current) containerRef.current.style.cursor = 'grab';
        else containerRef.current.style.cursor = 'default';
    }
  }, []);

  const updateZoom = (newScale: number, centerX: number, centerY: number) => {
    const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
    const currentScale = transform.current.scale;
    
    if (!containerRef.current || clampedScale === currentScale) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the container
    const mouseRelX = centerX - rect.left;
    const mouseRelY = centerY - rect.top;

    const pointOnContentX = (mouseRelX - transform.current.x) / currentScale;
    const pointOnContentY = (mouseRelY - transform.current.y) / currentScale;
    
    const newX = mouseRelX - (pointOnContentX * clampedScale);
    const newY = mouseRelY - (pointOnContentY * clampedScale);

    transform.current = { ...transform.current, x: newX, y: newY, scale: clampedScale };
    updateTransform(false);
  };

  const fitToScreen = useCallback(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image || !image.naturalWidth || !image.naturalHeight) return;

    if (container.clientWidth === 0) {
        requestAnimationFrame(fitToScreen);
        return;
    }

    const containerWidth = container.clientWidth - 40; // padding
    const containerHeight = container.clientHeight - 40;
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    
    // If rotated 90 or 270, swap width/height for fitting calculation
    const rotation = Math.abs(transform.current.rotation % 360);
    const isVertical = rotation === 90 || rotation === 270;
    
    const effectiveImgWidth = isVertical ? imageHeight : imageWidth;
    const effectiveImgHeight = isVertical ? imageWidth : imageHeight;

    const scaleX = containerWidth / effectiveImgWidth;
    const scaleY = containerHeight / effectiveImgHeight;
    const newScale = Math.min(scaleX, scaleY, 1); 

    // Reset position to center
    const offsetX = (container.clientWidth - (imageWidth * newScale)) / 2;
    const offsetY = (container.clientHeight - (imageHeight * newScale)) / 2;

    transform.current = { ...transform.current, x: offsetX, y: offsetY, scale: newScale };
    updateTransform(true);
  }, [imageRef, updateTransform]);

  const zoomToActualSize = useCallback(() => {
        if (!containerRef.current || !imageRef.current) return;
        
        const { width, height, left, top } = containerRef.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        const currentScale = transform.current.scale;
        const pointOnContentX = (centerX - left - transform.current.x) / currentScale;
        const pointOnContentY = (centerY - top - transform.current.y) / currentScale;
        
        const targetScale = 1;
        const newX = (centerX - left) - (pointOnContentX * targetScale);
        const newY = (centerY - top) - (pointOnContentY * targetScale);

        transform.current = { ...transform.current, x: newX, y: newY, scale: targetScale };
        updateTransform(true);
  }, [updateTransform, imageRef]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const handleLoad = () => {
        // Reset rotation/flips on new image load
        transform.current = { x: 0, y: 0, scale: 1, rotation: 0, flipX: false, flipY: false };
        fitToScreen();
    };
    
    if (image.complete) {
        handleLoad();
    } else {
        image.addEventListener('load', handleLoad, { once: true });
    }
    
    window.addEventListener('resize', fitToScreen);

    return () => {
        window.removeEventListener('resize', fitToScreen);
    };
  }, [imageRef, fitToScreen, imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;
      
      if (e.code === 'Space' && !isSpacebarPressed.current) {
        e.preventDefault();
        isSpacebarPressed.current = true;
        updateTransform();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacebarPressed.current = false;
        isPanning.current = false;
        updateTransform();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [updateTransform]);
  
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    // Mouse wheel zoom disabled by request.
    // We only prevent default on zoom gestures (Ctrl+Wheel) to stop browser page zoom.
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  };
  
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // Double click detection
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime.current;
    if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        // Toggle between fit and 100%
        if (Math.abs(transform.current.scale - 1) < 0.1) {
            fitToScreen();
        } else {
            zoomToActualSize();
        }
    }
    lastTapTime.current = currentTime;

    if (e.button === 1 || (isSpacebarPressed.current && e.button === 0)) {
      e.preventDefault();
      isPanning.current = true;
      startPos.current = {
        x: e.clientX - transform.current.x,
        y: e.clientY - transform.current.y,
      };
      updateTransform();
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isPanning.current) {
      e.preventDefault();
      const newX = e.clientX - startPos.current.x;
      const newY = e.clientY - startPos.current.y;
      transform.current.x = newX;
      transform.current.y = newY;
      updateTransform(); 
    }
  };

  const handleMouseUp = () => {
    if (isPanning.current) {
        isPanning.current = false;
        updateTransform();
    }
  };
  
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
      // Double tap detection for touch
      if (e.touches.length === 1) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime.current;
        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            if (Math.abs(transform.current.scale - 1) < 0.1) {
                fitToScreen();
            } else {
                zoomToActualSize();
            }
        }
        lastTapTime.current = currentTime;
      }

      if (e.touches.length === 2) {
          isPanning.current = false;
          pinchStartDistance.current = getTouchDistance(e.touches);
          pinchStartScale.current = transform.current.scale;
      } else if (e.touches.length === 1 && isSpacebarPressed.current) {
          isPanning.current = true;
          startPos.current = {
              x: e.touches[0].clientX - transform.current.x,
              y: e.touches[0].clientY - transform.current.y,
          };
      }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 2) {
          e.preventDefault();
          const currentDistance = getTouchDistance(e.touches);
          if (pinchStartDistance.current > 0) {
              const scaleFactor = currentDistance / pinchStartDistance.current;
              const newScale = pinchStartScale.current * scaleFactor;
              
              const touch1 = e.touches[0];
              const touch2 = e.touches[1];
              const midX = (touch1.clientX + touch2.clientX) / 2;
              const midY = (touch1.clientY + touch2.clientY) / 2;
              
              updateZoom(newScale, midX, midY);
          }
      } else if (isPanning.current && e.touches.length === 1) {
          e.preventDefault();
          const newX = e.touches[0].clientX - startPos.current.x;
          const newY = e.touches[0].clientY - startPos.current.y;
          transform.current.x = newX;
          transform.current.y = newY;
          updateTransform();
      }
  };

  const handleTouchEnd = () => {
      isPanning.current = false;
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
        if (!containerRef.current) return;
        const { width, height, left, top } = containerRef.current.getBoundingClientRect();
        updateZoom(transform.current.scale + zoomStep, left + width / 2, top + height / 2);
    },
    zoomOut: () => {
        if (!containerRef.current) return;
        const { width, height, left, top } = containerRef.current.getBoundingClientRect();
        updateZoom(transform.current.scale - zoomStep, left + width / 2, top + height / 2);
    },
    reset: fitToScreen,
    zoomToActualSize: zoomToActualSize,
    rotateLeft: () => {
        transform.current.rotation -= 90;
        updateTransform(true);
    },
    rotateRight: () => {
        transform.current.rotation += 90;
        updateTransform(true);
    },
    flipHorizontal: () => {
        transform.current.flipX = !transform.current.flipX;
        updateTransform(true);
    },
    flipVertical: () => {
        transform.current.flipY = !transform.current.flipY;
        updateTransform(true);
    }
  }));

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden touch-none select-none relative bg-transparent"
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
        ref={contentRef}
        className="w-full h-full flex justify-center items-center origin-top-left absolute top-0 left-0 will-change-transform"
      >
        {children}
      </div>
    </div>
  );
});

export default ZoomPanWrapper;
