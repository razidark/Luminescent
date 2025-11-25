
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useEditor } from '../contexts/EditorContext';
import { generateAutoAdjustments, generateLuckyAdjustment } from '../services/geminiService';
import { SparkleIcon } from './icons';
import RangeSlider from './RangeSlider';

interface AdjustmentPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
}

// Define the structure for an adjustment
type AdjustmentKey = 'brightness' | 'contrast' | 'saturation' | 'highlights' | 'shadows' | 'vibrance' | 'temperature' | 'sharpness' | 'hdr';
type Strength = 'Subtle' | 'Normal' | 'Strong';

const initialAdjustments: Record<AdjustmentKey, number> = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  highlights: 0,
  shadows: 0,
  vibrance: 0,
  temperature: 0,
  sharpness: 0,
  hdr: 0,
};

const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({ onApplyAdjustment, isLoading }) => {
  const { t } = useLanguage();
  const { currentImage } = useEditor();
  const [adjustments, setAdjustments] = React.useState(initialAdjustments);
  const [customPrompt, setCustomPrompt] = React.useState('');
  const [strength, setStrength] = React.useState<Strength>('Normal');
  const [isAutoEnhancing, setIsAutoEnhancing] = React.useState(false);
  const [isLuckyEnhancing, setIsLuckyEnhancing] = React.useState(false);

  const isBusy = isLoading || isAutoEnhancing || isLuckyEnhancing;

  const handleSliderChange = (key: AdjustmentKey, value: number) => {
    if (key === 'hdr') {
        // If HDR is moved, reset other adjustments
        setAdjustments({ ...initialAdjustments, hdr: value });
    } else {
        // If another slider is moved, reset HDR
        setAdjustments(prev => ({ ...prev, hdr: 0, [key]: value }));
    }
    if (customPrompt) setCustomPrompt('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
    setAdjustments(initialAdjustments); // Reset sliders if custom prompt is used
  };

  const handleAutoEnhance = async () => {
    if (!currentImage) return;
    setIsAutoEnhancing(true);
    setCustomPrompt('');
    try {
        const suggestedAdjustments = await generateAutoAdjustments(currentImage);
        const sanitizedAdjustments = {
            ...initialAdjustments,
            brightness: Number(suggestedAdjustments.brightness) || 0,
            contrast: Number(suggestedAdjustments.contrast) || 0,
            saturation: Number(suggestedAdjustments.saturation) || 0,
            highlights: Number(suggestedAdjustments.highlights) || 0,
            shadows: Number(suggestedAdjustments.shadows) || 0,
            vibrance: Number(suggestedAdjustments.vibrance) || 0,
            temperature: Number(suggestedAdjustments.temperature) || 0,
            sharpness: Number(suggestedAdjustments.sharpness) || 0,
            hdr: 0,
        };
        setAdjustments(sanitizedAdjustments);
    } catch (err) {
        console.error('Auto-enhance failed', err);
        // Error will be shown via context
    } finally {
        setIsAutoEnhancing(false);
    }
  };
  
  const handleLuckyEnhance = async () => {
    if (!currentImage) return;
    setIsLuckyEnhancing(true);
    setCustomPrompt('');
    setAdjustments(initialAdjustments);
    try {
        const luckyPrompt = await generateLuckyAdjustment(currentImage);
        // Apply the adjustment directly
        onApplyAdjustment(luckyPrompt);
    } catch (err) {
        console.error('Lucky enhance failed', err);
        // Error will be shown via context from onApplyAdjustment
    } finally {
        // The main isLoading will cover the apply step, so we can turn this off
        setIsLuckyEnhancing(false);
    }
  };


  const resetAdjustments = () => {
    setAdjustments(initialAdjustments);
    setCustomPrompt('');
    setStrength('Normal');
  };

  const hasActiveSliderAdjustment = React.useMemo(() => !customPrompt.trim() && Object.values(adjustments).some(v => v !== 0), [adjustments, customPrompt]);

  const activePrompt = React.useMemo(() => {
    if (customPrompt.trim()) {
      return customPrompt.trim();
    }
    
    let adjustmentPrompt = '';

    if (adjustments.hdr > 0) {
        const value = adjustments.hdr;
        let strength = 'a moderate ';
        if (value <= 33) strength = 'a subtle ';
        else if (value >= 67) strength = 'a strong and dramatic ';
        
        adjustmentPrompt = `Apply ${strength}high dynamic range (HDR) effect, enhancing details in shadows and highlights, boosting local contrast for a sharp, clear look, and making colors more vibrant.`;
    } else {
        const changedAdjustments = (Object.keys(adjustments) as AdjustmentKey[])
          .filter(key => adjustments[key] !== 0 && key !== 'hdr')
          .map(key => {
            const value = adjustments[key];
            const direction = value > 0 ? 'Increase' : 'Decrease';
            const absValue = Math.abs(value);
            let strength = '';
            if (absValue <= 25) strength = 'slightly ';
            else if (absValue >= 75) strength = 'significantly ';

            switch (key) {
              case 'brightness': return `${direction} brightness ${strength}by about ${absValue}%.`;
              case 'contrast': return `${direction} contrast ${strength}by about ${absValue}%.`;
              case 'saturation': return `${direction} color saturation ${strength}by about ${absValue}%.`;
              case 'highlights': return `${direction} the brightness of the highlights ${strength}by about ${absValue}%.`;
              case 'shadows': return `${direction} the brightness of the shadows ${strength}by about ${absValue}%.`;
              case 'vibrance': return `${direction} color vibrance ${strength}by about ${absValue}%.`;
              case 'temperature': return value > 0 ? `Make the color temperature warmer by about ${value}%.` : `Make the color temperature cooler by about ${-value}%.`;
              case 'sharpness': return `${direction} sharpness ${strength}by about ${absValue}%.`;
              default: return '';
            }
          });
          
        adjustmentPrompt = changedAdjustments.join(' ');
    }
      
    if (!adjustmentPrompt) {
        return '';
    }

    switch (strength) {
        case 'Subtle':
            return `Subtle and gentle. ${adjustmentPrompt}`;
        case 'Strong':
            return `Strong and dramatic. ${adjustmentPrompt}`;
        default: // 'Normal'
            return adjustmentPrompt;
    }
  }, [adjustments, customPrompt, strength]);

  const handleApply = () => {
    if (activePrompt) {
      onApplyAdjustment(activePrompt);
    }
  };

  const adjustmentLabels: Record<AdjustmentKey, string> = {
    brightness: t('adjBrightness'),
    contrast: t('adjContrast'),
    saturation: t('adjSaturation'),
    highlights: t('adjHighlights'),
    shadows: t('adjShadows'),
    vibrance: t('adjVibrance'),
    temperature: t('adjTemperature'),
    sharpness: t('adjSharpness'),
    hdr: t('adjHDR'),
  };

  return (
    <div className="w-full p-6 flex flex-col gap-6 animate-fade-in pb-24">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">{t('adjustTitle')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">{t('adjustDescription')}</p>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
            onClick={handleAutoEnhance}
            disabled={isBusy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-white/20 font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
        >
            <SparkleIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-300 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
            {isAutoEnhancing ? t('autoEnhancing') : t('autoEnhance')}
        </button>
        <button
            onClick={handleLuckyEnhance}
            disabled={isBusy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-white/20 font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
        >
            <SparkleIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-300 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
            {isLuckyEnhancing ? t('adjFeelingLuckyLoading') : t('adjFeelingLucky')}
        </button>
      </div>

      <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700/60"></div>
          <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-500 text-xs font-semibold uppercase">{t('or')}</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700/60"></div>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200/80 dark:border-gray-700/60 rounded-xl p-4 bg-white/40 dark:bg-white/5">
          <RangeSlider
              label={adjustmentLabels['hdr']}
              value={adjustments['hdr']}
              onChange={(value) => handleSliderChange('hdr', value)}
              min={0}
              max={100}
              disabled={isBusy}
              labelValue={`${adjustments['hdr']}%`}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">{t('adjManualTitle')}</h4>
        <div className="grid grid-cols-1 gap-6">
            {(Object.keys(initialAdjustments) as AdjustmentKey[]).filter(key => key !== 'hdr').map(key => (
              <RangeSlider
                key={key}
                label={adjustmentLabels[key]}
                value={adjustments[key]}
                onChange={(value) => handleSliderChange(key, value)}
                min={-100}
                max={100}
                disabled={isBusy}
                labelValue={adjustments[key] > 0 ? `+${adjustments[key]}` : adjustments[key]}
              />
            ))}
        </div>
      </div>

       <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700/60"></div>
          <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-500 text-xs font-semibold uppercase">{t('or')}</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700/60"></div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">{t('adjCustomTitle')}</h4>
        <input
          type="text"
          value={customPrompt}
          onChange={handleCustomChange}
          placeholder={t('adjustPlaceholder')}
          className="bg-white/80 dark:bg-gray-800/50 border border-gray-300/80 dark:border-gray-700/60 text-gray-800 dark:text-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-theme-accent focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-sm shadow-sm"
          disabled={isBusy}
        />
      </div>

      <div className="pt-4 mt-2 border-t border-gray-200/80 dark:border-gray-800/60">
        {hasActiveSliderAdjustment && (
          <div className="animate-fade-in flex flex-col items-center gap-3 mb-4">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('effectStrength')}</h4>
              <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-lg">
                  {(['Subtle', 'Normal', 'Strong'] as const).map(level => (
                      <button
                          key={level}
                          onClick={() => setStrength(level)}
                          disabled={isBusy}
                          className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                              strength === level
                              ? 'bg-white dark:bg-gray-700 text-theme-accent shadow-sm'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                          }`}
                      >
                          {t(`strength${level}` as any)}
                      </button>
                  ))}
              </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
           <button
              onClick={resetAdjustments}
              className="w-full bg-gray-200/80 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold py-4 px-6 rounded-xl transition-all hover:bg-gray-300/90 dark:hover:bg-white/20 active:scale-95 text-sm disabled:opacity-50"
              disabled={isBusy}
          >
              {t('reset')}
          </button>
          <button
              onClick={handleApply}
              className="w-full bg-theme-gradient text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/30 hover:shadow-xl hover:shadow-theme-accent/40 hover:brightness-110 active:scale-95 active:shadow-inner text-sm disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:brightness-100"
              disabled={isBusy || !activePrompt.trim()}
          >
              {t('applyAdjustment')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AdjustmentPanel);
