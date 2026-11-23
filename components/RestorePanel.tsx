/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MagicWandIcon } from './icons';

interface RestorePanelProps {
  onApplyRestore: (options: { fixDamage: boolean; improveClarity: boolean; colorize: boolean; enhanceFaces: boolean; }) => void;
  isLoading: boolean;
}

const RestorePanel: React.FC<RestorePanelProps> = ({ onApplyRestore, isLoading }) => {
  const { t } = useLanguage();
  const [fixDamage, setFixDamage] = React.useState(true);
  const [improveClarity, setImproveClarity] = React.useState(true);
  const [colorize, setColorize] = React.useState(false);
  const [enhanceFaces, setEnhanceFaces] = React.useState(true);

  const handleApply = () => {
    onApplyRestore({ fixDamage, improveClarity, colorize, enhanceFaces });
  };
  
  const hasSelection = fixDamage || improveClarity || colorize || enhanceFaces;

  const options = [
    { id: 'fixDamage', label: t('restoreFixDamage'), value: fixDamage, setter: setFixDamage },
    { id: 'improveClarity', label: t('restoreClarity'), value: improveClarity, setter: setImproveClarity },
    { id: 'colorize', label: t('restoreColorize'), value: colorize, setter: setColorize },
    { id: 'enhanceFaces', label: t('restoreFace'), value: enhanceFaces, setter: setEnhanceFaces },
  ];

  return (
    <div className="w-full p-6 flex flex-col items-center gap-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('restoreTitle')}</h3>
      
      <div className="w-full max-w-md grid grid-cols-1 gap-3 pt-2">
        {options.map(opt => (
          <label key={opt.id} className="flex items-center gap-3 p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <input
              type="checkbox"
              checked={opt.value}
              onChange={() => !isLoading && opt.setter(!opt.value)}
              disabled={isLoading}
              className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-theme-accent focus:ring-theme-accent bg-gray-100 dark:bg-gray-900"
            />
            <span className="text-base text-gray-800 dark:text-gray-200">{opt.label}</span>
          </label>
        ))}
      </div>
      
      <button
        onClick={handleApply}
        disabled={isLoading || !hasSelection}
        className="w-full max-w-xs mt-4 bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        <div className="flex items-center justify-center gap-2">
          <MagicWandIcon className="w-5 h-5" />
          {t('applyRestoration')}
        </div>
      </button>
    </div>
  );
};

export default React.memo(RestorePanel);