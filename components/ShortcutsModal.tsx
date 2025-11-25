
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Imported missing icons to resolve module export errors.
import { LuminescenceIcon, UndoIcon, RedoIcon, HandIcon, ZoomInIcon, EyeIcon, HistoryIcon } from './icons';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  const shortcuts = React.useMemo(() => [
    {
      Icon: UndoIcon,
      titleKey: 'shortcutsUndo',
      descriptionKey: 'shortcutsUndoDesc',
      keys: ['Ctrl', 'Z']
    },
    {
      Icon: RedoIcon,
      titleKey: 'shortcutsRedo',
      descriptionKey: 'shortcutsRedoDesc',
      keys: ['Ctrl', 'Y']
    },
    {
      Icon: EyeIcon,
      titleKey: 'shortcutsPeek',
      descriptionKey: 'shortcutsPeekDesc',
      keys: ['\\']
    },
    {
      Icon: HandIcon,
      titleKey: 'shortcutsPan',
      descriptionKey: 'shortcutsPanDesc',
      keys: ['Space', 'Drag']
    },
    {
      Icon: ZoomInIcon,
      titleKey: 'shortcutsZoom',
      descriptionKey: 'shortcutsZoomDesc',
      keys: ['Ctrl', 'Scroll']
    },
    {
      Icon: EyeIcon,
      titleKey: 'shortcutsCompare',
      descriptionKey: 'shortcutsCompareDesc',
      keys: ['Click']
    },
     {
      Icon: HistoryIcon,
      titleKey: 'shortcutsHistory',
      descriptionKey: 'shortcutsHistoryDesc',
      keys: ['Click']
    },
  ], []);

  if (!isOpen) {
    return null;
  }

  // FIX: Explicitly typed the `children` prop for the Key component. In modern versions of React's type definitions (@types/react@^18), `children` is no longer an implicit part of the `React.FC` type.
  const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">{children}</kbd>
  );

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative w-full max-w-lg max-h-[90vh] glass flex flex-col overflow-hidden rounded-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <LuminescenceIcon className="w-7 h-7" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('shortcutsTitle')}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
            aria-label={t('close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <main className="overflow-y-auto p-6 custom-scrollbar">
          <ul className="space-y-4">
            {shortcuts.map(({ Icon, titleKey, descriptionKey, keys }, index) => (
              <li key={index} className="flex items-start gap-4 p-3 bg-white/50 dark:bg-white/5 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t(titleKey as any)}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t(descriptionKey as any)}</p>
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  {keys.map((key, i) => (
                    <React.Fragment key={i}>
                      <Key>{key}</Key>
                      {i < keys.length - 1 && <span className="text-gray-400 dark:text-gray-500 font-semibold">+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
};

export default ShortcutsModal;