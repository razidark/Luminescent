/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { LuminescenceIcon } from './icons';
import { translations } from '../i18n/locales';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

const getInitialLanguage = (): keyof typeof translations => {
    // A simplified version to avoid dependency on the context, which might not be available here.
    const savedLang = localStorage.getItem('luminescenceLanguage') as keyof typeof translations;
    if (savedLang && translations[savedLang]) {
        return savedLang;
    }
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) return 'pt-BR';
    if (browserLang.startsWith('es')) return 'es';
    return 'en';
};

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const lang = getInitialLanguage();
      // @ts-ignore
      const t = (key: keyof typeof translations['en']) => translations[lang]?.[key] || translations['en'][key];
      
      return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
          <div className="w-full max-w-md text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
            <LuminescenceIcon className="w-12 h-12 mx-auto" />
            <h1 className="mt-4 text-2xl font-bold text-red-600 dark:text-red-400">
              {t('errorBoundaryTitle')}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('errorBoundaryMessage')}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-theme-gradient text-white font-bold rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner"
            >
              {t('reloadApp')}
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
