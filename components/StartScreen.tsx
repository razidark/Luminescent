
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { UploadIcon, PaintBrushIcon, FilterIcon, RemoveBgIcon, ExpandIcon, UpscaleIcon, CardIcon, GenerateIcon, VideoIcon, MagicWandIcon, MemeIcon, RetouchIcon, TextIcon, CropIcon, AdjustIcon, ProductIcon, GalleryIcon, AddProductIcon, PaletteIcon, StyleTransferIcon, CaptionIcon, VariationsIcon, ClockIcon, EnhanceIcon } from './icons';
import { type Tab, type Creation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import TiltCard from './TiltCard';
import { getAllCreations } from '../utils/db';

interface StartScreenProps {
  onFileSelect: (file: File, targetTab: Tab) => void;
  onGenerateClick: () => void;
  onVideoClick: () => void;
  onGalleryClick: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect, onGenerateClick, onVideoClick, onGalleryClick }) => {
  const { t } = useLanguage();
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [targetTab, setTargetTab] = React.useState<Tab>('erase');
  const featuresRef = React.useRef<HTMLDivElement>(null);
  const [recentCreations, setRecentCreations] = React.useState<Creation[]>([]);
  
  // Typewriter State
  const words = [t('evolve'), 'Imagine', 'Dream', 'Transform', 'Inspire'];
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

  // Load recent creations
  React.useEffect(() => {
      const loadRecents = async () => {
          try {
              const allCreations = await getAllCreations();
              // Filter only images for direct editing, take top 4
              const recentImages = allCreations.filter(c => c.type === 'image').slice(0, 4);
              setRecentCreations(recentImages);
          } catch (e) {
              console.error("Failed to load recent creations", e);
          }
      };
      loadRecents();
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const featureCards = featuresRef.current?.querySelectorAll('.feature-card');
    if (featureCards) {
      featureCards.forEach((card) => observer.observe(card));
    }

    return () => {
      if (featureCards) {
        featureCards.forEach((card) => observer.unobserve(card));
      }
    };
  }, []);

  const handleTriggerFileUpload = (tab: Tab) => {
    setTargetTab(tab);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0], targetTab);
    }
    if (e.target) {
        e.target.value = '';
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onFileSelect(files[0], 'erase'); 
    }
  }

  const handleRecentClick = (creation: Creation) => {
      if (creation.type === 'image') {
          const file = new File([creation.blob], `recent-${creation.id}.png`, { type: creation.blob.type });
          onFileSelect(file, 'erase');
      }
  };

  const iconClassName = "w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors duration-300";

  const features: { id: Tab, icon: React.ReactNode, title: string, description: string }[] = [
    { 
      id: 'erase', 
      icon: <PaintBrushIcon className={iconClassName} />, 
      title: t('toolErase'), 
      description: t('magicEraseDescription')
    },
    { 
      id: 'retouch', 
      icon: <RetouchIcon className={iconClassName} />, 
      title: t('toolRetouch'), 
      description: t('magicBrushDescription')
    },
    { 
      id: 'add-product', 
      icon: <AddProductIcon className={iconClassName} />, 
      title: t('toolAddProduct'), 
      description: t('addProductDescription')
    },
    { 
      id: 'background', 
      icon: <RemoveBgIcon className={iconClassName} />, 
      title: t('toolBackground'), 
      description: t('generativeBackgroundDescription')
    },
    { 
      id: 'expand', 
      icon: <ExpandIcon className={iconClassName} />, 
      title: t('toolExpand'), 
      description: t('expandCanvasDescription')
    },
    { 
      id: 'variations', 
      icon: <VariationsIcon className={iconClassName} />, 
      title: t('toolVariations'), 
      description: t('variationsDescription')
    },
    { 
      id: 'crop', 
      icon: <CropIcon className={iconClassName} />, 
      title: t('toolCrop'), 
      description: t('cropDescription')
    },
    {
      id: 'upscale',
      icon: <UpscaleIcon className={iconClassName} />,
      title: t('toolUpscale'),
      description: t('aiUpscalerDescription')
    },
    {
      id: 'enhance',
      icon: <EnhanceIcon className={iconClassName} />,
      title: t('toolEnhance'),
      description: t('enhanceDescription')
    },
    {
      id: 'restore',
      icon: <MagicWandIcon className={iconClassName} />,
      title: t('toolRestore'),
      description: t('restoreDescription')
    },
    {
      id: 'product',
      icon: <ProductIcon className={iconClassName} />,
      title: t('toolProductStudio'),
      description: t('productStudioDescription')
    },
     { 
      id: 'adjust', 
      icon: <AdjustIcon className={iconClassName} />, 
      title: t('toolAdjust'), 
      description: t('adjustDescription')
    },
     { 
      id: 'color', 
      icon: <PaletteIcon className={iconClassName} />, 
      title: t('toolColor'), 
      description: t('colorDescription')
    },
     { 
      id: 'filters', 
      icon: <FilterIcon className={iconClassName} />, 
      title: t('toolFilters'), 
      description: t('creativeFiltersDescription')
    },
     { 
      id: 'style-transfer', 
      icon: <StyleTransferIcon className={iconClassName} />, 
      title: t('toolStyleTransfer'), 
      description: t('styleTransferDescription')
    },
    { 
      id: 'text', 
      icon: <TextIcon className={iconClassName} />, 
      title: t('toolText'), 
      description: t('addTextDescription')
    },
     { 
      id: 'captions', 
      icon: <CaptionIcon className={iconClassName} />, 
      title: t('toolCaptions'), 
      description: t('captionsDescription')
    },
    {
      id: 'memeify',
      icon: <MemeIcon className={iconClassName} />,
      title: t('toolMemeify'),
      description: t('memeifyDescription')
    },
    {
      id: 'cardify',
      icon: <CardIcon className={iconClassName} />,
      title: t('toolCardify'),
      description: t('cardifyDescription')
    }
  ];
  
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
  
  const techStack = [
    { name: 'Gemini 3 Pro', gradient: 'from-blue-500 via-indigo-500 to-purple-500', shadow: 'shadow-indigo-500/40' },
    { name: 'Flash-Lite', gradient: 'from-yellow-400 to-orange-500', shadow: 'shadow-orange-500/40' },
    { name: 'Veo 3.1', gradient: 'from-emerald-400 to-cyan-500', shadow: 'shadow-emerald-500/40' },
    { name: 'Imagen 3', gradient: 'from-pink-400 to-rose-600', shadow: 'shadow-pink-500/40' },
    { name: 'React 19', gradient: 'from-cyan-400 to-blue-600', shadow: 'shadow-cyan-500/40' },
  ];

  return (
    <div 
      className={`w-full max-w-6xl mx-auto text-center p-8 transition-all duration-300 rounded-2xl border-2 relative overflow-hidden ${isDraggingOver ? 'bg-theme-accent/10 border-dashed border-theme-accent' : 'border-transparent'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
    >
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {Array.from({ length: 20 }).map((_, i) => (
             <div 
                key={i}
                className="absolute bg-theme-accent/10 rounded-full blur-md animate-float-up"
                style={{
                    left: `${Math.random() * 100}%`,
                    bottom: '-20px',
                    width: `${Math.random() * 20 + 5}px`,
                    height: `${Math.random() * 20 + 5}px`,
                    animationDuration: `${Math.random() * 10 + 5}s`,
                    animationDelay: `${Math.random() * 5}s`
                }}
             />
         ))}
      </div>
    
      <div className="flex flex-col items-center gap-6 animate-fade-in relative z-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl md:text-7xl h-[1.2em] flex flex-col sm:block items-center">
            {renderTitle()}
        </h1>
        
        {/* Tech Chips */}
        <div className="flex flex-wrap justify-center gap-3 -mt-2 mb-4">
             {techStack.map((tech, i) => (
                 <span 
                    key={i} 
                    className={`px-5 py-1.5 rounded-full text-xs font-extrabold text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:-translate-y-1 border border-white/20 bg-gradient-to-r ${tech.gradient} shadow-lg ${tech.shadow}`}
                 >
                     {tech.name}
                 </span>
             ))}
        </div>

        <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400 md:text-xl">
          {t('nextGenPhotoEditing')}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button 
                onClick={() => onGenerateClick()} 
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('createAnImage')}
                className="relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-theme-gradient animate-gradient-move rounded-full cursor-pointer group transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner"
            >
                <GenerateIcon className="w-6 h-6 mr-3 transition-transform duration-500 ease-in-out group-hover:rotate-12 group-hover:scale-110" />
                {t('createAnImage')}
            </button>
            <button 
                onClick={() => onVideoClick()} 
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('createAVideo')}
                className="relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-theme-gradient animate-gradient-move rounded-full cursor-pointer group transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner"
            >
                <VideoIcon className="w-6 h-6 mr-3 transition-transform duration-500 ease-in-out group-hover:rotate-[-6deg] group-hover:scale-110" />
                {t('createAVideo')}
            </button>
            <button 
                onClick={() => onGalleryClick()} 
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('myCreations')}
                className="relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-theme-gradient animate-gradient-move rounded-full cursor-pointer group transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner"
            >
                <GalleryIcon className="w-6 h-6 mr-3 transition-transform duration-500 ease-in-out group-hover:scale-110" />
                {t('myCreations')}
            </button>
            <button 
                onClick={() => handleTriggerFileUpload('erase')} 
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('editAPhoto')}
                className="relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-white/10 rounded-full cursor-pointer group transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95"
            >
                <UploadIcon className="w-6 h-6 mr-3 transition-transform duration-500 ease-in-out group-hover:translate-y-[-2px]" />
                {t('editAPhoto')}
            </button>

            <input ref={fileInputRef} id="image-upload-start" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500 -mt-2">{t('dragAndDrop')}</p>

        {/* Recent Creations Section */}
        {recentCreations.length > 0 && (
            <div className="w-full mt-8 animate-fade-in">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <ClockIcon className="w-5 h-5 text-theme-accent" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('recentCreations')}</h3>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                    {recentCreations.map((creation) => (
                        <div key={creation.id} data-tooltip-id="app-tooltip" data-tooltip-content={t('recentCreations')}>
                            <TiltCard 
                                onClick={() => handleRecentClick(creation)}
                                className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden cursor-pointer group border-2 border-transparent hover:border-theme-accent/50 transition-all bg-gray-200 dark:bg-white/5"
                            >
                                <img 
                                    src={URL.createObjectURL(creation.thumbnailBlob)} 
                                    alt="Recent" 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                            </TiltCard>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="mt-16 w-full" ref={featuresRef}>
            <div className="relative flex items-center mb-8">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 font-semibold">{t('startWithTool')}</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                    <div key={feature.id} className="feature-card h-full" style={{ transitionDelay: `${index * 50}ms` }}>
                      <div data-tooltip-id="app-tooltip" data-tooltip-content={feature.description} className="h-full">
                          <TiltCard 
                            onClick={() => handleTriggerFileUpload(feature.id)}
                            className="group w-full h-full glass border border-white/20 dark:border-white/5 p-6 rounded-2xl flex flex-col items-center text-center cursor-pointer"
                          >
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-full mb-4 transition-all duration-300 group-hover:bg-theme-gradient group-hover:text-white border border-gray-200 dark:border-white/10">
                              {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors">{feature.title}</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                          </TiltCard>
                      </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StartScreen);
