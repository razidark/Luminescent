
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
  const [hasBridge, setHasBridge] = React.useState(false);

  // Verifica a disponibilidade do bridge do AI Studio
  React.useEffect(() => {
      const checkKey = async () => {
          const bridgeExists = typeof (window as any).aistudio !== 'undefined';
          setHasBridge(bridgeExists);
          
          if (bridgeExists && (window as any).aistudio.hasSelectedApiKey) {
              try {
                  const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                  setIsLoggedIn(hasKey);
              } catch (e) {
                  console.error("Erro ao verificar chave", e);
              }
          } else {
              // Se não há bridge, verificamos se há uma chave de ambiente (Vercel)
              const envKey = process.env.API_KEY;
              setIsLoggedIn(!!(envKey && envKey !== "undefined" && envKey !== "null"));
          }
      };
      checkKey();
  }, []);

  const handleLoginToggle = async () => {
      if (hasBridge && (window as any).aistudio.openSelectKey) {
          try {
              await (window as any).aistudio.openSelectKey();
              // Segundo as diretrizes, assumimos sucesso imediatamente para mitigar race conditions
              setIsLoggedIn(true);
          } catch (e) {
              console.error("Login falhou", e);
          }
      } else {
          // Se o usuário está no Vercel (browser padrão), redirecionamos para a documentação de faturamento
          // pois ele precisará configurar a API_KEY nas configurações do projeto.
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
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all border ${isLoggedIn ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md hover:border-gray-400'} group relative overflow-hidden`}
                >
                    <div className="flex items-center gap-2">
                        {/* Ícone Estilizado do Google */}
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.25.81-.59z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {isLoggedIn ? t('online') : t('loginWithGoogle')}
                        </span>
                    </div>
                    {isLoggedIn && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900 animate-pulse"></span>}
                </button>
                {!isLoggedIn && !hasBridge && (
                    <span className="text-[8px] text-gray-400 mt-1 font-bold uppercase animate-pulse">Aviso: Modo Vercel</span>
                )}
            </div>

            <button
              onClick={onUploadClick}
              data-tooltip-id="app-tooltip"
              data-tooltip-content={t('startWithNewImage')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-lg transition-all duration-300 hover:bg-gray-200 dark:hover:bg-white/10 font-semibold text-sm group hover:shadow-lg"
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
