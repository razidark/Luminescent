/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';

interface RangeSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
  labelValue?: string | number; // Optional custom display value
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  label,
  labelValue
}) => {
  // Calculate percentage for gradient background
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="flex flex-col gap-2 w-full group">
      {(label || labelValue !== undefined) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-theme-accent transition-colors select-none">
              {label}
            </label>
          )}
          <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300 bg-gray-200/80 dark:bg-white/10 px-2 py-0.5 rounded min-w-[32px] text-center select-none">
            {labelValue !== undefined ? labelValue : value}
          </span>
        </div>
      )}
      <div className="relative w-full h-5 flex items-center">
        {/* Track Background */}
        <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
           {/* Filled Track */}
           <div 
             className="h-full bg-theme-gradient transition-all duration-100 ease-out" 
             style={{ width: `${percentage}%` }}
           />
        </div>
        
        {/* Native Input (Invisible but functional) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="absolute w-full h-full opacity-0 cursor-pointer z-20"
        />
        
        {/* Custom Thumb (Visual Only) */}
        <div 
            className="absolute h-4 w-4 bg-white dark:bg-gray-200 border-2 border-theme-accent rounded-full shadow-sm pointer-events-none transition-all duration-150 ease-out group-hover:scale-125 group-active:scale-110 z-10"
            style={{ 
                left: `calc(${percentage}% - 8px)` // Center thumb (half of width)
            }}
        />
      </div>
    </div>
  );
};

export default RangeSlider;