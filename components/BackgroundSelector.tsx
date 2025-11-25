/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useBackground, BackgroundType } from '../contexts/BackgroundContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
// FIX: Imported all missing icons to resolve module export errors.
import { LayersIcon, NoSymbolIcon, SparkleIcon, CircuitBoardIcon, GridIcon, CodeBracketIcon } from './icons';
import { useClickOutside } from '../hooks/useClickOutside';

const backgrounds: { id: BackgroundType, nameKey: keyof typeof import('../i18n/locales/en').default, Icon: React.FC<{ className?: string }> }[] = [
    { id: 'none', nameKey: 'backgroundNone', Icon: NoSymbolIcon },
    { id: 'nebula', nameKey: 'backgroundNebula', Icon: SparkleIcon },
    { id: 'circuit', nameKey: 'backgroundCircuit', Icon: CircuitBoardIcon },
    { id: 'grid', nameKey: 'backgroundGrid', Icon: GridIcon },
    { id: 'matrix', nameKey: 'backgroundMatrix', Icon: CodeBracketIcon },
];

const BackgroundSelector: React.FC = () => {
    const { t } = useLanguage();
    const { background, setBackground } = useBackground();
    const { mode } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => setIsOpen(false));

    if (mode !== 'dark') {
        return null; // Only show selector in dark mode
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 bg-gray-200 dark:bg-white/10 rounded-full transition-colors hover:bg-gray-300 dark:hover:bg-white/20"
                aria-label={t('changeBackground')}
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('changeBackground')}
            >
                <LayersIcon className="w-6 h-6 text-gray-800 dark:text-gray-300" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 max-h-96 overflow-y-auto bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl z-50 animate-fade-in">
                    <ul className="py-1">
                        {backgrounds.map(({ id, nameKey, Icon }) => (
                            <li key={id}>
                                <button
                                    onClick={() => {
                                        setBackground(id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${background === id ? 'bg-theme-accent/50 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'}`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="truncate">{t(nameKey)}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default BackgroundSelector;