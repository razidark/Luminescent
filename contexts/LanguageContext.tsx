
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { translations } from '../i18n/locales';

export type Language = 'en' | 'pt-BR' | 'es';
type TranslationKey = keyof typeof translations['en'];

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
    const saved = localStorage.getItem('luminescenceLanguage') as Language;
    if (saved && ['en', 'pt-BR', 'es'].includes(saved)) {
        return saved;
    }
    
    // Default to English if no preference, unless browser is distinctively PT or ES
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) return 'pt-BR';
    if (browserLang.startsWith('es')) return 'es';
    
    return 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = React.useState<Language>(getInitialLanguage);

    React.useEffect(() => {
        localStorage.setItem('luminescenceLanguage', language);
        document.documentElement.lang = language;
        document.documentElement.dir = 'ltr'; // Assuming all current languages are LTR
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: TranslationKey, fallback?: string): string => {
        // @ts-ignore - Dynamic key access
        return translations[language][key] || translations['en'][key] || fallback || String(key);
    };

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
