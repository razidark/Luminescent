
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SparkleIcon, MagicWandIcon, UndoIcon, RedoIcon, EraserIcon, PaintBrushIcon, InvertIcon } from './icons';
import { enhancePrompt } from '../services/geminiService';

interface AddProductPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  hasMask: boolean;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo?: () => void;
  onInvert?: () => void;
  onGenerateSuggestions: () => Promise<string[]>;
  onAutoSelect: (label: string) => Promise<void>;
  onMagicMaskClick: (label: string) => Promise<void>;
  tool: 'brush' | 'eraser';
  setTool: (tool: 'brush' | 'eraser') => void;
}

const AddProductPanel: React.FC<AddProductPanelProps> = ({ prompt, setPrompt, onGenerate, isLoading, hasMask, brushSize, setBrushSize, onClear, onUndo, onRedo, onInvert, onGenerateSuggestions, onAutoSelect, onMagicMaskClick, tool, setTool }) => {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [autoSelectLabel, setAutoSelectLabel] = React.useState('');
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [isMasking, setIsMasking] = React.useState(false);

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

  const handleAutoSelectClick = async () => {
    if (!autoSelectLabel.trim()) return;
    setIsDetecting(true);
    try {
      await onAutoSelect(autoSelectLabel);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleMagicMaskClick = async () => {
      if (!autoSelectLabel.trim()) return;
      setIsMasking(true);
      try {
          await onMagicMaskClick(autoSelectLabel);
      } finally {
          setIsMasking(false);
      }
  };

  return (
    <div className="w-full p-6 flex flex-col gap-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('addProductTitle')}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2">{t('addProductPanelDescription')}</p>
      
       <div className="relative w-full">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('addProductPlaceholder')}
          className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-theme-accent focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base pr-20"
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
            onClick={handleSuggest} 
            disabled={isLoading || isSuggesting || isEnhancing} 
            data-tooltip-id="app-tooltip"
            data-tooltip-content={t('suggestIdeas')}
            className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
            <SparkleIcon className={`w-6 h-6 ${isSuggesting ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

       {(isSuggesting || suggestions.length > 0) && (
        <div className="flex flex-wrap items-center justify-center gap-2 animate-fade-in pt-2">
            {isSuggesting ? <p className="text-sm text-gray-500">{t('suggesting')}</p> : suggestions.map((s, i) => (
                <button
                    key={i}
                    onClick={() => setPrompt(s)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200"
                >
                    {s}
                </button>
            ))}
        </div>
      )}

      <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
         
         <div className="flex gap-2 mb-4 bg-white dark:bg-white/5 p-1 rounded-lg">
            <button
                onClick={() => setTool('brush')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-bold ${tool === 'brush' ? 'bg-theme-accent text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}
            >
                <PaintBrushIcon className="w-4 h-4" />
                Draw
            </button>
            <button
                onClick={() => setTool('eraser')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-bold ${tool === 'eraser' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}
            >
                <EraserIcon className="w-4 h-4" />
                Erase
            </button>
         </div>

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
            </div>
            <div className="flex gap-2 mt-2">
                <button 
                    onClick={handleAutoSelectClick}
                    disabled={isLoading || isDetecting || !autoSelectLabel.trim()}
                    className="flex-1 px-4 py-2 bg-theme-accent text-white rounded-lg text-sm font-bold disabled:opacity-50"
                >
                    {isDetecting ? t('detecting') : t('smartSelectBtn')}
                </button>
                <button 
                    onClick={handleMagicMaskClick}
                    disabled={isLoading || isDetecting || isMasking || !autoSelectLabel.trim()}
                    className="flex-1 px-3 py-2 bg-theme-gradient text-white rounded-lg text-xs font-bold disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
                >
                    {isMasking ? t('masking') : t('smartSelectPrecise')}
                </button>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <label htmlFor="brush-size-add" className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('brushSize')}</label>
            <input
            id="brush-size-add"
            type="range"
            min="10"
            max="100"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
            className="flex-grow h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-theme-accent"
            disabled={isLoading}
            />
            <span className="text-sm font-mono text-gray-800 dark:text-gray-300 w-8 text-center">{brushSize}</span>
         </div>
      </div>

      <div className="flex gap-2 pt-2">
         <button
            onClick={onUndo}
            className="flex-shrink-0 p-3.5 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-xl transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 disabled:opacity-50"
            disabled={isLoading}
            data-tooltip-id="app-tooltip"
            data-tooltip-content={t('undo')}
        >
            <UndoIcon className="w-5 h-5" />
        </button>
        {onRedo && (
            <button
                onClick={onRedo}
                className="flex-shrink-0 p-3.5 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-xl transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 disabled:opacity-50"
                disabled={isLoading}
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('redo')}
            >
                <RedoIcon className="w-5 h-5" />
            </button>
        )}
        {onInvert && (
            <button
                onClick={onInvert}
                className="flex-shrink-0 p-3.5 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-xl transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 disabled:opacity-50"
                disabled={isLoading}
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('invertMask')}
            >
                <InvertIcon className="w-5 h-5" />
            </button>
        )}
         <button
            onClick={onClear}
            className="flex-1 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold py-4 px-6 rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 text-base disabled:opacity-50"
            disabled={isLoading}
        >
            {t('clearMask')}
        </button>
        <button
            onClick={onGenerate}
            className="flex-[2] bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading || !prompt.trim() || !hasMask}
        >
          <div className="flex items-center justify-center gap-2">
            <SparkleIcon className="w-5 h-5" />
            {t('applyAddProduct')}
          </div>
        </button>
      </div>
    </div>
  );
};

export default React.memo(AddProductPanel);
