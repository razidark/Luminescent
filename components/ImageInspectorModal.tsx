
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { inspectImage } from '../services/geminiService';
import { SparkleIcon, InfoIcon, CopyIcon, LuminescenceIcon } from './icons';
import Spinner from './Spinner';

interface ImageInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: File | null;
}

const ImageInspectorModal: React.FC<ImageInspectorModalProps> = ({ isOpen, onClose, image }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && image) {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      setLoading(true);
      
      inspectImage(image)
        .then(result => setData(result))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));

      return () => URL.revokeObjectURL(url);
    } else {
      setData(null);
      setImageUrl(null);
    }
  }, [isOpen, image]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t('copied'));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl h-[85vh] glass flex flex-col md:flex-row overflow-hidden rounded-3xl m-4 shadow-2xl border border-white/20 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Mobile Only */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="font-bold text-white flex items-center gap-2">
                <InfoIcon className="w-5 h-5 text-theme-accent" />
                {t('inspectorTitle')}
            </h2>
            <button onClick={onClose} className="text-white opacity-70 hover:opacity-100">&times;</button>
        </div>

        {/* Image Preview */}
        <div className="flex-1 bg-black/50 flex items-center justify-center p-8 relative checkerboard-bg">
            {imageUrl && (
                <img src={imageUrl} alt="Inspection Target" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
            )}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <SparkleIcon className="w-3 h-3 text-theme-accent" />
                AI Analyzed
            </div>
        </div>

        {/* Analysis Panel */}
        <div className="w-full md:w-96 flex-shrink-0 bg-white/10 dark:bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/10 hidden md:flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LuminescenceIcon className="w-6 h-6" />
                    <h2 className="font-bold text-lg text-white tracking-tight">{t('inspectorTitle')}</h2>
                </div>
                <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-white">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <Spinner />
                        <p className="text-sm text-white/60 animate-pulse">{t('inspectorAnalyzing')}</p>
                    </div>
                ) : data ? (
                    <>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-white/50">{t('inspectorSubject')}</label>
                            <p className="text-sm leading-relaxed text-white/90">{data.subject}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/50">{t('inspectorStyle')}</label>
                                <p className="text-sm font-medium">{data.style}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/50">{t('inspectorLighting')}</label>
                                <p className="text-sm font-medium">{data.lighting}</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-white/50">{t('inspectorComposition')}</label>
                            <p className="text-sm text-white/80">{data.composition}</p>
                        </div>

                        {data.colors && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/50">{t('inspectorPalette')}</label>
                                <div className="flex gap-2">
                                    {data.colors.map((color: string, i: number) => (
                                        <div key={i} className="group relative">
                                            <div 
                                                className="w-8 h-8 rounded-full border border-white/20 shadow-sm cursor-pointer hover:scale-110 transition-transform" 
                                                style={{ backgroundColor: color }}
                                                onClick={() => copyToClipboard(color)}
                                            />
                                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] bg-black/80 px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">{color}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase tracking-wider text-theme-accent">{t('inspectorPrompt')}</label>
                                <button onClick={() => copyToClipboard(data.prompt)} className="text-white/50 hover:text-white transition-colors" title={t('copyToClipboard')}>
                                    <CopyIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-white/70 italic leading-relaxed select-all">
                                {data.prompt}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-white/50 mt-10">
                        Failed to analyze image.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageInspectorModal;
