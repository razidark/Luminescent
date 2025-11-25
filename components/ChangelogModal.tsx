
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { changelogData } from '../data/changelogData';
// FIX: Imported missing icons to resolve module export errors.
import { SparkleIcon, ArrowUpIcon, WrenchIcon, LuminescenceIcon } from './icons';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
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

  const categoryStyles = React.useMemo(() => ({
    new: {
      Icon: SparkleIcon,
      bgColor: 'bg-green-100 dark:bg-green-900/40',
      textColor: 'text-green-600 dark:text-green-300',
      label: t('changelogCategoryNew'),
    },
    improvement: {
      Icon: ArrowUpIcon,
      bgColor: 'bg-blue-100 dark:bg-blue-900/40',
      textColor: 'text-blue-600 dark:text-blue-300',
      label: t('changelogCategoryImprovement'),
    },
    fix: {
      Icon: WrenchIcon,
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/40',
      textColor: 'text-yellow-600 dark:text-yellow-300',
      label: t('changelogCategoryFix'),
    },
  }), [t]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] glass flex flex-col overflow-hidden rounded-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <LuminescenceIcon className="w-7 h-7" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('changelogTitle')}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
            aria-label={t('close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <main className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {changelogData.map((version) => (
            <section key={version.version}>
              <div className="flex items-baseline gap-3 mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Version {version.version}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{version.date}</p>
              </div>
              <ul className="space-y-4">
                {version.changes.map((change, index) => {
                   const styles = categoryStyles[change.category];
                   return (
                     <li key={index} className="flex items-start gap-4">
                       <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${styles.bgColor} ${styles.textColor}`}>
                         <styles.Icon className="w-5 h-5" />
                       </div>
                       <div>
                         <p className={`text-xs font-bold uppercase tracking-wider ${styles.textColor}`}>{styles.label}</p>
                         <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{t(change.titleKey)}</h4>
                         <p className="text-sm text-gray-600 dark:text-gray-400">{t(change.descriptionKey)}</p>
                       </div>
                     </li>
                   );
                })}
              </ul>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default ChangelogModal;
