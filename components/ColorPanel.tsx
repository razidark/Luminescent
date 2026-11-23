/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useEditor } from '../contexts/EditorContext';
import { SparkleIcon, EyedropperIcon } from './icons';
import Spinner from './Spinner';

interface ColorPanelProps {
  isLoading: boolean;
}

const ColorPanel: React.FC<ColorPanelProps> = ({ isLoading: isEditorLoading }) => {
    const { t } = useLanguage();
    const { 
        handleGeneratePalette, 
        handleApplyPalette, 
        isPickingColor, 
        setIsPickingColor, 
        sourceColor,
        handleApplyRecolor
    } = useEditor();
    
    const [palette, setPalette] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedPaletteColor, setSelectedPaletteColor] = useState<string | null>(null);

    // State for Recolor tool
    const [targetColor, setTargetColor] = useState('#0000FF');
    const [tolerance, setTolerance] = useState(10);


    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const newPalette = await handleGeneratePalette();
            setPalette(newPalette);
            setSelectedPaletteColor(newPalette[0] || null);
        } catch(e) {
            // Error is handled by the context
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleApplyPaletteClick = () => {
        if (palette.length > 0) {
            handleApplyPalette(palette, selectedPaletteColor || palette[0]);
        }
    };

    const handleApplyRecolorClick = () => {
        if (sourceColor) {
            handleApplyRecolor(targetColor, tolerance);
        }
    };

    const isBusy = isEditorLoading || isGenerating;

    return (
        <div className="w-full p-6 flex flex-col gap-6 animate-fade-in">
            {/* Palette Generator */}
            <div className="flex flex-col items-center gap-4">
                <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('colorPanelTitle')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2 max-w-md">{t('colorPanelDescription')}</p>

                {!isGenerating && palette.length === 0 && (
                    <div className="w-full max-w-xs flex flex-col items-center pt-2">
                        <button onClick={handleGenerate} disabled={isBusy} className="w-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 text-base flex items-center justify-center gap-2">
                            <SparkleIcon className="w-5 h-5" />
                            {t('generatePalette')}
                        </button>
                    </div>
                )}
                
                {isGenerating && (
                    <div className="flex items-center justify-center gap-4 p-4">
                        <Spinner />
                        <p className="text-gray-600 dark:text-gray-400">{t('loadingPalette')}</p>
                    </div>
                )}
                
                {palette.length > 0 && (
                    <div className="w-full max-w-md flex flex-col items-center gap-4 pt-2 animate-fade-in">
                        <div className="flex flex-wrap justify-center gap-2">
                            {palette.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedPaletteColor(color)}
                                    className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ease-in-out hover:scale-110 active:scale-100 ${selectedPaletteColor === color ? 'border-theme-accent ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 ring-theme-accent scale-110' : 'border-gray-300 dark:border-gray-600'}`}
                                    style={{ backgroundColor: color }}
                                    aria-label={`Select color ${color}`}
                                />
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 w-full">
                            <button onClick={handleGenerate} className="w-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold py-4 px-6 rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 text-base disabled:opacity-50" disabled={isBusy}>
                                {t('regenerate')}
                            </button>
                            <button onClick={handleApplyPaletteClick} className="w-full bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:opacity-50" disabled={isBusy}>
                                {t('applyPalette')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700/60"></div>
                <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-500 text-xs font-semibold uppercase">{t('or')}</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700/60"></div>
            </div>

            {/* AI Recolor */}
            <div className="flex flex-col items-center gap-4">
                <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('recolorTitle')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2 max-w-md">{t('recolorDescription')}</p>
                
                <button onClick={() => setIsPickingColor(true)} disabled={isBusy} className="w-full max-w-xs flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-white/20 font-semibold disabled:opacity-50 disabled:cursor-not-allowed group">
                    <EyedropperIcon className="w-5 h-5" />
                    {isPickingColor ? 'Picking...' : t('pickColor')}
                </button>

                <div className="w-full max-w-md grid grid-cols-2 gap-4 items-center">
                    <div className="flex flex-col items-center gap-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('sourceColor')}</label>
                        <div className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600" style={{ backgroundColor: sourceColor || '#F3F4F6' }} />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <label htmlFor="target-color" className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('targetColor')}</label>
                        <input id="target-color" type="color" value={targetColor} onChange={(e) => setTargetColor(e.target.value)} disabled={isBusy} className="w-16 h-16 p-1 bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-full cursor-pointer"/>
                    </div>
                </div>

                <div className="w-full max-w-md">
                    <label htmlFor="tolerance" className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('tolerance')}</label>
                    <div className="flex items-center gap-2">
                        <input id="tolerance" type="range" min="1" max="100" value={tolerance} onChange={(e) => setTolerance(parseInt(e.target.value, 10))} className="flex-grow" disabled={isBusy} />
                        <span className="text-sm font-mono text-gray-800 dark:text-gray-300 w-8 text-center">{tolerance}</span>
                    </div>
                </div>

                <button onClick={handleApplyRecolorClick} disabled={isBusy || !sourceColor} className="w-full max-w-xs bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:brightness-100">
                    {t('applyRecolor')}
                </button>
            </div>
        </div>
    );
};

export default memo(ColorPanel);