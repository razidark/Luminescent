
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
    <aside className="w-64 flex-shrink-0 rounded-lg animated-border-box sticky top-28">
      <div className="w-full h-full glass p-4 flex flex-col gap-2 rounded-lg">
        <h3 className="text-lg font-bold text-center text-gray-800 dark:text-gray-200 mb-2">{t('history')}</h3>
        <div className="overflow-y-auto flex-grow flex flex-col-reverse gap-2 custom-scrollbar pr-1">
            {[...history].reverse().map((item, reverseIndex) => {
                const index = history.length - 1 - reverseIndex;
                const isCurrent = index === currentIndex;
                const isFuture = index > currentIndex;
                
                const translatedAction = t(item.actionKey as any, item.action);
                const finalAction = item.actionParams 
                  ? Object.entries(item.actionParams).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translatedAction)
                  : translatedAction;

                return (
                    <div key={index} className="relative group">
                        <button
                            onClick={() => onJump(index)}
                            aria-label={`${t('jumpTo')} ${finalAction}`}
                            className={`w-full flex items-center gap-3 p-2 rounded-md transition-all duration-200 text-left overflow-hidden ${
                                isCurrent 
                                    ? 'bg-theme-accent/20' 
                                    : isFuture
                                    ? 'bg-gray-500/10 dark:bg-gray-700/30 opacity-60 hover:bg-gray-500/20 dark:hover:bg-gray-700/60'
                                    : 'bg-gray-500/20 dark:bg-gray-700/50 hover:bg-gray-500/30 dark:hover:bg-gray-700/80'
                            }`}
                        >
                            {isCurrent && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/4 w-1 bg-theme-gradient rounded-r-full" />
                            )}
                            <img 
                                src={item.thumbnailUrl} 
                                alt={item.action}
                                className={`w-12 h-12 rounded-md object-cover flex-shrink-0 transition-all duration-200 ml-2 ${
                                    isCurrent ? 'ring-2 ring-theme-accent ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-900/80' : ''
                                }`}
                            />
                            <div className="flex-1 overflow-hidden">
                                <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
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
                            className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full bg-gray-200/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-theme-accent hover:text-white"
                        >
                            <DownloadIcon className="w-4 h-4" />
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
