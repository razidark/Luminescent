
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { 
    UploadIcon, PaintBrushIcon, FilterIcon, RemoveBgIcon, ExpandIcon, 
    UpscaleIcon, CardIcon, GenerateIcon, VideoIcon, MagicWandIcon, 
    MemeIcon, RetouchIcon, TextIcon, CropIcon, AdjustIcon, 
    ProductIcon, GalleryIcon, AddProductIcon, PaletteIcon, 
    StyleTransferIcon, CaptionIcon, VariationsIcon, ClockIcon, 
    EnhanceIcon, CameraIcon, PencilIcon, FocusIcon, MergeIcon 
} from './icons';
import { type Tab, type Creation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import TiltCard from './TiltCard';
import { getRecentCreations } from '../utils/db';

interface StartScreenProps {
  onFileSelect: (file: File, targetTab: Tab) => void;
  onGenerateClick: () => void;
  onVideoClick: () => void;
  onGalleryClick: () => void;
  onCameraClick: () => void;
}

interface FeatureItem {
    id: Tab;
    icon: React.ReactNode;
    title: string;
    description: string;
}

interface FeatureCategory {
    titleKey: string;
    items: FeatureItem[];
}

const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect, onGenerateClick, onVideoClick, onGalleryClick, onCameraClick }) => {
  const { t } = useLanguage();
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [targetTab, setTargetTab] = React.useState<Tab>('erase');
  const [recentCreations, setRecentCreations] = React.useState<Creation[]>([]);
  
  const words = React.useMemo(() => [t('evolve'), 'Imagine', 'Dream', 'Transform', 'Inspire'], [t]);
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [currentText, setCurrentText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [typingSpeed, setTypingSpeed] = React.useState(150);
  
  React.useEffect(() => {
    const handleType = () => {
      const fullText = words[currentWordIndex];
      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1));
        setTypingSpeed(50);
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1));
        setTypingSpeed(150);
      }
      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    };
    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed]);

  React.useEffect(() => {
      const loadRecents = async () => {
          try {
              const recentItems = await getRecentCreations(5);
              setRecentCreations(recentItems.filter(c => c.type === 'image'));
          } catch (e) { console.error(e); }
      };
      loadRecents();
  }, []);

  const handleTriggerFileUpload = (tab: Tab) => {
    setTargetTab(tab);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) onFileSelect(files[0], targetTab);
    if (e.target) e.target.value = '';
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) onFileSelect(files[0], 'erase');
  }

  const handleRecentClick = (creation: Creation) => {
      if (creation.type === 'image') {
          const file = new File([creation.blob], `recent-${creation.id}.png`, { type: creation.blob.type });
          onFileSelect(file, 'erase');
      }
  };
  
  const iconClassName = "w-8 h-8 text-theme-accent transition-colors duration-300";

  const categories = React.useMemo<FeatureCategory[]>(() => [
    {
        titleKey: "catGenerative",
        items: [
            { id: 'variations', icon: <VariationsIcon className={iconClassName} />, title: t('toolVariations'), description: t('variationsDescription') },
            { id: 'add-product', icon: <AddProductIcon className={iconClassName} />, title: t('toolAddProduct'), description: t('addProductDescription') },
            { id: 'sketch', icon: <PencilIcon className={iconClassName} />, title: t('toolSketch'), description: t('sketchDescription') },
            { id: 'background', icon: <RemoveBgIcon className={iconClassName} />, title: t('toolBackground'), description: t('generativeBackgroundDescription') },
        ]
    },
    {
        titleKey: "catAIEnhancements",
        items: [
            { id: 'erase', icon: <PaintBrushIcon className={iconClassName} />, title: t('toolErase'), description: t('magicEraseDescription') },
            { id: 'retouch', icon: <RetouchIcon className={iconClassName} />, title: t('toolRetouch'), description: t('magicBrushDescription') },
            { id: 'enhance', icon: <EnhanceIcon className={iconClassName} />, title: t('toolEnhance'), description: t('enhanceDescription') },
            { id: 'restore', icon: <MagicWandIcon className={iconClassName} />, title: t('toolRestore'), description: t('restoreDescription') },
            { id: 'upscale', icon: <UpscaleIcon className={iconClassName} />, title: t('toolUpscale'), description: t('aiUpscalerDescription') },
        ]
    },
    {
        titleKey: "catCreative",
        items: [
            { id: 'filters', icon: <FilterIcon className={iconClassName} />, title: t('toolFilters'), description: t('creativeFiltersDescription') },
            { id: 'style-transfer', icon: <StyleTransferIcon className={iconClassName} />, title: t('toolStyleTransfer'), description: t('styleTransferDescription') },
            // FIX: Added explicit cast to any for translation keys to resolve type mismatch in StartScreen
            { id: 'merge', icon: <MergeIcon className={iconClassName} />, title: t('toolMerge'), description: t('mergeDescription' as any) },
            { id: 'focus', icon: <FocusIcon className={iconClassName} />, title: t('toolFocus'), description: t('focusDescription' as any) },
            { id: 'cardify', icon: <CardIcon className={iconClassName} />, title: t('toolCardify'), description: t('cardifyDescription') },
        ]
    },
    {
        titleKey: "catClassic",
        items: [
            { id: 'crop', icon: <CropIcon className={iconClassName} />, title: t('toolCrop'), description: t('cropDescription') },
            { id: 'adjust', icon: <AdjustIcon className={iconClassName} />, title: t('toolAdjust'), description: t('adjustDescription') },
            { id: 'text', icon: <TextIcon className={iconClassName} />, title: t('toolText'), description: t('addTextDescription') },
            { id: 'expand', icon: <ExpandIcon className={iconClassName} />, title: t('toolExpand'), description: t('expandCanvasDescription') },
        ]
    }
  ], [t]);
  
  const renderTitle = () => {
    const titleString = t('createEditEvolve');
    const splitTitle = titleString.split('{evolveWord}');
    return (
        <>
            {splitTitle[0]}
            <span className="inline-block min-w-[140px] text-left text-theme-gradient" style={{ backgroundSize: '200% 200%', animation: 'animated-gradient-text 5s ease infinite' }}>
                {currentText}<span className="cursor-blink inline-block w-0.5 h-8 bg-theme-accent ml-1 align-middle"></span>
            </span>
            {splitTitle[1]}
        </>
    );
  };

  return (
    <div 
      className={`w-full max-w-7xl mx-auto p-4 md:p-8 transition-all duration-300 rounded-3xl relative min-h-screen overflow-y-auto custom-scrollbar ${isDraggingOver ? 'bg-theme-accent/5 ring-4 ring-dashed ring-theme-accent scale-[1.01]' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
         {Array.from({ length: 15 }).map((_, i) => (
             <div 
                key={i}
                className="absolute bg-theme-accent/10 rounded-full blur-2xl animate-float-up"
                style={{
                    left: `${(i * 141) % 100}%`,
                    top: `${(i * 277) % 100}%`, 
                    width: `${(i % 5) * 40 + 60}px`,
                    height: `${(i % 5) * 40 + 60}px`,
                    animationDuration: `${(i % 10) + 20}s`,
                    animationDelay: `-${i * 3}s`,
                }}
             />
         ))}
      </div>
    
      <div className="flex flex-col items-center gap-10 animate-fade-in relative z-10 pb-20">
        <header className="max-w-4xl w-full text-center space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl lg:text-7xl animate-scale-up">
                {renderTitle()}
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 md:text-xl font-medium leading-relaxed" style={{ animationDelay: '200ms' }}>
                {t('nextGenPhotoEditing')}
            </p>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
                <button onClick={onGenerateClick} className="px-8 py-4 text-lg font-bold text-white bg-theme-gradient rounded-2xl shadow-xl shadow-theme-accent/20 hover:shadow-theme-accent/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    <GenerateIcon className="w-6 h-6" /> {t('createAnImage')}
                </button>
                <button onClick={onVideoClick} className="px-8 py-4 text-lg font-bold text-white bg-theme-gradient rounded-2xl shadow-xl shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    <VideoIcon className="w-6 h-6" /> {t('createAVideo')}
                </button>
                <button onClick={() => handleTriggerFileUpload('erase')} className="px-8 py-4 text-lg font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-white/10 rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/20 active:scale-95 transition-all flex items-center gap-3">
                    <UploadIcon className="w-6 h-6" /> {t('editAPhoto')}
                </button>
                <button onClick={onCameraClick} className="p-4 text-gray-800 dark:text-gray-200 bg-white dark:bg-white/10 rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/20 active:scale-95 transition-all" title={t('cameraTitle')}>
                    <CameraIcon className="w-7 h-7" />
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
        </header>

        {recentCreations.length > 0 && (
            <section className="w-full max-w-5xl">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="p-2 bg-theme-accent/10 rounded-lg">
                        <ClockIcon className="w-5 h-5 text-theme-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('recentCreations')}</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {recentCreations.map((creation, idx) => (
                        <TiltCard 
                            key={creation.id}
                            onClick={() => handleRecentClick(creation)}
                            className="aspect-square rounded-2xl overflow-hidden cursor-pointer group border border-gray-200 dark:border-white/10 hover:border-theme-accent transition-all bg-white dark:bg-black/20 p-2 animate-fade-in"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="w-full h-full rounded-xl overflow-hidden relative">
                                <img 
                                    src={URL.createObjectURL(creation.thumbnailBlob)} 
                                    alt="Recent" 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </TiltCard>
                    ))}
                    <button onClick={onGalleryClick} className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/40 dark:hover:bg-white/5 transition-colors text-gray-500 hover:text-theme-accent">
                        <GalleryIcon className="w-8 h-8" />
                        <span className="text-sm font-bold">{t('myCreations')}</span>
                    </button>
                </div>
            </section>
        )}

        <section className="w-full max-w-7xl space-y-12">
            <div className="flex items-center justify-center gap-4">
                <div className="h-px flex-grow bg-gray-300 dark:bg-gray-800"></div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">{t('startWithTool')}</h2>
                <div className="h-px flex-grow bg-gray-300 dark:bg-gray-800"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {categories.map((cat, catIdx) => (
                    <div key={catIdx} className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-theme-accent ml-2 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></div>
                             {t(cat.titleKey as any)}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {cat.items.map((item, itemIdx) => (
                                <TiltCard 
                                    key={item.id}
                                    onClick={() => handleTriggerFileUpload(item.id)}
                                    className="group glass border border-white/20 dark:border-white/5 p-5 rounded-2xl flex flex-col gap-3 cursor-pointer hover:bg-white/60 dark:hover:bg-white/10 transition-all shadow-sm animate-fade-in-slide"
                                    style={{ animationDelay: `${(catIdx * 2 + itemIdx) * 50}ms` }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-gray-100 dark:bg-white/10 rounded-xl transition-all group-hover:bg-theme-accent group-hover:text-white group-hover:scale-110 shadow-inner">
                                            {item.icon}
                                        </div>
                                        <div className="p-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <svg className="w-5 h-5 text-theme-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-theme-accent transition-colors">{item.title}</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{item.description}</p>
                                    </div>
                                </TiltCard>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
};

export default React.memo(StartScreen);
