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
    <div className={`flex flex-col gap-2.5 w-full group ${disabled ? 'opacity-40 select-none' : ''}`}>
      {(label || labelValue !== undefined) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <label className={`text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 transition-colors select-none ${disabled ? '' : 'group-hover:text-theme-accent'}`}>
              {label}
            </label>
          )}
          <span className="text-[10px] font-mono font-black text-gray-800 dark:text-gray-200 bg-white/40 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 rounded-lg min-w-[36px] text-center select-none shadow-sm">
            {labelValue !== undefined ? labelValue : value}
          </span>
        </div>
      )}
      <div className="relative w-full h-5 flex items-center">
        {/* Track Background */}
        <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-gray-700/60 rounded-full overflow-hidden">
           {/* Filled Track */}
           <div 
             className={`h-full transition-all duration-100 ease-out ${disabled ? 'bg-gray-400 dark:bg-gray-500' : 'bg-theme-gradient'}`} 
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
          className={`absolute w-full h-full opacity-0 z-20 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        />
        
        {/* Custom Thumb (Visual Only) */}
        <div 
            className={`absolute h-4.5 w-4.5 bg-white dark:bg-gray-150 border rounded-full pointer-events-none transition-all duration-150 ease-out z-10 flex items-center justify-center ${
              disabled 
                ? 'border-gray-300 dark:border-gray-600 shadow-none' 
                : 'border-theme-accent shadow-md shadow-theme-accent/20 group-hover:scale-125 group-active:scale-95'
            }`}
            style={{ 
                left: `calc(${percentage}% - 9px)` // Center thumb (half of width)
            }}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${disabled ? 'bg-gray-400 dark:bg-gray-500' : 'bg-theme-accent'}`} />
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;