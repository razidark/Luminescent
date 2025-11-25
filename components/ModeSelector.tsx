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
            className="p-2 bg-gray-200 dark:bg-white/10 rounded-full transition-colors hover:bg-gray-300 dark:hover:bg-white/20"
            aria-label={t('changeMode')}
            data-tooltip-id="app-tooltip"
            data-tooltip-content={t('changeMode')}
        >
            {mode === 'dark' ? (
                <SunIcon className="w-6 h-6 text-yellow-300" />
            ) : (
                <MoonIcon className="w-6 h-6 text-gray-800" />
            )}
        </button>
    );
};

export default ModeSelector;