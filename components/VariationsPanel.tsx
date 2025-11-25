/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SparkleIcon } from './icons';

type CreativityLevel = 'low' | 'medium' | 'high';

interface VariationsPanelProps {
  onGenerate: (creativity: CreativityLevel) => void;
  isLoading: boolean;
}

const VariationsPanel: React.FC<VariationsPanelProps> = ({ onGenerate, isLoading }) => {
    const { t } = useLanguage();
    const [creativity, setCreativity] = React.useState<CreativityLevel>('medium');

    const creativityLevels: { id: CreativityLevel, nameKey: keyof typeof import('../i18n/locales/en').default }[] = [
        { id: 'low', nameKey: 'creativityLow' },
        { id: 'medium', nameKey: 'creativityMedium' },
        { id: 'high', nameKey: 'creativityHigh' },
    ];

    return (
        <div className="w-full p-6 flex flex-col items-center gap-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('variationsPanelTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2 max-w-md">{t('variationsPanelDescription')}</p>
            
            <div className="flex flex-col items-center gap-2 pt-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('creativityLevel')}</label>
                <div className="flex items-center gap-2">
                    {creativityLevels.map(({ id, nameKey }) => (
                        <button
                            key={id}
                            onClick={() => setCreativity(id)}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-md text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                                creativity === id
                                ? 'bg-theme-gradient text-white shadow-md shadow-theme-accent/20'
                                : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200'
                            }`}
                        >
                            {t(nameKey)}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={() => onGenerate(creativity)}
                disabled={isLoading}
                className="w-full max-w-xs mt-2 bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            >
                <div className="flex items-center justify-center gap-2">
                    <SparkleIcon className="w-5 h-5" />
                    {t('generateVariations')}
                </div>
            </button>
        </div>
    );
};


interface VariationsGeneratedPanelProps {
    variations: string[];
    originalImageUrl: string | null;
    onAccept: (imageDataUrl: string) => void;
    onBack: () => void;
}

const VariationsGeneratedPanel: React.FC<VariationsGeneratedPanelProps> = ({ variations, originalImageUrl, onAccept, onBack }) => {
    const { t } = useLanguage();

    return (
        <div className="w-full p-6 flex flex-col gap-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">{t('variationsPanelTitle')}</h3>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 text-base"
                >
                    {t('variationsBack')}
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {originalImageUrl && (
                    <div className="relative group rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <img src={originalImageUrl} alt={t('variationsOriginal')} className="w-full h-full object-contain aspect-square" />
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs font-bold rounded">
                            {t('variationsOriginal')}
                        </div>
                    </div>
                )}
                {variations.map((imgSrc, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden">
                        <img src={imgSrc} alt={`Variation ${index + 1}`} className="w-full h-full object-contain aspect-square" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={() => onAccept(imgSrc)}
                                className="px-6 py-3 bg-theme-gradient text-white font-bold rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base"
                            >
                                {t('variationsAccept')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Generate = React.memo(VariationsPanel);
const Generated = React.memo(VariationsGeneratedPanel);

const VariationsPanelCompound = Generate as typeof Generate & {
  Generate: typeof Generate;
  Generated: typeof Generated;
};
VariationsPanelCompound.Generate = Generate;
VariationsPanelCompound.Generated = Generated;

export default VariationsPanelCompound;