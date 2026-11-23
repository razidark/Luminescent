/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, SparkleIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useEditor } from '../contexts/EditorContext';
import Spinner from './Spinner';

interface ExpandPanelProps {
  onApplyExpand: (direction: 'top' | 'bottom' | 'left' | 'right', prompt: string) => void;
  isLoading: boolean;
}

const ExpandPanel: React.FC<ExpandPanelProps> = ({ onApplyExpand, isLoading }) => {
    const { t } = useLanguage();
    const { handleGenerateExpansionSuggestions } = useEditor();
    const [prompt, setPrompt] = React.useState('');
    const [selectedDirection, setSelectedDirection] = React.useState<'top' | 'bottom' | 'left' | 'right' | null>(null);
    const [isSuggesting, setIsSuggesting] = React.useState(false);
    const [suggestions, setSuggestions] = React.useState<Array<{ direction: 'top' | 'bottom' | 'left' | 'right', prompt: string }>>([]);


    const handleApply = () => {
        if (selectedDirection) {
            onApplyExpand(selectedDirection, prompt);
        }
    };

    const handleGenerateSuggestions = async () => {
        setIsSuggesting(true);
        setSuggestions([]);
        setPrompt('');
        setSelectedDirection(null);
        try {
            const newSuggestions = await handleGenerateExpansionSuggestions();
            setSuggestions(newSuggestions);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSelectSuggestion = (suggestion: { direction: 'top' | 'bottom' | 'left' | 'right', prompt: string }) => {
        setSelectedDirection(suggestion.direction);
        setPrompt(suggestion.prompt);
    };

    const directionButtons: { dir: 'top' | 'bottom' | 'left' | 'right', icon: React.ReactNode, label: string }[] = [
        { dir: 'top', icon: <ArrowUpIcon className="w-5 h-5" />, label: t('expandTop') },
        { dir: 'bottom', icon: <ArrowDownIcon className="w-5 h-5" />, label: t('expandBottom') },
        { dir: 'left', icon: <ArrowLeftIcon className="w-5 h-5" />, label: t('expandLeft') },
        { dir: 'right', icon: <ArrowRightIcon className="w-5 h-5" />, label: t('expandRight') },
    ];
    
    const isBusy = isLoading || isSuggesting;

    return (
        <div className="w-full p-6 flex flex-col gap-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('headerExpand')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2">{t('expandDescription')}</p>
            
            <div className="w-full max-w-xs flex flex-col items-center pt-2 mx-auto">
                <button
                    onClick={handleGenerateSuggestions}
                    disabled={isBusy}
                    className="w-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 text-base flex items-center justify-center gap-2"
                >
                    <SparkleIcon className={`w-5 h-5 ${isSuggesting ? 'animate-spin' : ''}`} />
                    {t('suggestExpansions')}
                </button>
            </div>

            {isSuggesting && (
                <div className="flex flex-col items-center justify-center gap-4 p-4">
                    <Spinner />
                    <p className="text-gray-600 dark:text-gray-400">{t('suggestingExpansions')}</p>
                </div>
            )}

            {suggestions.length > 0 && !isSuggesting && (
                <div className="w-full max-w-lg flex flex-col gap-2 pt-2 animate-fade-in mx-auto">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('expandSuggestions')}</h4>
                    {suggestions.map((s, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectSuggestion(s)}
                            disabled={isBusy}
                            className={`w-full text-left p-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg flex items-center gap-3 transition-all duration-200 ease-in-out hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 active:scale-95 text-sm disabled:opacity-50 ${selectedDirection === s.direction && prompt === s.prompt ? 'ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 ring-theme-accent' : ''}`}
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                {directionButtons.find(btn => btn.dir === s.direction)?.icon}
                            </div>
                            <span className="capitalize font-semibold text-gray-800 dark:text-gray-200">{s.direction}: </span>
                            <span className="text-gray-700 dark:text-gray-300 flex-grow text-sm">{s.prompt}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="relative flex items-center my-2">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700/60"></div>
                <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-500 text-xs font-semibold uppercase">{t('or')}</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700/60"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {directionButtons.map(({ dir, icon, label }) => (
                    <button
                        key={dir}
                        onClick={() => setSelectedDirection(dir)}
                        disabled={isBusy}
                        className={`w-full flex items-center justify-center gap-2 text-center bg-gray-200 dark:bg-white/10 border border-transparent text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-300 dark:hover:bg-white/20 hover:border-gray-400 dark:hover:border-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed ${selectedDirection === dir ? 'ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 ring-theme-accent' : ''}`}
                        aria-label={label}
                    >
                        {icon}
                        <span className="capitalize">{dir}</span>
                    </button>
                ))}
            </div>

            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('expandPlaceholder')}
                className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-theme-accent focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
                disabled={isBusy}
            />

            {selectedDirection && (
                <div className="animate-fade-in flex flex-col gap-4 pt-2">
                    <button
                        onClick={handleApply}
                        className="w-full bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                        disabled={isBusy || !selectedDirection || !prompt.trim()}
                    >
                        {t('applyExpansion')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default React.memo(ExpandPanel);