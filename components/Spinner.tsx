
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center" role="status">
      {/* Outer static ring */}
      <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-white/10 opacity-30"></div>
      
      {/* Inner rotating gradient ring */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-theme-accent border-l-theme-accent animate-spin"></div>
      
      {/* Inner reverse rotating ring */}
      <div 
        className="absolute inset-3 rounded-full border-4 border-transparent border-b-theme-accent-hover border-r-theme-accent-hover animate-spin" 
        style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
      ></div>
      
      {/* Center Glow */}
      <div className="absolute inset-0 rounded-full bg-theme-accent/10 blur-xl animate-pulse"></div>
      
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
