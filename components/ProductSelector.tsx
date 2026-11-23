/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { RemoveBgIcon, SparkleIcon } from './icons';

interface ProductPanelProps {
  onIsolate: () => void;
  onSetBackground: (name: string, customPrompt?: string) => void;
  onAddShadow: () => void;
  isLoading: boolean;
  hasTransparentBackground: boolean;
}

const ProductPanel: React.FC<ProductPanelProps> = ({ onIsolate, onSetBackground, onAddShadow, isLoading, hasTransparentBackground }) => {
  const { t } = useLanguage();
  const [customPrompt, setCustomPrompt] = React.useState('');

  const backgroundPresets = [
    { id: 'Studio White', name: t('productStudioWhite') },
    { id: 'Marble', name: t('productMarble') },
    { id: 'Wood', name: t('productWood') },
    { id: 'Gradient', name: t('productGradient') },
    { id: 'Outdoor', name: t('productOutdoor') },
  ];
  
  const handleCustomGenerate = () => {
    if (customPrompt.trim()) {
      onSetBackground('Custom', customPrompt.trim());
    }
  };

  return (
    <div className="w-full p-6 flex flex-col items-center gap-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('productStudioTitle')}</h3>
      
      {/* Step 1: Isolate */}
      <div className="w-full max-w-xl p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/60 dark:bg-gray-800/20">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-theme-gradient text-white font-bold text-xl">1</div>
          <div className="flex-grow">
            <h4 className="font-bold text-gray-800 dark:text-gray-200">{t('productIsolate')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('productIsolateDescription')}</p>
          </div>
          <button
            onClick={onIsolate}
            disabled={isLoading || hasTransparentBackground}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-white/20 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RemoveBgIcon className="w-5 h-5" />
            {t('removeBackground')}
          </button>
        </div>
      </div>
      
      {/* Step 2: Background */}
      <div className={`w-full max-w-xl p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/60 dark:bg-gray-800/20 transition-opacity ${!hasTransparentBackground ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-theme-gradient text-white font-bold text-xl">2</div>
          <h4 className="font-bold text-gray-800 dark:text-gray-200">{t('productChooseBg')}</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {backgroundPresets.map(preset => (
                <button
                    key={preset.id}
                    onClick={() => onSetBackground(preset.id)}
                    disabled={isLoading || !hasTransparentBackground}
                    className="w-full text-center bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 text-base disabled:opacity-50"
                >
                    {preset.name}
                </button>
            ))}
        </div>
        <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">{t('or')}</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={t('productCustomBg')}
                className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-theme-accent focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
                disabled={isLoading || !hasTransparentBackground}
            />
            <button
                onClick={handleCustomGenerate}
                disabled={isLoading || !hasTransparentBackground || !customPrompt.trim()}
                className="p-3 bg-theme-gradient text-white rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
                <SparkleIcon className="w-5 h-5"/>
            </button>
        </div>
      </div>

      {/* Step 3: Shadow */}
      <div className="w-full max-w-xl p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/60 dark:bg-gray-800/20">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-theme-gradient text-white font-bold text-xl">3</div>
          <div className="flex-grow">
            <h4 className="font-bold text-gray-800 dark:text-gray-200">{t('productAddShadow')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('productAddShadowDesc')}</p>
          </div>
          <button
            onClick={onAddShadow}
            disabled={isLoading}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-white/20 font-semibold disabled:opacity-50"
          >
            <SparkleIcon className="w-5 h-5" />
            {t('apply')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductPanel);