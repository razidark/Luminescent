
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SparkleIcon } from './icons';

interface EnhancePanelProps {
  onApplyEnhance: (intensity: 'subtle' | 'medium' | 'strong') => void;
  isLoading: boolean;
}

const EnhancePanel: React.FC<EnhancePanelProps> = ({ onApplyEnhance, isLoading }) => {
  const { t } = useLanguage();
  const [intensity, setIntensity] = React.useState<'subtle' | 'medium' | 'strong'>('medium');

  const handleApply = () => {
    onApplyEnhance(intensity);
  };

  const options: { id: 'subtle' | 'medium' | 'strong', labelKey: string, descKey: string }[] = [
    { id: 'subtle', labelKey: 'strengthSubtle', descKey: 'enhanceSubtleDesc' },
    { id: 'medium', labelKey: 'strengthNormal', descKey: 'enhanceMediumDesc' },
    { id: 'strong', labelKey: 'strengthStrong', descKey: 'enhanceStrongDesc' },
  ];

  return (
    <div className="w-full p-6 flex flex-col items-center gap-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">{t('enhanceTitle')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">{t('enhanceDescription')}</p>
      </div>
      
      <div className="w-full max-w-md grid grid-cols-1 gap-3">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => setIntensity(opt.id)}
            disabled={isLoading}
            className={`group flex flex-col gap-1 p-4 border rounded-xl transition-all text-left ${
              intensity === opt.id 
                ? 'bg-theme-gradient text-white border-transparent shadow-lg shadow-theme-accent/20' 
                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-between w-full">
                <span className="font-bold text-base">{t(opt.labelKey as any)}</span>
                {intensity === opt.id && <SparkleIcon className="w-5 h-5 text-white" />}
            </div>
            <span className={`text-sm ${intensity === opt.id ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                {t(opt.descKey as any)}
            </span>
          </button>
        ))}
      </div>
      
      <button
        onClick={handleApply}
        disabled={isLoading}
        className="w-full max-w-xs mt-4 bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        <div className="flex items-center justify-center gap-2">
          <SparkleIcon className="w-5 h-5" />
          {t('applyEnhance')}
        </div>
      </button>
    </div>
  );
};

export default React.memo(EnhancePanel);
