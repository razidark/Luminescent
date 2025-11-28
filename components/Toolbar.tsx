
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { type Tab } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PaintBrushIcon, CropIcon, ExpandIcon, AdjustIcon, FilterIcon, UpscaleIcon, RemoveBgIcon, CardIcon, TextIcon, MagicWandIcon, MemeIcon, ProductIcon, RetouchIcon, AddProductIcon, PaletteIcon, StyleTransferIcon, CaptionIcon, VariationsIcon, ChatIcon, GifIcon, EnhanceIcon, PencilIcon, FocusIcon } from './icons';

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
        // Boost scroll speed slightly for better horizontal navigation
        scrollRef.current.scrollLeft += e.deltaY * 1.5;
    }
  };

  return (
    <nav className="w-full relative z-20 px-4">
        <div 
            ref={scrollRef}
            onWheel={handleWheel}
            className="glass rounded-2xl p-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth shadow-2xl border border-white/30 dark:border-white/10 backdrop-blur-xl"
            style={{
                maskImage: 'linear-gradient(to right, transparent, black 20px, black 95%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 20px, black 95%, transparent)'
            }}
        >
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    data-tooltip-id="app-tooltip"
                    data-tooltip-content={tab.name}
                    className={`flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl transition-all duration-300 ease-in-out group min-w-[85px] relative overflow-hidden ${
                        activeTab === tab.id 
                        ? 'bg-white dark:bg-white/10 shadow-lg scale-105' 
                        : 'hover:bg-white/40 dark:hover:bg-white/5 hover:scale-100 opacity-80 hover:opacity-100'
                    }`}
                >
                    {/* Active Indicator Glow */}
                    {activeTab === tab.id && (
                         <div className="absolute inset-0 bg-gradient-to-br from-theme-accent/10 to-transparent pointer-events-none" />
                    )}
                    
                    <div className={`w-6 h-6 transition-all duration-300 ${
                        activeTab === tab.id 
                        ? 'text-theme-accent scale-110 drop-shadow-md filter' 
                        : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                    }`}>
                        {tab.icon}
                    </div>
                    <span className={`text-[10px] font-bold tracking-wide uppercase leading-none transition-colors ${
                        activeTab === tab.id 
                        ? 'text-theme-accent' 
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
        </div>
    </nav>
  );
};

export default Toolbar;
