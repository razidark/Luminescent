/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { SparkleIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useEditor } from '../contexts/EditorContext';

const MemePanel: React.FC = () => {
    const { t } = useLanguage();
    const { 
        handleGenerateMemeSuggestions,
        handleApplyMeme,
        memeSuggestions, 
        isLoading 
    } = useEditor();

    const [topText, setTopText] = React.useState('');
    const [bottomText, setBottomText] = React.useState('');
    
    React.useEffect(() => {
        if (memeSuggestions.length === 0) {
            handleGenerateMemeSuggestions();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectSuggestion = (text: string) => {
        const words = text.split(' ');
        if (words.length <= 4) {
            setTopText(text);
            setBottomText('');
        } else {
            const splitPoint = Math.ceil(words.length / 2);
            setTopText(words.slice(0, splitPoint).join(' '));
            setBottomText(words.slice(splitPoint).join(' '));
        }
    };

    const handleApply = () => {
        if (topText.trim() || bottomText.trim()) {
            handleApplyMeme({ topText, bottomText });
        }
    };

    return (
        <div className="w-full p-6 flex flex-col items-center gap-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('memeTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2 max-w-md">{t('memeDescription')}</p>

            <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                    <label htmlFor="top-text" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('memeTopText')}</label>
                    <textarea
                        id="top-text"
                        value={topText}
                        onChange={(e) => setTopText(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-1 focus:ring-theme-accent focus:outline-none transition text-base disabled:opacity-60"
                        rows={2}
                        disabled={isLoading}
                    />
                </div>
                 <div>
                    <label htmlFor="bottom-text" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('memeBottomText')}</label>
                    <textarea
                        id="bottom-text"
                        value={bottomText}
                        onChange={(e) => setBottomText(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-1 focus:ring-theme-accent focus:outline-none transition text-base disabled:opacity-60"
                        rows={2}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="w-full max-w-lg grid grid-cols-2 gap-2 pt-2">
                 <button
                    onClick={handleGenerateMemeSuggestions}
                    disabled={isLoading}
                    className="w-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold py-4 px-6 rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 text-base disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <SparkleIcon className="w-5 h-5" />
                    {t('generateIdeas')}
                </button>
                <button
                    onClick={handleApply}
                    disabled={isLoading || (!topText.trim() && !bottomText.trim())}
                    className="w-full bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                >
                    {t('applyMeme')}
                </button>
            </div>

            {memeSuggestions.length > 0 && (
                <div className="w-full max-w-lg grid grid-cols-1 gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                    {memeSuggestions.map((text, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectSuggestion(text)}
                            className="w-full text-left p-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 active:scale-95 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <p className="text-sm text-gray-800 dark:text-gray-200">"{text}"</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default React.memo(MemePanel);