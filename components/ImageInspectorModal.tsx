
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
        .catch(err => {
            console.error("Analysis failed:", err);
            setData(null);
        })
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
        className="relative w-full max-w-6xl h-[85vh] glass flex flex-col md:flex-row overflow-hidden rounded-3xl m-4 shadow-2xl border border-white/20 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Mobile Only */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
            <h2 className="font-bold text-white flex items-center gap-2">
                <InfoIcon className="w-5 h-5 text-theme-accent" />
                {t('inspectorTitle')}
            </h2>
            <button onClick={onClose} className="text-white opacity-70 hover:opacity-100 text-2xl leading-none">&times;</button>
        </div>

        {/* Image Preview - Centered with background pattern */}
        <div className="flex-1 bg-[#0a0a0a] flex items-center justify-center p-4 md:p-12 relative checkerboard-bg overflow-hidden">
            {imageUrl && (
                <div className="relative group max-w-full max-h-full">
                    <img src={imageUrl} alt="Inspection Target" className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg transition-transform duration-500 group-hover:scale-[1.02]" />
                    <div className="absolute -inset-4 border border-white/10 rounded-xl pointer-events-none group-hover:border-theme-accent/30 transition-colors" />
                </div>
            )}
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 border border-white/10 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-theme-accent animate-pulse" />
                Vision Intelligence
            </div>
        </div>

        {/* Analysis Panel - Scrollable sidebar */}
        <div className="w-full md:w-[400px] flex-shrink-0 bg-white/5 dark:bg-black/60 backdrop-blur-2xl border-l border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/10 hidden md:flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-theme-accent/10 rounded-lg">
                        <LuminescenceIcon className="w-6 h-6 text-theme-accent" />
                    </div>
                    <h2 className="font-black text-xl text-white tracking-tighter uppercase">{t('inspectorTitle')}</h2>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white transition-all hover:rotate-90">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-white">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
                        <Spinner />
                        <div className="text-center space-y-2">
                            <p className="text-lg font-bold text-white animate-pulse">{t('inspectorAnalyzing')}</p>
                            <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Scanning pixels...</p>
                        </div>
                    </div>
                ) : data ? (
                    <div className="space-y-8 animate-fade-in">
                        {/* Section: Overview */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-theme-gradient rounded-full" />
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent block">Overview</label>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                <p className="text-sm leading-relaxed text-white/90">
                                    <span className="text-white/40 font-bold block mb-1 uppercase text-[10px] tracking-wider">Subject</span>
                                    {data.subject}
                                </p>
                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                                    <div>
                                        <span className="text-white/40 font-bold block mb-1 uppercase text-[10px] tracking-wider">Art Style</span>
                                        <p className="text-xs font-semibold">{data.style}</p>
                                    </div>
                                    <div>
                                        <span className="text-white/40 font-bold block mb-1 uppercase text-[10px] tracking-wider">Lighting</span>
                                        <p className="text-xs font-semibold">{data.lighting}</p>
                                    </div>
                                </div>
                                <div className="border-t border-white/5 pt-4">
                                    <span className="text-white/40 font-bold block mb-1 uppercase text-[10px] tracking-wider">Composition</span>
                                    <p className="text-xs italic leading-relaxed text-white/70">{data.composition}</p>
                                </div>
                            </div>
                        </section>

                        {/* Section: Dominant Palette */}
                        <section className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent block">Dominant Palette</label>
                            <div className="flex items-center gap-3">
                                {data.colors?.map((color: string, i: number) => (
                                    <button 
                                        key={i} 
                                        className="group relative flex-1 aspect-[1/2] rounded-full border border-white/20 shadow-xl overflow-hidden transition-all hover:scale-110 active:scale-95" 
                                        style={{ backgroundColor: color }}
                                        onClick={() => copyToClipboard(color)}
                                        data-tooltip-id="app-tooltip"
                                        data-tooltip-content={color}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                                            <CopyIcon className="w-3 h-3 text-white" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Section: Objects */}
                        {data.detectedObjects && data.detectedObjects.length > 0 && (
                            <section className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent block">Entities Detected</label>
                                <div className="flex flex-wrap gap-2">
                                    {data.detectedObjects.map((obj: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-theme-accent/10 rounded-xl text-[10px] font-black border border-theme-accent/20 uppercase tracking-widest text-theme-accent">{obj}</span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section: Suggestions */}
                        {data.styleSuggestions && data.styleSuggestions.length > 0 && (
                            <section className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent block">Artistic Directions</label>
                                <div className="space-y-3">
                                    {data.styleSuggestions.map((s: any, i: number) => (
                                        <div key={i} className="group p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-theme-accent/10 hover:border-theme-accent/30 transition-all cursor-pointer">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-sm font-black text-white group-hover:text-theme-accent transition-colors">{s.title}</h4>
                                                <SparkleIcon className="w-4 h-4 text-theme-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <p className="text-[11px] leading-relaxed text-white/50 group-hover:text-white/80 transition-colors">{s.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section: AI Prompt */}
                        <section className="space-y-3 pb-8">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent">AI Master Prompt</label>
                                <button onClick={() => copyToClipboard(data.prompt)} className="p-2 bg-white/5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all" title={t('copyToClipboard')}>
                                    <CopyIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-theme-gradient rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
                                <p className="relative p-5 bg-[#0a0a0a] rounded-2xl text-[11px] text-white/70 italic leading-relaxed border border-white/10 select-all font-mono">
                                    {data.prompt}
                                </p>
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-4">
                        <div className="p-4 bg-red-500/10 rounded-full">
                            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <p className="text-white/50 font-bold uppercase tracking-widest text-xs">Analysis Engine Failed</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageInspectorModal;
