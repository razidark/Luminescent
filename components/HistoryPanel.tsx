
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';
import { type HistoryItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Imported the missing `DownloadIcon` to resolve a module export error.
import { DownloadIcon } from './icons';

interface HistoryPanelProps {
  history: HistoryItem[];
  currentIndex: number;
  onJump: (index: number) => void;
  onDownload: (file: File) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, currentIndex, onJump, onDownload }) => {
  const { t } = useLanguage();
  return (
    <aside className="w-64 flex-shrink-0 sticky top-28 z-20">
      <div className="w-full h-[70vh] glass-card-premium p-5 flex flex-col gap-3 rounded-3xl border border-white/20 dark:border-white/10 shadow-xl">
        <h3 className="text-sm font-black uppercase tracking-widest text-center text-gray-900 dark:text-white pb-2 border-b border-gray-200/50 dark:border-white/5">{t('history')}</h3>
        <div className="overflow-y-auto flex-grow flex flex-col-reverse gap-2.5 custom-scrollbar pr-1">
            {[...history].reverse().map((item, reverseIndex) => {
                const index = history.length - 1 - reverseIndex;
                const isCurrent = index === currentIndex;
                const isFuture = index > currentIndex;
                
                const translatedAction = t(item.actionKey as any, item.action);
                const finalAction = item.actionParams 
                  ? Object.entries(item.actionParams).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translatedAction)
                  : translatedAction;

                return (
                    <div key={index} className="relative group/history-item">
                        <button
                            onClick={() => onJump(index)}
                            aria-label={`${t('jumpTo')} ${finalAction}`}
                            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-300 text-left overflow-hidden relative border ${
                                isCurrent 
                                    ? 'bg-theme-accent/15 border-theme-accent/40 shadow-sm shadow-theme-accent/5' 
                                    : isFuture
                                    ? 'bg-gray-100/30 dark:bg-white/5 border-transparent opacity-50 hover:opacity-75 hover:bg-gray-100/50 dark:hover:bg-white/10'
                                    : 'bg-gray-100/50 dark:bg-white/5 border-transparent hover:bg-gray-100/80 dark:hover:bg-white/10 hover:border-gray-200 dark:hover:border-white/10'
                            }`}
                        >
                            {isCurrent && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-theme-gradient rounded-r-full" />
                            )}
                            <img 
                                src={item.thumbnailUrl} 
                                alt={item.action}
                                className={`w-11 h-11 rounded-lg object-cover flex-shrink-0 transition-all duration-300 ml-1.5 ${
                                    isCurrent ? 'ring-2 ring-theme-accent/60 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''
                                }`}
                            />
                            <div className="flex-grow min-w-0 pr-6">
                                <p className={`text-xs font-bold truncate transition-colors duration-200 ${isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {finalAction}
                                </p>
                            </div>
                        </button>
                        <button
                            onClick={(e) => {
                                  e.stopPropagation();
                                  onDownload(item.file);
                            }}
                            aria-label={`${t('download')} ${finalAction}`}
                            data-tooltip-id="app-tooltip"
                            data-tooltip-content={`${t('download')} "${finalAction}"`}
                            className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-750 dark:text-gray-200 shadow-md border border-gray-200/50 dark:border-white/10 opacity-0 group-hover/history-item:opacity-100 transition-all duration-200 hover:bg-theme-gradient hover:text-white hover:border-transparent hover:scale-105 active:scale-90"
                        >
                            <DownloadIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )
            })}
        </div>
      </div>
    </aside>
  );
};

export default React.memo(HistoryPanel);
