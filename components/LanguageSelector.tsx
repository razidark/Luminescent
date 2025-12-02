
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { BrazilFlagIcon, EnglishFlagIcon, SpanishFlagIcon } from './icons';

const languages: { id: Language, name: string, Icon: React.FC<{ className?: string }> }[] = [
    { id: 'en', name: 'English', Icon: EnglishFlagIcon },
    { id: 'pt-BR', name: 'Português', Icon: BrazilFlagIcon },
    { id: 'es', name: 'Español', Icon: SpanishFlagIcon },
];

const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => setIsOpen(false));

    const currentLang = languages.find(l => l.id === language) || languages[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 flex items-center justify-center bg-gray-200 dark:bg-white/10 rounded-full transition-colors hover:bg-gray-300 dark:hover:bg-white/20"
                aria-label="Select language"
                data-tooltip-id="app-tooltip"
                data-tooltip-content="Change Language"
            >
                <currentLang.Icon className="w-6 h-6 rounded-sm shadow-sm object-cover" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 overflow-hidden bg-gray-100/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl z-50 animate-fade-in">
                    <ul className="py-1">
                        {languages.map((lang) => (
                            <li key={lang.id}>
                                <button
                                    onClick={() => {
                                        setLanguage(lang.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-all ${language === lang.id ? 'bg-theme-accent/10 text-theme-accent font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                >
                                    <lang.Icon className="w-5 h-5 rounded-sm shadow-sm" />
                                    <span className="truncate">{lang.name}</span>
                                    {language === lang.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-theme-accent" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
