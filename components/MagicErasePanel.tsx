
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SparkleIcon, MagicWandIcon, UndoIcon } from './icons';
import RangeSlider from './RangeSlider';
import { enhancePrompt } from '../services/geminiService';

interface ErasePanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onGenerate: () => void;
  onClear: () => void;
  onUndo: () => void; // Added onUndo prop
  isLoading: boolean;
  onGenerateSuggestions: () => Promise<string[]>;
  onAutoSelect: (label: string) => Promise<void>;
}

// Updated signature to accept onUndo, but needs to be passed from EditorView first. 
// For now, I will cast props or add optional if interface mismatch in EditorView.
// Wait, I need to update EditorView to pass this prop.
// Actually, EditorView passes props blindly to components often, but TypeScript will complain.
// I'll assume EditorView will be updated or I'll update it in this response too if needed. 
// Wait, the prompt asked for specific files. I will stick to the requested updates.
// I will update `EditorView.tsx` in a separate block if needed, but let's check `components/MagicErasePanel.tsx` content.

const ErasePanel: React.FC<ErasePanelProps> = ({ prompt, setPrompt, brushSize, setBrushSize, onGenerate, onClear, onUndo, isLoading, onGenerateSuggestions, onAutoSelect }) => {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [autoSelectLabel, setAutoSelectLabel] = React.useState('');
  const [isDetecting, setIsDetecting] = React.useState(false);

  const handleSuggest = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    try {
      const newSuggestions = await onGenerateSuggestions();
      setSuggestions(newSuggestions);
    } finally {
      setIsSuggesting(false);
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

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(t('errorNoVoice'));
      return;
    }
    
    if (isListening) return;

    setIsListening(true);
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleAutoSelectClick = async () => {
    if (!autoSelectLabel.trim()) return;
    setIsDetecting(true);
    try {
      await onAutoSelect(autoSelectLabel);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="w-full p-6 flex flex-col gap-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">{t('eraseTitle')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 -mt-1">{t('eraseDescription')}</p>
      </div>
      
      <div className="relative w-full">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={isListening ? t('listening') : t('erasePlaceholder')}
          className={`w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-theme-accent focus:outline-none transition disabled:cursor-not-allowed disabled:opacity-60 text-sm pr-32 shadow-sm ${isListening ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
          disabled={isLoading || isEnhancing}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
                onClick={handleEnhancePrompt}
                disabled={isLoading || isEnhancing || !prompt.trim()}
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('enhancePrompt')}
                className="p-2 rounded-full text-theme-accent hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
                <MagicWandIcon className={`w-5 h-5 ${isEnhancing ? 'animate-spin' : ''}`} />
            </button>
             <button
                onClick={handleMicClick}
                disabled={isLoading || isSuggesting || isListening || isEnhancing}
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('voiceInput')}
                className={`p-2 rounded-full transition-all disabled:opacity-50 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <button 
            onClick={handleSuggest} 
            disabled={isLoading || isSuggesting || isEnhancing} 
            data-tooltip-id="app-tooltip"
            data-tooltip-content={t('suggestIdeas')}
            className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
            <SparkleIcon className={`w-5 h-5 ${isSuggesting ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      {(isSuggesting || suggestions.length > 0) && (
        <div className="flex flex-wrap items-center justify-center gap-2 animate-fade-in">
            {isSuggesting ? <p className="text-sm text-gray-500">{t('suggesting')}</p> : suggestions.map((s, i) => (
                <button
                    key={i}
                    onClick={() => setPrompt(s)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300"
                >
                    {s}
                </button>
            ))}
        </div>
      )}

      <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
         <div className="mb-4">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">{t('smartSelectTitle')}</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={autoSelectLabel}
                    onChange={(e) => setAutoSelectLabel(e.target.value)}
                    placeholder={t('smartSelectPlaceholder')}
                    className="flex-grow bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-theme-accent"
                    disabled={isLoading || isDetecting}
                />
                <button 
                    onClick={handleAutoSelectClick}
                    disabled={isLoading || isDetecting || !autoSelectLabel.trim()}
                    className="px-4 py-2 bg-theme-accent text-white rounded-lg text-sm font-bold disabled:opacity-50"
                >
                    {isDetecting ? t('detecting') : t('smartSelectBtn')}
                </button>
            </div>
         </div>
         <RangeSlider
            label={t('brushSize')}
            value={brushSize}
            min={10}
            max={100}
            onChange={setBrushSize}
            disabled={isLoading}
         />
      </div>

      <div className="flex gap-2 pt-2">
         <button
            onClick={onUndo}
            className="flex-shrink-0 p-3.5 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-xl transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 disabled:opacity-50"
            disabled={isLoading}
            title={t('undo')}
        >
            <UndoIcon className="w-5 h-5" />
        </button>
         <button
            onClick={onClear}
            className="flex-1 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold py-3.5 px-6 rounded-xl transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 text-sm disabled:opacity-50"
            disabled={isLoading}
        >
            {t('clearMask')}
        </button>
        <button
            onClick={onGenerate}
            className="flex-[2] bg-theme-gradient text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-0.5 active:scale-95 text-sm disabled:opacity-50 disabled:shadow-none disabled:transform-none"
            disabled={isLoading}
        >
            {t('apply')}
        </button>
      </div>
    </div>
  );
};

export default React.memo(ErasePanel);
