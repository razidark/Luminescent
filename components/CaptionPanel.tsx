/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { SparkleIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useEditor } from '../contexts/EditorContext';
import Spinner from './Spinner';

interface CaptionPanelProps {
  onSelectSuggestion: (suggestion: string) => void;
  isLoading: boolean;
}

const CaptionPanel: React.FC<CaptionPanelProps> = ({ onSelectSuggestion, isLoading }) => {
  const { t } = useLanguage();
  const { handleGenerateCaptions, captionSuggestions, captionSources } = useEditor();

  return (
    <div className="w-full p-6 flex flex-col items-center gap-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('captionsTitle')}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2 max-w-md">{t('captionsDescription')}</p>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-4 p-4">
            <Spinner />
            <p className="text-gray-600 dark:text-gray-400">{t('captionsGenerating')}</p>
        </div>
      )}

      {!isLoading && captionSuggestions.length > 0 && (
        <div className="w-full max-w-lg flex flex-col gap-3 pt-2">
            {captionSuggestions.map((text, index) => (
                <div
                    key={index}
                    className="w-full text-left p-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg flex items-center justify-between gap-4"
                >
                    <p className="text-base text-gray-800 dark:text-gray-200 flex-grow">"{text}"</p>
                    <button 
                        onClick={() => onSelectSuggestion(text)}
                        className="flex-shrink-0 px-3 py-1.5 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-semibold rounded-md text-sm transition-colors hover:bg-gray-300 dark:hover:bg-white/20"
                    >
                        {t('captionsUseText')}
                    </button>
                </div>
            ))}
            {captionSources.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('captionsSources')}</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {captionSources.map((source, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline">
                                    {source.title || source.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      )}

      <div className="w-full max-w-xs flex flex-col items-center pt-2">
        <button
            onClick={handleGenerateCaptions}
            disabled={isLoading}
            className="w-full bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
        >
            <div className="flex items-center justify-center gap-2">
                <SparkleIcon className="w-5 h-5" />
                {captionSuggestions.length > 0 ? t('captionsMore') : t('captionsGenerate')}
            </div>
        </button>
      </div>
    </div>
  );
};

export default React.memo(CaptionPanel);