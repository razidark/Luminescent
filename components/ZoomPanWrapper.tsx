
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useImperativeHandle, forwardRef, WheelEvent, MouseEvent, TouchEvent, ReactNode, useEffect, useCallback } from 'react';

export interface ZoomPanRef {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  centerView: () => void;
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
    // We translate the element, then rotate/scale it.
    // Note: The element has origin-top-left style.
    contentRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale}) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`;
    
    // Update cursor based on state
    if (containerRef.current) {
        if (isPanning.current) containerRef.current.style.cursor = 'grabbing';
        else if (isSpacebarPressed.current) containerRef.current.style.cursor = 'grab';
        else containerRef.current.style.cursor = 'default';
    }
  }, []);

  const updateZoom = (newScale: number, centerX?: number, centerY?: number) => {
    const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
    const currentScale = transform.current.scale;
    
    if (!containerRef.current || clampedScale === currentScale) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // If no center provided (e.g. via button), zoom towards center of viewport
    const targetCenterX = centerX !== undefined ? centerX : rect.left + rect.width / 2;
    const targetCenterY = centerY !== undefined ? centerY : rect.top + rect.height / 2;

    // Calculate mouse position relative to the container
    const mouseRelX = targetCenterX - rect.left;
    const mouseRelY = targetCenterY - rect.top;

    const pointOnContentX = (mouseRelX - transform.current.x) / currentScale;
    const pointOnContentY = (mouseRelY - transform.current.y) / currentScale;
    
    const newX = mouseRelX - (pointOnContentX * clampedScale);
    const newY = mouseRelY - (pointOnContentY * clampedScale);

    transform.current = { ...transform.current, x: newX, y: newY, scale: clampedScale };
    updateTransform(true);
  };

  // Helper to calculate the center offset for a given rotation and scale
  const getCenterOffset = (scale: number, rotation: number) => {
      const container = containerRef.current;
      const image = imageRef.current;
      if (!container || !image) return { x: 0, y: 0 };

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const imgW = image.naturalWidth * scale;
      const imgH = image.naturalHeight * scale;

      // Convert rotation to radians
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // Center of image in local space (unrotated)
      // Account for flipping which changes the coordinate space relative to origin
      let cx = imgW / 2;
      let cy = imgH / 2;
      
      if (transform.current.flipX) cx = -cx;
      if (transform.current.flipY) cy = -cy;

      // Rotate this center point around (0,0)
      const rotatedCx = cx * cos - cy * sin;
      const rotatedCy = cx * sin + cy * cos;

      // We want this rotated center point to be at (containerWidth/2, containerHeight/2)
      // So Translate + RotatedCenter = ContainerCenter
      // Translate = ContainerCenter - RotatedCenter
      
      const tx = (containerWidth / 2) - rotatedCx;
      const ty = (containerHeight / 2) - rotatedCy;

      return { x: tx, y: ty };
  };

  const centerView = useCallback(() => {
      const { scale, rotation } = transform.current;
      const { x, y } = getCenterOffset(scale, rotation);
      transform.current = { ...transform.current, x, y };
      updateTransform(true);
  }, [updateTransform]);

  const fitToScreen = useCallback(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image || !image.naturalWidth || !image.naturalHeight) return;

    // Safely handle 0 width/height (hidden container) to prevent infinite loops
    if (container.clientWidth === 0 || container.clientHeight === 0) {
        // We don't recurse here, resizing observer will handle it when size becomes available
        return;
    }

    const containerWidth = container.clientWidth - 40; // padding
    const containerHeight = container.clientHeight - 40;
    
    // Calculate rotated bounding box dimensions
    const rotation = transform.current.rotation;
    const rad = (rotation * Math.PI) / 180;
    const w = image.naturalWidth;
    const h = image.naturalHeight;
    
    const absCos = Math.abs(Math.cos(rad));
    const absSin = Math.abs(Math.sin(rad));
    
    const boundingW = w * absCos + h * absSin;
    const boundingH = w * absSin + h * absCos;

    const scaleX = containerWidth / boundingW;
    const scaleY = containerHeight / boundingH;
    const newScale = Math.min(scaleX, scaleY, 1); 

    // Calculate centering offset
    const { x, y } = getCenterOffset(newScale, rotation);

    transform.current = { ...transform.current, x, y, scale: newScale };
    updateTransform(true);
  }, [imageRef, updateTransform]);

  const zoomToActualSize = useCallback(() => {
      // Set scale to 1 and center it
      const { rotation } = transform.current;
      const newScale = 1;
      const { x, y } = getCenterOffset(newScale, rotation);
      
      transform.current = { ...transform.current, x, y, scale: newScale };
      updateTransform(true);
  }, [updateTransform]);

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
    
    // Add ResizeObserver to handle container size changes (like sidebars opening/closing)
    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => fitToScreen());
    });
    
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }

    return () => {
        resizeObserver.disconnect();
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
        updateZoom(transform.current.scale + zoomStep);
    },
    zoomOut: () => {
        updateZoom(transform.current.scale - zoomStep);
    },
    reset: fitToScreen,
    centerView: centerView,
    zoomToActualSize: zoomToActualSize,
    rotateLeft: () => {
        transform.current.rotation -= 90;
        // Re-center view on rotation to prevent drifting off screen
        // We don't fitToScreen, just keep scale but fix position
        const { scale, rotation } = transform.current;
        const { x, y } = getCenterOffset(scale, rotation);
        transform.current = { ...transform.current, x, y };
        updateTransform(true);
    },
    rotateRight: () => {
        transform.current.rotation += 90;
        const { scale, rotation } = transform.current;
        const { x, y } = getCenterOffset(scale, rotation);
        transform.current = { ...transform.current, x, y };
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
      {/* Using absolute + origin-top-left ensures transforms (translate, rotate, scale) compose predictably from (0,0) */}
      <div
        ref={contentRef}
        className="absolute top-0 left-0 origin-top-left will-change-transform select-none"
        style={{
            width: 'auto',
            height: 'auto',
            maxWidth: 'none',
            maxHeight: 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
});

export default ZoomPanWrapper;
