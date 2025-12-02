
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { PaletteIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useClickOutside } from '../hooks/useClickOutside';

interface ThemeGroup {
    labelKey: string;
    keys: string[];
}

// Define groups for better organization
const themeGroups: ThemeGroup[] = [
    {
        labelKey: 'themeGroupFeatured',
        keys: ['rainbow', 'luminescence', 'midnight', 'royal']
    },
    {
        labelKey: 'themeGroupWarm',
        keys: ['crimson', 'sunset', 'gold', 'coffee', 'neon', 'lime']
    },
    {
        labelKey: 'themeGroupCool',
        keys: ['forest', 'mint', 'ocean', 'arctic']
    },
    {
        labelKey: 'themeGroupSoft',
        keys: ['lavender', 'candy', 'sakura']
    },
    {
        labelKey: 'themeGroupMono',
        keys: ['graphite']
    }
];

const ThemeSelector: React.FC = () => {
    const { t } = useLanguage();
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => setIsOpen(false));

    // Find the key for the current theme
    const currentThemeKey = Object.keys(themes).find(key => themes[key].name === theme.name) || 'rainbow';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 bg-gray-200 dark:bg-white/10 rounded-full transition-colors hover:bg-gray-300 dark:hover:bg-white/20"
                aria-label="Select theme"
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('changeTheme')}
            >
                <PaletteIcon className="w-6 h-6 text-gray-800 dark:text-gray-300" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 max-h-[80vh] overflow-y-auto bg-gray-100/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl z-50 animate-fade-in custom-scrollbar">
                    <div className="py-2">
                        {themeGroups.map((group, groupIndex) => (
                            <div key={group.labelKey} className={groupIndex > 0 ? 'mt-2 pt-2 border-t border-gray-200 dark:border-gray-700' : ''}>
                                <h4 className="px-4 py-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t(group.labelKey as any)}
                                </h4>
                                <ul className="mt-1">
                                    {group.keys.map(key => {
                                        const themeOption = themes[key];
                                        if (!themeOption) return null;
                                        
                                        return (
                                            <li key={key}>
                                                <button
                                                    onClick={() => {
                                                        setTheme(key);
                                                        setIsOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-all ${currentThemeKey === key ? 'bg-theme-accent text-white font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                                >
                                                    <div 
                                                        className={`w-5 h-5 rounded-full shadow-sm ${currentThemeKey === key ? 'ring-2 ring-white dark:ring-gray-900' : ''}`} 
                                                        style={{ background: `linear-gradient(to right, ${themeOption.gradientFrom}, ${themeOption.gradientTo})` }} 
                                                    />
                                                    <span className="truncate flex-grow">{t(themeOption.name as any)}</span>
                                                    {currentThemeKey === key && (
                                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                    )}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSelector;
