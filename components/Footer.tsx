/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="w-full py-8 px-4 text-center">
      <div 
        className="text-sm text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800 pt-8 max-w-lg mx-auto"
        dangerouslySetInnerHTML={{ __html: t('footerText') }}
      />
    </footer>
  );
};

export default React.memo(Footer);