
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';
// FIX: Imported the missing `BellIcon` to resolve a module export error.
import { LuminescenceIcon, UploadIcon, BookIcon } from './icons';
import AnalogClock from './AnalogClock';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeSelector from './ThemeSelector';
import ModeSelector from './ModeSelector';
import BackgroundSelector from './BackgroundSelector';

interface HeaderProps {
    onUploadClick: () => void;
    onWikiClick: () => void;
    onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onUploadClick, onWikiClick, onGoHome }) => {
  const { t, language } = useLanguage();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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
    <header className="w-full py-3 px-4 md:px-8 glass sticky top-0 z-50 border-b-0 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between max-w-[1920px] mx-auto">
        <div className="flex-1 flex justify-start">
            <AnalogClock className="hidden sm:block" />
        </div>
        <div className="flex flex-col items-center justify-center">
            <button 
                onClick={onGoHome} 
                className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-theme-accent rounded-xl p-2 transition-all active:scale-95 hover:bg-white/10 dark:hover:bg-white/5"
            >
              <div className="relative">
                  <div className="absolute inset-0 bg-theme-accent/50 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  <LuminescenceIcon className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-theme-gradient group-hover:brightness-110 transition-all"
                  style={{ backgroundSize: '200% 200%', animation: 'animated-gradient-text 5s ease infinite' }}>
                Luminescent
              </h1>
            </button>
            <div className="w-full max-w-[120px] h-0.5 bg-theme-gradient mt-1 rounded-full opacity-80 blur-[1px]"
                style={{ backgroundSize: '200% 200%', animation: 'animated-gradient-text 5s ease infinite reverse' }} />
        </div>
        <div className="flex-1 flex justify-end items-center gap-4">
            <div className="text-right hidden lg:block">
                 <div className="font-mono text-lg font-bold text-gray-800 dark:text-gray-200 tracking-wider leading-none">
                    {formatTime(currentTime)}
                 </div>
                 <div className="text-[10px] uppercase font-semibold tracking-widest text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(currentTime)}
                 </div>
            </div>
             <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 hidden lg:block mx-1"></div>
            <button
              onClick={onUploadClick}
              data-tooltip-id="app-tooltip"
              data-tooltip-content={t('startWithNewImage')}
              aria-label={t('uploadNew')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-lg transition-all duration-300 hover:bg-gray-200 dark:hover:bg-white/10 font-semibold text-sm group hover:shadow-lg hover:shadow-theme-accent/10"
            >
              <UploadIcon className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span className="hidden sm:inline">{t('uploadNew')}</span>
            </button>
            
            <div className="flex items-center gap-1 p-1 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full backdrop-blur-sm shadow-sm">
                <button
                onClick={onWikiClick}
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('wikiTitle')}
                className="p-2 bg-transparent rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-white/10 relative"
                >
                <BookIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                <BackgroundSelector />
                <ThemeSelector />
                <ModeSelector />
            </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
