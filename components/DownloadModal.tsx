
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { DownloadIcon, LuminescenceIcon } from './icons';
import RangeSlider from './RangeSlider';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filename: string, format: 'png' | 'jpeg' | 'webp', quality: number) => void;
  isProcessing: boolean;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, onConfirm, isProcessing }) => {
  const { t } = useLanguage();
  const [filename, setFilename] = React.useState('');
  const [format, setFormat] = React.useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = React.useState(90);

  React.useEffect(() => {
    if (isOpen) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        setFilename(`luminescence-edit-${new Date().toISOString().slice(0,10)}-${randomSuffix}`);
        setFormat('png');
        setQuality(90);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(filename, format, quality / 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md glass p-6 rounded-2xl m-4 shadow-2xl border border-white/20 dark:border-white/10 bg-white/90 dark:bg-gray-900/90">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <LuminescenceIcon className="w-7 h-7" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('downloadOptionsTitle')}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
            disabled={isProcessing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">{t('filename')}</label>
                <div className="flex items-center">
                    <input 
                        type="text" 
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        className="flex-grow bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-l-lg p-3 focus:ring-1 focus:ring-theme-accent focus:outline-none transition"
                        placeholder="filename"
                        disabled={isProcessing}
                    />
                    <div className="bg-gray-200 dark:bg-gray-700 text-gray-500 px-3 py-3 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 font-mono text-sm">
                        .{format === 'jpeg' ? 'jpg' : format}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">{t('format')}</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['png', 'jpeg', 'webp'] as const).map(fmt => (
                        <button
                            key={fmt}
                            onClick={() => setFormat(fmt)}
                            disabled={isProcessing}
                            className={`px-4 py-2.5 rounded-lg text-sm font-bold uppercase transition-all ${format === fmt ? 'bg-theme-accent text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                        >
                            {fmt === 'jpeg' ? 'JPG' : fmt}
                        </button>
                    ))}
                </div>
            </div>

            {format !== 'png' && (
                <div className="animate-fade-in">
                    <RangeSlider 
                        label={t('quality')} 
                        value={quality} 
                        min={1} 
                        max={100} 
                        onChange={setQuality} 
                        disabled={isProcessing}
                        labelValue={`${quality}%`}
                    />
                </div>
            )}

            <div className="pt-2">
                <button
                    onClick={handleConfirm}
                    disabled={isProcessing || !filename.trim()}
                    className="w-full bg-theme-gradient text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('processing')}
                        </span>
                    ) : (
                        <>
                            <DownloadIcon className="w-5 h-5" />
                            {t('download')}
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
