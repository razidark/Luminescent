/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { type Tab } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PaintBrushIcon, CropIcon, ExpandIcon, AdjustIcon, FilterIcon, UpscaleIcon, RemoveBgIcon, CardIcon, TextIcon, MagicWandIcon, MemeIcon, ProductIcon, RetouchIcon, AddProductIcon, PaletteIcon, StyleTransferIcon, CaptionIcon, VariationsIcon, ChatIcon, GifIcon, EnhanceIcon, PencilIcon, FocusIcon, MergeIcon } from './icons';

interface ToolbarProps {
  activeTab: Tab | null;
  setActiveTab: (tab: Tab) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const tabs: {id: Tab, name: string, icon: React.ReactNode}[] = [
    {id: 'chat', name: 'Assistant', icon: <ChatIcon />},
    {id: 'enhance', name: t('toolEnhance'), icon: <EnhanceIcon />},
    {id: 'focus', name: t('toolFocus'), icon: <FocusIcon />},
    {id: 'erase', name: t('toolErase'), icon: <PaintBrushIcon />},
    {id: 'sketch', name: t('toolSketch'), icon: <PencilIcon />},
    {id: 'retouch', name: t('toolRetouch'), icon: <RetouchIcon />},
    {id: 'merge', name: t('toolMerge'), icon: <MergeIcon />},
    {id: 'restore', name: t('toolRestore'), icon: <MagicWandIcon />},
    {id: 'background', name: t('toolBackground'), icon: <RemoveBgIcon />},
    {id: 'product', name: t('toolProductStudio'), icon: <ProductIcon />},
    {id: 'add-product', name: t('toolAddProduct'), icon: <AddProductIcon />},
    {id: 'expand', name: t('toolExpand'), icon: <ExpandIcon />},
    {id: 'variations', name: t('toolVariations'), icon: <VariationsIcon />},
    {id: 'crop', name: t('toolCrop'), icon: <CropIcon />},
    {id: 'adjust', name: t('toolAdjust'), icon: <AdjustIcon />},
    {id: 'color', name: t('toolColor'), icon: <PaletteIcon />},
    {id: 'filters', name: t('toolFilters'), icon: <FilterIcon />},
    {id: 'style-transfer', name: t('toolStyleTransfer'), icon: <StyleTransferIcon />},
    {id: 'upscale', name: t('toolUpscale'), icon: <UpscaleIcon />},
    {id: 'text', name: t('toolText'), icon: <TextIcon />},
    {id: 'captions', name: t('toolCaptions'), icon: <CaptionIcon />},
    {id: 'memeify', name: t('toolMemeify'), icon: <MemeIcon />},
    {id: 'cardify', name: t('toolCardify'), icon: <CardIcon />},
    {id: 'gif', name: 'GIF Maker', icon: <GifIcon />},
  ];
  
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
        scrollRef.current.scrollLeft += e.deltaY * 1.5;
    }
  };

  return (
    <nav className="w-full relative z-20 px-4">
        <div 
            ref={scrollRef}
            onWheel={handleWheel}
            className="glass rounded-2xl p-2 flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth shadow-2xl border border-white/30 dark:border-white/10 backdrop-blur-xl relative"
            style={{
                // Enhanced gradient mask for better scroll indication on both sides
                maskImage: 'linear-gradient(to right, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)'
            }}
        >
            {/* Added spacer to ensure first/last items aren't cut off by mask */}
            <div className="w-4 flex-shrink-0" />
            
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    data-tooltip-id="app-tooltip"
                    data-tooltip-content={tab.name}
                    className={`flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl transition-all duration-300 ease-in-out group min-w-[90px] relative overflow-hidden ${
                        activeTab === tab.id 
                        ? 'bg-white dark:bg-white/10 shadow-lg scale-105 border border-white/50 dark:border-white/20' 
                        : 'hover:bg-white/40 dark:hover:bg-white/5 hover:scale-100 opacity-80 hover:opacity-100'
                    }`}
                >
                    {/* Active Indicator Glow */}
                    {activeTab === tab.id && (
                         <div className="absolute inset-0 bg-gradient-to-br from-theme-accent/10 to-transparent pointer-events-none" />
                    )}
                    
                    <div className={`w-12 h-12 transition-all duration-300 ${
                        activeTab === tab.id 
                        ? 'text-theme-accent scale-110 drop-shadow-md filter' 
                        : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                    }`}>
                        {React.isValidElement(tab.icon) 
                            ? React.cloneElement(tab.icon as React.ReactElement<any>, { className: 'w-full h-full' }) 
                            : tab.icon}
                    </div>
                    <span className={`text-[11px] font-bold tracking-wide uppercase leading-none transition-colors ${
                        activeTab === tab.id 
                        ? 'text-theme-gradient animate-gradient-move' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
                    }`}>
                        {tab.name}
                    </span>
                    
                    {/* Bottom highlight line for active tab */}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-theme-gradient rounded-t-full shadow-[0_0_10px_rgba(var(--theme-accent),0.5)]" />
                    )}
                </button>
            ))}
            
            {/* Added spacer to ensure first/last items aren't cut off by mask */}
            <div className="w-4 flex-shrink-0" />
        </div>
    </nav>
  );
};

export default Toolbar;