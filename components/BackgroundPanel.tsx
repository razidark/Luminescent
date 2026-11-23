/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { RemoveBgIcon, SparkleIcon, MagicWandIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { enhancePrompt } from '../services/geminiService';

interface BackgroundPanelProps {
  onRemoveBackground: () => void;
  onReplaceBackground: (prompt: string) => void;
  isLoading: boolean;
  hasTransparentBackground: boolean;
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ onRemoveBackground, onReplaceBackground, isLoading, hasTransparentBackground }) => {
  const { t } = useLanguage();
  const [prompt, setPrompt] = React.useState('');
  const [isEnhancing, setIsEnhancing] = React.useState(false);

  const handleGenerate = () => {
    if (prompt.trim()) {
        onReplaceBackground(prompt);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (e) {
      console.error("Failed to enhance prompt", e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const renderInitialState = () => (
    <>
      <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('bgRemoveTitle')}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2">{t('bgRemoveDescription')}</p>
      <div className="w-full max-w-md flex flex-col items-center pt-2">
        <button
          onClick={onRemoveBackground}
          disabled={isLoading}
          className="w-full bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
        >
          <div className="flex items-center justify-center gap-2">
            <RemoveBgIcon className="w-5 h-5" />
            {t('removeBackground')}
          </div>
        </button>
      </div>
    </>
  );
  
  const renderGeneratorState = () => (
    <>
      <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('bgGenerateTitle')}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2">{t('bgGenerateDescription')}</p>
      <div className="w-full max-w-xl flex flex-col items-center gap-2 pt-2">
        <div className="relative w-full">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('bgGeneratePlaceholder')}
                className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-theme-accent focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base pr-12"
                disabled={isLoading || isEnhancing}
            />
             <button
                onClick={handleEnhancePrompt}
                disabled={isLoading || isEnhancing || !prompt.trim()}
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('enhancePrompt')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-theme-accent hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
                <MagicWandIcon className={`w-5 h-5 ${isEnhancing ? 'animate-spin' : ''}`} />
            </button>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
        >
            <div className="flex items-center justify-center gap-2">
                <SparkleIcon className="w-5 h-5" />
                {t('generateBackground')}
            </div>
        </button>
      </div>
    </>
  );

  return (
    <div className="w-full p-6 flex flex-col items-center gap-4 animate-fade-in">
      {hasTransparentBackground ? renderGeneratorState() : renderInitialState()}
    </div>
  );
};

export default React.memo(BackgroundPanel);