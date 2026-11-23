
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SparkleIcon, PaintBrushIcon, EraserIcon, UndoIcon, RedoIcon, PencilIcon } from './icons';
import RangeSlider from './RangeSlider';

interface SketchPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  color: string;
  setColor: (color: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo?: () => void;
  isLoading: boolean;
  tool: 'brush' | 'eraser';
  setTool: (tool: 'brush' | 'eraser') => void;
}

const SketchPanel: React.FC<SketchPanelProps> = ({ 
    prompt, setPrompt, 
    brushSize, setBrushSize, 
    color, setColor, 
    onGenerate, onClear, onUndo, onRedo, 
    isLoading, tool, setTool 
}) => {
  const { t } = useLanguage();

  const predefinedColors = [
      '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
      '#FFFF00', '#00FFFF', '#FF00FF', '#FFA500', '#800080'
  ];

  return (
    <div className="w-full p-6 flex flex-col gap-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">{t('sketchTitle')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 -mt-1">{t('sketchDescription')}</p>
      </div>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t('sketchPlaceholder')}
        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-theme-accent focus:outline-none transition disabled:cursor-not-allowed disabled:opacity-60 text-sm shadow-sm"
        rows={3}
        disabled={isLoading}
      />

      <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 space-y-4">
         <div className="flex gap-2 bg-white dark:bg-white/5 p-1 rounded-lg">
            <button
                onClick={() => setTool('brush')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-bold ${tool === 'brush' ? 'bg-theme-accent text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}
            >
                <PencilIcon className="w-4 h-4" />
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

         {tool === 'brush' && (
             <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('color')}</label>
                 <div className="flex flex-wrap gap-2">
                     {predefinedColors.map(c => (
                         <button 
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-theme-accent scale-110 ring-2 ring-offset-1 ring-offset-transparent ring-theme-accent' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                         />
                     ))}
                     <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)} 
                        className="w-8 h-8 p-0 bg-transparent border-0 rounded-full overflow-hidden cursor-pointer"
                     />
                 </div>
             </div>
         )}

         <RangeSlider
            label={t('brushSize')}
            value={brushSize}
            min={1}
            max={50}
            onChange={setBrushSize}
            disabled={isLoading}
         />
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
            disabled={isLoading || !prompt.trim()}
        >
            <div className="flex items-center justify-center gap-2">
                <SparkleIcon className="w-4 h-4" />
                {t('generate')}
            </div>
        </button>
      </div>
    </div>
  );
};

export default React.memo(SketchPanel);
