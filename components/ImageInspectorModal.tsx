
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
            <div className="absolute top-4 left-4 bg-black/60 backdrop-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
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

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-white">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <Spinner />
                        <p className="text-sm text-white/60 animate-pulse">{t('inspectorAnalyzing')}</p>
                    </div>
                ) : data ? (
                    <>
                        <section className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent block">Overview</label>
                            <div className="space-y-2">
                                <p className="text-sm leading-relaxed text-white/90">
                                    <strong className="text-white/50 block mb-1">Subject:</strong>
                                    {data.subject}
                                </p>
                            </div>
                        </section>

                        {data.detectedObjects && data.detectedObjects.length > 0 && (
                            <section className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent block">Detected Objects</label>
                                <div className="flex flex-wrap gap-2">
                                    {data.detectedObjects.map((obj: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-white/10 rounded-md text-[10px] font-bold border border-white/5 uppercase tracking-wider">{obj}</span>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <section className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent block">Style</label>
                                <p className="text-sm font-medium">{data.style}</p>
                            </section>
                            <section className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent block">Lighting</label>
                                <p className="text-sm font-medium">{data.lighting}</p>
                            </section>
                        </div>

                        <section className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent block">Dominant Palette</label>
                            <div className="flex gap-2">
                                {data.colors?.map((color: string, i: number) => (
                                    <div key={i} className="group relative">
                                        <div 
                                            className="w-8 h-8 rounded-full border border-white/20 shadow-sm cursor-pointer hover:scale-125 transition-transform" 
                                            style={{ backgroundColor: color }}
                                            onClick={() => copyToClipboard(color)}
                                            data-tooltip-id="app-tooltip"
                                            data-tooltip-content={color}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {data.styleSuggestions && data.styleSuggestions.length > 0 && (
                            <section className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent block">Creative Suggestions</label>
                                <div className="space-y-3">
                                    {data.styleSuggestions.map((s: any, i: number) => (
                                        <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                            <h4 className="text-xs font-bold text-theme-accent mb-1">{s.title}</h4>
                                            <p className="text-[10px] leading-tight text-white/60">{s.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent">AI Master Prompt</label>
                                <button onClick={() => copyToClipboard(data.prompt)} className="text-white/50 hover:text-white transition-colors" title={t('copyToClipboard')}>
                                    <CopyIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[11px] text-white/70 italic leading-relaxed select-all">
                                {data.prompt}
                            </p>
                        </section>
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
