
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LuminescenceIcon } from './icons';

const EmptyStatePanel: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="w-full h-full glass-panel p-8 flex flex-col items-center justify-center gap-6 animate-fade-in text-center min-h-[300px] relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-theme-accent/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
            
            <div className="relative z-10 p-6 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-xl backdrop-blur-md">
                <LuminescenceIcon className="w-16 h-16 text-gray-800 dark:text-white drop-shadow-md" />
            </div>
            
            <div className="relative z-10 max-w-sm space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t('emptyPanelTitle')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{t('emptyPanelDescription')}</p>
            </div>
        </div>
    );
};

export default EmptyStatePanel;
