
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { wikiData } from '../data/wikiData';
import { LuminescenceIcon } from './icons';

interface WikiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WikiModal: React.FC<WikiModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [activeSectionId, setActiveSectionId] = React.useState('intro');

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

  if (!isOpen) return null;

  const activeData = wikiData.find(section => section.id === activeSectionId) || wikiData[0];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative w-full max-w-5xl h-[85vh] glass flex overflow-hidden rounded-3xl m-4 shadow-2xl border border-white/20 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <aside className="w-64 md:w-72 flex-shrink-0 bg-gray-50/50 dark:bg-black/20 border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
            <div className="p-6 flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50">
                <LuminescenceIcon className="w-8 h-8" />
                <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">Luminescent Wiki</span>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {wikiData.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSectionId(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeSectionId === item.id ? 'bg-theme-accent text-white shadow-lg shadow-theme-accent/30' : 'hover:bg-white/40 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeSectionId === item.id ? 'text-white' : ''}`} />
                        <span className="font-medium text-sm">{t(item.titleKey as any)}</span>
                    </button>
                ))}
            </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white/30 dark:bg-black/30">
            <header className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <activeData.icon className="w-6 h-6 text-theme-accent" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t(activeData.titleKey as any)}</h2>
                </div>
                 <button 
                    onClick={onClose} 
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors"
                    aria-label={t('close')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-12">
                    {activeData.sections.map((section, idx) => (
                        <section key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-theme-gradient rounded-full inline-block"></span>
                                {t(section.titleKey as any)}
                            </h3>
                            <div className="prose dark:prose-invert prose-gray max-w-none leading-relaxed text-gray-600 dark:text-gray-300">
                                <p className="whitespace-pre-line">{t(section.contentKey as any)}</p>
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default WikiModal;
