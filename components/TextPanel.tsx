
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { type TextOptions, type Position } from '../types';
import RangeSlider from './RangeSlider';
import { SparkleIcon } from './icons';
import { useEditor } from '../contexts/EditorContext';

interface TextPanelProps {
  onApplyText: (options: TextOptions) => void;
  isLoading: boolean;
  initialText?: string | null;
}

const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void, disabled: boolean }> = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`${checked ? 'bg-theme-accent' : 'bg-gray-300 dark:bg-gray-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    <span
      aria-hidden="true"
      className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);


const TextPanel: React.FC<TextPanelProps> = ({ onApplyText, isLoading, initialText }) => {
    const { t } = useLanguage();
    const { handleGenerateCreativeText } = useEditor();
    const [text, setText] = React.useState('Hello World');
    const [fontFamily, setFontFamily] = React.useState('Sora');
    const [size, setSize] = React.useState(80); // Relative size
    const [color, setColor] = React.useState('#FFFFFF');
    const [isBold, setIsBold] = React.useState(false);
    const [isItalic, setIsItalic] = React.useState(false);
    const [position, setPosition] = React.useState<Position>('middle-center');
    const [isMagicLoading, setIsMagicLoading] = React.useState(false);
    
    // New state for advanced options
    const [strokeEnabled, setStrokeEnabled] = React.useState(true);
    const [strokeColor, setStrokeColor] = React.useState('#000000');
    const [strokeWidth, setStrokeWidth] = React.useState(4);
    const [shadowEnabled, setShadowEnabled] = React.useState(true);
    const [shadowColor, setShadowColor] = React.useState('#000000');
    const [shadowBlur, setShadowBlur] = React.useState(10);
    const [shadowOffsetX, setShadowOffsetX] = React.useState(5);
    const [shadowOffsetY, setShadowOffsetY] = React.useState(5);

    const predefinedColors = [
      '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
      '#FFFF00', '#00FFFF', '#FF00FF', '#FFA500', '#800080',
      '#FFC0CB', '#4B0082', '#A52A2A', '#808080', '#008080'
    ];

    React.useEffect(() => {
        if (initialText) {
            setText(initialText);
        }
    }, [initialText]);

    const fonts = ['Sora', 'Roboto Mono', 'Playfair Display', 'Lobster', 'Arial', 'Verdana', 'Times New Roman'];
    const positions: Position[] = [
        'top-left', 'top-center', 'top-right',
        'middle-left', 'middle-center', 'middle-right',
        'bottom-left', 'bottom-center', 'bottom-right'
    ];

    const handleApply = () => {
        const options: TextOptions = { text, fontFamily, size, color, isBold, isItalic, position };
        if (strokeEnabled) {
            options.stroke = { color: strokeColor, width: strokeWidth };
        }
        if (shadowEnabled) {
            options.shadow = { color: shadowColor, blur: shadowBlur, offsetX: shadowOffsetX, offsetY: shadowOffsetY };
        }
        onApplyText(options);
    };

    const handleMagicText = async (type: 'quote' | 'caption' | 'pun') => {
        setIsMagicLoading(true);
        try {
            const result = await handleGenerateCreativeText(type);
            if (result.text) {
                setText(result.text);
                setColor(result.color);
            }
        } finally {
            setIsMagicLoading(false);
        }
    };

    const isBusy = isLoading || isMagicLoading;

    return (
        <div className="p-6 flex flex-col gap-6 animate-fade-in pb-24">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">{t('addTextTitle')}</h3>
            </div>
            
            {/* Magic Text Section */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-200 dark:border-purple-800/50">
                <div className="flex items-center gap-2 mb-3">
                    <SparkleIcon className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider">{t('magicTextTitle')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => handleMagicText('quote')}
                        disabled={isBusy}
                        className="px-2 py-2 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {t('magicTextQuote')}
                    </button>
                    <button
                        onClick={() => handleMagicText('caption')}
                        disabled={isBusy}
                        className="px-2 py-2 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {t('magicTextCaption')}
                    </button>
                    <button
                        onClick={() => handleMagicText('pun')}
                        disabled={isBusy}
                        className="px-2 py-2 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {t('magicTextPun')}
                    </button>
                </div>
            </div>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('addTextPlaceholder')}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-theme-accent focus:outline-none transition disabled:cursor-not-allowed disabled:opacity-60 text-base shadow-sm"
                disabled={isBusy}
                rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{t('font')}</label>
                    <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} disabled={isBusy} className="w-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-theme-accent focus:outline-none transition text-sm">
                        {fonts.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{t('style')}</label>
                    <div className="flex gap-1">
                        <button onClick={() => setIsBold(!isBold)} className={`flex-1 h-10 font-bold rounded-lg transition-colors border border-transparent ${isBold ? 'bg-theme-accent text-white shadow-md' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'}`}>B</button>
                        <button onClick={() => setIsItalic(!isItalic)} className={`flex-1 h-10 italic font-serif rounded-lg transition-colors border border-transparent ${isItalic ? 'bg-theme-accent text-white shadow-md' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'}`}>I</button>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{t('color')}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                     {predefinedColors.map(c => (
                         <button 
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-theme-accent scale-110 ring-1 ring-offset-1 ring-offset-transparent ring-theme-accent' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                         />
                     ))}
                </div>
                <div className="h-10 bg-gray-100 dark:bg-white/10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center px-2">
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} disabled={isBusy} className="w-full h-8 bg-transparent border-none cursor-pointer rounded"/>
                </div>
            </div>

            <div>
                <RangeSlider label={t('size')} value={size} onChange={setSize} min={10} max={200} disabled={isBusy} />
            </div>
            
            <div className="space-y-4">
                <div className="bg-white/60 dark:bg-white/5 rounded-xl p-4 border border-gray-200/80 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <label className="font-bold text-gray-700 dark:text-gray-200 text-sm">{t('outline')}</label>
                        <ToggleSwitch checked={strokeEnabled} onChange={setStrokeEnabled} disabled={isBusy} />
                    </div>
                    {strokeEnabled && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-3">
                               <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('color')}</label>
                               <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} disabled={isBusy} className="w-8 h-8 p-0.5 bg-transparent border border-gray-300 dark:border-gray-600 rounded cursor-pointer"/>
                            </div>
                            <RangeSlider label={t('width')} value={strokeWidth} onChange={setStrokeWidth} min={1} max={20} disabled={isBusy} />
                        </div>
                    )}
                </div>

                <div className="bg-white/60 dark:bg-white/5 rounded-xl p-4 border border-gray-200/80 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <label className="font-bold text-gray-700 dark:text-gray-200 text-sm">{t('shadow')}</label>
                        <ToggleSwitch checked={shadowEnabled} onChange={setShadowEnabled} disabled={isBusy} />
                    </div>
                    {shadowEnabled && (
                        <div className="space-y-4 animate-fade-in">
                             <div className="flex items-center gap-3">
                               <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('color')}</label>
                               <input type="color" value={shadowColor} onChange={e => setShadowColor(e.target.value)} disabled={isBusy} className="w-8 h-8 p-0.5 bg-transparent border border-gray-300 dark:border-gray-600 rounded cursor-pointer"/>
                            </div>
                            <RangeSlider label={t('blur')} value={shadowBlur} onChange={setShadowBlur} min={0} max={50} disabled={isBusy} />
                            <div className="grid grid-cols-2 gap-4">
                                <RangeSlider label={`X ${t('offset')}`} value={shadowOffsetX} onChange={setShadowOffsetX} min={-50} max={50} disabled={isBusy} />
                                <RangeSlider label={`Y ${t('offset')}`} value={shadowOffsetY} onChange={setShadowOffsetY} min={-50} max={50} disabled={isBusy} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
             <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{t('position')}</label>
                <div className="grid grid-cols-3 gap-2 w-32 h-32 mx-auto">
                    {positions.map(pos => (
                        <button 
                            key={pos} 
                            onClick={() => setPosition(pos)} 
                            className={`w-full h-full border-2 rounded-md transition-all hover:scale-105 ${position === pos ? 'bg-theme-accent border-theme-accent shadow-sm' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'}`}
                        ></button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleApply}
                className="w-full mt-2 bg-theme-gradient text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-0.5 active:scale-95 active:shadow-inner text-sm disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                disabled={isBusy || !text.trim()}
            >
                {t('applyText')}
            </button>
        </div>
    );
};

export default React.memo(TextPanel);
