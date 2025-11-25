
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { translations } from '../i18n/locales';

type Language = 'pt-BR'; // Restrict to PT-BR
type TranslationKey = keyof typeof translations['pt-BR'];

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Hardcode to pt-BR
    const language: Language = 'pt-BR';

    React.useEffect(() => {
        document.documentElement.lang = 'pt-BR';
        document.documentElement.dir = 'ltr';
    }, []);

    const t = (key: TranslationKey, fallback?: string): string => {
        // @ts-ignore - fallback if key is missing in PT (unlikely)
        return translations['pt-BR'][key] || fallback || String(key);
    };

    // No-op setter
    const setLanguage = () => {};

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = React.useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
