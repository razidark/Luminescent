/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from 'react';

interface SpinnerProps {
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ className = '' }) => {
  // Check if width/height are already defined in the passed className
  const hasWidth = /\bw-\d+\b/.test(className);
  const hasHeight = /\bh-\d+\b/.test(className);
  
  const sizeClasses = `${hasWidth ? '' : 'w-16'} ${hasHeight ? '' : 'h-16'}`;
  
  // Choose border size based on the size of the spinner
  // If it's a small spinner (e.g. w-5, h-5), use border-2. Otherwise, border-4 looks great.
  const isSmall = className.includes('w-5') || className.includes('h-5') || className.includes('w-6') || className.includes('h-6');
  const borderClass = isSmall ? 'border-2' : 'border-4';
  const insetClass = isSmall ? 'inset-1' : 'inset-3';

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`} role="status">
      {/* Outer static ring */}
      <div className={`absolute inset-0 rounded-full ${borderClass} border-gray-200 dark:border-white/10 opacity-30`}></div>
      
      {/* Inner rotating gradient ring */}
      <div className={`absolute inset-0 rounded-full ${borderClass} border-transparent border-t-theme-accent border-l-theme-accent animate-spin`}></div>
      
      {/* Inner reverse rotating ring */}
      <div 
        className={`absolute ${insetClass} rounded-full ${borderClass} border-transparent border-b-theme-accent-hover border-r-theme-accent-hover animate-spin`} 
        style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
      ></div>
      
      {/* Center Glow */}
      <div className="absolute inset-0 rounded-full bg-theme-accent/10 blur-xl animate-pulse"></div>
      
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
