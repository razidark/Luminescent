/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SparkleIcon } from './icons';
import RangeSlider from './RangeSlider';

interface RetouchPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onApplyRetouch: () => void;
  onApplySelectiveAdjust: () => void;
  onApplyHeal: () => void;
  onClear: () => void;
  isLoading: boolean;
  onAutoSelect: (label: string) => Promise<void>;
}

type BrushMode = 'retouch' | 'adjust' | 'heal';

const RetouchPanel: React.FC<RetouchPanelProps> = ({ prompt, setPrompt, brushSize, setBrushSize, onApplyRetouch, onApplySelectiveAdjust, onApplyHeal, onClear, isLoading, onAutoSelect }) => {
  const { t } = useLanguage();
  const [activePresetId, setActivePresetId] = React.useState<string>('auto');
  const [mode, setMode] = React.useState<BrushMode>('retouch');
  const [color, setColor] = React.useState('#ff0000');
  const [autoSelectLabel, setAutoSelectLabel] = React.useState('');
  const [isDetecting, setIsDetecting] = React.useState(false);

  const presets: { id: string; nameKey: any; mode: BrushMode; needsColor?: boolean; }[] = [
    { id: 'auto', nameKey: 'retouchAuto', mode: 'retouch' },
    { id: 'heal', nameKey: 'retouchHeal', mode: 'heal' },
    { id: 'Remove blemishes and imperfections from the skin', nameKey: 'retouchBlemishes', mode: 'retouch' },
    { id: 'Make the skin smoother and softer, while preserving natural texture', nameKey: 'retouchSmoothSkin', mode: 'retouch' },
    { id: 'Make the teeth whiter and brighter', nameKey: 'retouchWhitenTeeth', mode: 'retouch' },
    { id: 'Change the hair color to {color}', nameKey: 'retouchChangeHair', mode: 'retouch', needsColor: true },
    { id: 'Change the eye color to {color}', nameKey: 'retouchChangeEyes', mode: 'retouch', needsColor: true },
    { id: 'Apply {color} lipstick', nameKey: 'retouchAddMakeup', mode: 'retouch', needsColor: true },
    { id: 'selective_filter', nameKey: 'magicBrushSelectiveFilter', mode: 'adjust' },
  ];
  
  const handlePresetClick = React.useCallback((preset: typeof presets[0]) => {
    setActivePresetId(preset.id);
    setMode(preset.mode);

    if (preset.mode === 'adjust' || preset.mode === 'heal') {
        setPrompt('');
    } else if (preset.id === 'auto') {
        setPrompt('Based on the content of the masked area, apply the most appropriate and subtle professional retouching. This could involve removing blemishes, smoothing skin texture, reducing wrinkles, or fixing minor imperfections. The result must be photorealistic and preserve natural skin/hair/fabric texture.');
    } else {
        let promptText = preset.id;
        if (preset.needsColor) {
            promptText = promptText.replace('{color}', color);
        }
        setPrompt(promptText);
    }
  }, [color, setPrompt]);
  
  // Set initial prompt on mount
  React.useEffect(() => {
    handlePresetClick(presets[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    const activePreset = presets.find(p => p.id === activePresetId);
    if (activePreset?.needsColor) {
      setPrompt(activePreset.id.replace('{color}', newColor));
    }
  };
  
  const handleGenerate = () => {
    if (mode === 'heal') {
      onApplyHeal();
    } else if (mode === 'retouch') {
      onApplyRetouch();
    } else {
      onApplySelectiveAdjust();
    }
  }

  const handleAutoSelectClick = async () => {
    if (!autoSelectLabel.trim()) return;
    setIsDetecting(true);
    try {
      await onAutoSelect(autoSelectLabel);
    } finally {
      setIsDetecting(false);
    }
  };

  const activePreset = presets.find(p => p.id === activePresetId);
  const canApply = (mode === 'adjust' && !!prompt.trim()) || mode === 'retouch' || mode === 'heal';

  return (
    <div className="w-full bg-gray-50 dark:bg-black/40 dark:backdrop-blur-lg p-6 flex flex-col gap-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">{t('magicBrushTitle')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 -mt-1">{t('magicBrushDescription')}</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {presets.map(p => (
          <button
            key={p.id}
            onClick={() => handlePresetClick(p)}
            disabled={isLoading}
            className={`px-2 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 text-center border border-transparent ${activePresetId === p.id ? 'bg-theme-gradient text-white shadow-md shadow-theme-accent/20' : 'bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
          >
            {t(p.nameKey)}
          </button>
        ))}
      </div>

      {(activePreset?.needsColor) && (
        <div className="flex items-center justify-center gap-3 animate-fade-in p-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
          <label htmlFor="retouch-color" className="text-sm font-bold text-gray-600 dark:text-gray-300">{t('retouchPickColor')}</label>
          <input
            id="retouch-color"
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            disabled={isLoading}
            className="w-10 h-10 p-1 bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-full cursor-pointer transition-transform hover:scale-110"
          />
        </div>
      )}

      {mode === 'adjust' && (
        <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('magicBrushPlaceholder')}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-theme-accent focus:outline-none transition disabled:cursor-not-allowed disabled:opacity-60 text-sm animate-fade-in shadow-sm"
            disabled={isLoading}
        />
      )}

      <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
         <div className="mb-4">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">{t('smartSelectTitle')}</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={autoSelectLabel}
                    onChange={(e) => setAutoSelectLabel(e.target.value)}
                    placeholder={t('smartSelectPlaceholder')}
                    className="flex-grow bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-theme-accent"
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

      <div className="grid grid-cols-2 gap-3 pt-2">
         <button
            onClick={onClear}
            className="w-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold py-3.5 px-6 rounded-xl transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 text-sm disabled:opacity-50"
            disabled={isLoading}
        >
            {t('clearMask')}
        </button>
        <button
            onClick={handleGenerate}
            className="w-full bg-theme-gradient text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-0.5 active:scale-95 text-sm disabled:opacity-50 disabled:shadow-none disabled:transform-none"
            disabled={isLoading || !canApply}
        >
          <div className="flex items-center justify-center gap-2">
            <SparkleIcon className="w-4 h-4" />
            {t('apply')}
          </div>
        </button>
      </div>
    </div>
  );
};

export default React.memo(RetouchPanel);