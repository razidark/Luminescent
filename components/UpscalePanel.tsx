/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { UpscaleIcon } from './icons';

interface UpscalePanelProps {
  onApplyUpscale: (scale: number) => void;
  isLoading: boolean;
}

const UpscalePanel: React.FC<UpscalePanelProps> = ({ onApplyUpscale, isLoading }) => {
  const { t } = useLanguage();

  const upscaleOptions = [
    { name: t('upscale2x'), scale: 2, description: t('upscale2xDesc') },
    { name: t('upscale4x'), scale: 4, description: t('upscale4xDesc') },
  ];

  return (
    <div className="w-full p-6 flex flex-col items-center gap-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('upscaleTitle')}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2">{t('upscaleDescription')}</p>

      <div className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {upscaleOptions.map(({ name, scale, description }) => (
          <button
            key={scale}
            onClick={() => onApplyUpscale(scale)}
            disabled={isLoading}
            className="group w-full text-left p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-4"
          >
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-theme-gradient border border-gray-200 dark:border-gray-700 transition-all duration-300">
                <UpscaleIcon className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors duration-300" />
            </div>
            <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-theme-gradient transition-colors">{name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(UpscalePanel);