/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useTheme } from '../contexts/ThemeContext';
// FIX: Imported the missing `SunIcon` and `MoonIcon` to resolve module export errors.
import { SunIcon, MoonIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

const ModeSelector: React.FC = () => {
    const { t } = useLanguage();
    const { mode, setMode } = useTheme();

    const toggleMode = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleMode}
            className="p-2 bg-transparent rounded-xl transition-all duration-200 hover:bg-gray-200/70 dark:hover:bg-white/10 active:scale-90"
            aria-label={t('changeMode')}
            data-tooltip-id="app-tooltip"
            data-tooltip-content={t('changeMode')}
        >
            {mode === 'dark' ? (
                <SunIcon className="w-4.5 h-4.5 text-yellow-500 dark:text-yellow-400" />
            ) : (
                <MoonIcon className="w-4.5 h-4.5 text-gray-600 dark:text-gray-400" />
            )}
        </button>
    );
};

export default ModeSelector;