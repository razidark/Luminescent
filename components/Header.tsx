
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';
import { LuminescenceIcon, UploadIcon, BookIcon, ChatIcon, QuestionMarkIcon, HistoryIcon } from './icons';
import AnalogClock from './AnalogClock';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeSelector from './ThemeSelector';
import ModeSelector from './ModeSelector';
import BackgroundSelector from './BackgroundSelector';
import LanguageSelector from './LanguageSelector';

const DigitalClock: React.FC = () => {
    const { language } = useLanguage();
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(language.replace('_', '-'), {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(language.replace('_', '-'), {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    };

    return (
        <div className="text-right hidden xl:block">
            <div className="font-mono text-lg font-bold text-gray-800 dark:text-gray-200 tracking-wider leading-none">
                {formatTime(currentTime)}
            </div>
            <div className="text-[10px] uppercase font-semibold tracking-widest text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(currentTime)}
            </div>
        </div>
    );
};

interface HeaderProps {
    onUploadClick: () => void;
    onWikiClick: () => void;
    onGoHome: () => void;
    onChatClick?: () => void;
    onShortcutsClick?: () => void;
    onHistoryClick?: () => void;
    isHistoryAvailable?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    onUploadClick, 
    onWikiClick, 
    onGoHome,
    onChatClick,
    onShortcutsClick,
    onHistoryClick,
    isHistoryAvailable
}) => {
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
      const checkKey = async () => {
          if (typeof (window as any).aistudio !== 'undefined' && (window as any).aistudio.hasSelectedApiKey) {
              const hasKey = await (window as any).aistudio.hasSelectedApiKey();
              setIsLoggedIn(hasKey);
          }
      };
      checkKey();
  }, []);

  const handleLoginToggle = async () => {
      if (typeof (window as any).aistudio !== 'undefined' && (window as any).aistudio.openSelectKey) {
          try {
              await (window as any).aistudio.openSelectKey();
              // Assume success as per Gemini API safety guidelines for race conditions
              setIsLoggedIn(true);
          } catch (e) {
              console.error("Login failed", e);
          }
      } else {
          // Fallback if accessed outside of AI Studio wrapper
          window.open('https://ai.google.dev/gemini-api/docs/billing', '_blank');
      }
  };

  return (
    <header className="w-full py-3 px-4 md:px-8 glass sticky top-0 z-50 border-b-0 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between max-w-[1920px] mx-auto">
        <div className="flex-1 flex justify-start items-center gap-4">
            <AnalogClock className="hidden sm:block" />
             <div className="flex items-center gap-2">
                {onChatClick && (
                    <button
                        onClick={onChatClick}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
                        data-tooltip-id="app-tooltip"
                        data-tooltip-content="AI Assistant"
                    >
                        <ChatIcon className="w-7 h-7" />
                    </button>
                )}
                {onShortcutsClick && (
                    <button
                        onClick={onShortcutsClick}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
                        data-tooltip-id="app-tooltip"
                        data-tooltip-content={t('showShortcuts')}
                    >
                        <QuestionMarkIcon className="w-7 h-7" />
                    </button>
                )}
                {isHistoryAvailable && onHistoryClick && (
                    <button
                        onClick={onHistoryClick}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
                        data-tooltip-id="app-tooltip"
                        data-tooltip-content={t('showHistory')}
                    >
                        <HistoryIcon className="w-7 h-7" />
                    </button>
                )}
            </div>
        </div>
        
        <div className="flex flex-col items-center justify-center">
            <button 
                onClick={onGoHome} 
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('goHome')}
                className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-theme-accent rounded-xl p-2 transition-all active:scale-95 hover:bg-white/10 dark:hover:bg-white/5"
            >
              <div className="relative">
                  <div className="absolute inset-0 bg-theme-accent/50 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  <LuminescenceIcon className="w-9 h-9 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-theme-gradient group-hover:brightness-110 transition-all hidden md:block"
                  style={{ backgroundSize: '200% 200%', animation: 'animated-gradient-text 5s ease infinite' }}>
                Luminescent
              </h1>
            </button>
            <div className="w-full max-w-[120px] h-0.5 bg-theme-gradient mt-1 rounded-full opacity-80 blur-[1px] hidden md:block"
                style={{ backgroundSize: '200% 200%', animation: 'animated-gradient-text 5s ease infinite reverse' }} />
        </div>
        
        <div className="flex-1 flex justify-end items-center gap-4">
            <DigitalClock />

             <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 hidden lg:block mx-1"></div>
            
            <div className="flex flex-col items-end">
                <button
                    onClick={handleLoginToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${isLoggedIn ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300'} group relative`}
                    data-tooltip-id="app-tooltip"
                    data-tooltip-content={isLoggedIn ? t('connectedStatus') : t('loginWithGoogle')}
                >
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${isLoggedIn ? 'text-green-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {isLoggedIn && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900 animate-pulse"></span>}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">
                        {isLoggedIn ? t('online') : t('loginWithGoogle')}
                    </span>
                </button>
                {!isLoggedIn && (
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-400 hover:text-theme-accent transition-colors mt-1 uppercase tracking-tighter font-bold">
                        Billing Info &raquo;
                    </a>
                )}
            </div>

            <button
              onClick={onUploadClick}
              data-tooltip-id="app-tooltip"
              data-tooltip-content={t('startWithNewImage')}
              aria-label={t('uploadNew')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-lg transition-all duration-300 hover:bg-gray-200 dark:hover:bg-white/10 font-semibold text-sm group hover:shadow-lg hover:shadow-theme-accent/10"
            >
              <UploadIcon className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="hidden sm:inline">{t('uploadNew')}</span>
            </button>
            
            <div className="flex items-center gap-1 p-1 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full backdrop-blur-sm shadow-sm">
                <button
                onClick={onWikiClick}
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('wikiTitle')}
                className="p-2 bg-transparent rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-white/10 relative"
                >
                <BookIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                <BackgroundSelector />
                <ThemeSelector />
                <LanguageSelector />
                <ModeSelector />
            </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
