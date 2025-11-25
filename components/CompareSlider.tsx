
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';

interface CompareSliderProps {
    originalImage: string;
    currentImage: string;
    initialPosition?: number;
}

const CompareSlider: React.FC<CompareSliderProps> = ({ originalImage, currentImage, initialPosition = 50 }) => {
    // Use a ref for the container to calculate widths
    const containerRef = React.useRef<HTMLDivElement>(null);
    
    // Use a ref for the slider position to update DOM directly for performance
    const sliderRef = React.useRef<HTMLDivElement>(null);
    const handleRef = React.useRef<HTMLDivElement>(null);
    
    // Keep track of state via refs to avoid re-renders during drag/keyboard interactions
    const isDragging = React.useRef(false);
    const currentPos = React.useRef(initialPosition);

    // Function to update the visual state of the slider
    const updateSlider = React.useCallback((percentage: number) => {
        // Clamp value
        const clamped = Math.max(0, Math.min(100, percentage));
        currentPos.current = clamped;

        if (sliderRef.current && handleRef.current) {
            sliderRef.current.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
            handleRef.current.style.left = `${clamped}%`;
            
            // Update ARIA value
            handleRef.current.setAttribute('aria-valuenow', Math.round(clamped).toString());
        }
    }, []);

    // Initialize position
    React.useEffect(() => {
        updateSlider(initialPosition);
    }, [initialPosition, updateSlider]);

    // Mouse/Touch Event Handlers
    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        isDragging.current = true;
        // Don't prevent default here if it's a touch event to allow scrolling if not dragging horizontally, 
        // but for a slider, usually we want to capture it.
        // For mouse, prevent default to stop text selection.
        if (e.type === 'mousedown') {
            e.preventDefault();
        }
        
        // Focus the handle for keyboard support
        handleRef.current?.focus();
    };

    const handleEnd = () => {
        isDragging.current = false;
    };

    const handleMove = React.useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        let clientX;

        if (window.TouchEvent && e instanceof TouchEvent) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = (e as MouseEvent).clientX;
        }

        // Calculate percentage
        let percentage = ((clientX - rect.left) / rect.width) * 100;
        updateSlider(percentage);
    }, [updateSlider]);

    // Keyboard Handler
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const step = 5; // Move 5% per key press
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            updateSlider(currentPos.current - step);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            updateSlider(currentPos.current + step);
        } else if (e.key === 'Home') {
            e.preventDefault();
            updateSlider(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            updateSlider(100);
        }
    };

    React.useEffect(() => {
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [handleMove]);

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full select-none group touch-none cursor-ew-resize overflow-hidden"
            onMouseDown={handleStart}
            onTouchStart={handleStart}
        >
            {/* Base Image (Current / Modified) */}
            <img 
                src={currentImage} 
                alt="Edited" 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
            />
            
            {/* Overlay Image (Original) - clipped */}
            <div 
                ref={sliderRef}
                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none will-change-[clip-path]"
            >
                <img 
                    src={originalImage} 
                    alt="Original" 
                    className="absolute inset-0 w-full h-full object-contain" 
                />
            </div>

            {/* Slider Handle */}
            <div 
                ref={handleRef}
                className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)] will-change-[left] outline-none focus:w-1 focus:bg-theme-accent transition-[width,background-color]"
                tabIndex={0}
                role="slider"
                aria-label="Compare images slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={initialPosition}
                onKeyDown={handleKeyDown}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(var(--theme-accent),0.5)] border-2 border-theme-accent text-theme-accent z-30 hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M18.75 12a.75.75 0 0 1-.75.75H6a.75.75 0 0 1 0-1.5h12a.75.75 0 0 1 .75.75Z" />
                        <path d="M12 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default CompareSlider;
