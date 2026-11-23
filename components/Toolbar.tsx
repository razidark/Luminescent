/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { type Tab } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  PaintBrushIcon, CropIcon, ExpandIcon, AdjustIcon, FilterIcon, UpscaleIcon, 
  RemoveBgIcon, CardIcon, TextIcon, MagicWandIcon, ProductIcon, RetouchIcon, 
  AddProductIcon, PaletteIcon, StyleTransferIcon, CaptionIcon, VariationsIcon, 
  ChatIcon, GifIcon, EnhanceIcon, PencilIcon, FocusIcon 
} from './icons';

interface ToolbarProps {
  activeTab: Tab | null;
  setActiveTab: (tab: Tab) => void;
}

type ToolCategory = 'create' | 'ai-edit' | 'adjust' | 'style';

interface ToolItem {
  id: Tab;
  name: string;
  icon: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  // 1. Grouped Tool Definitions
  const categories: Record<ToolCategory, { name: string; items: ToolItem[] }> = {
    create: {
      name: t('toolCreate', 'Create'),
      items: [
        { id: 'generate', name: t('createAnImage', 'Generate Image'), icon: <MagicWandIcon /> },
        { id: 'video', name: t('createAVideo', 'Generate Video'), icon: <GifIcon /> },
        { id: 'gif', name: 'GIF Maker', icon: <CardIcon /> }
      ]
    },
    'ai-edit': {
      name: 'AI Edit',
      items: [
        { id: 'erase', name: t('toolErase', 'Magic Erase'), icon: <PaintBrushIcon /> },
        { id: 'retouch', name: t('toolRetouch', 'AI Retouch'), icon: <RetouchIcon /> },
        { id: 'background', name: t('toolBackground', 'Remove BG'), icon: <RemoveBgIcon /> },
        { id: 'add-product', name: t('toolAddProduct', 'Add Object'), icon: <AddProductIcon /> },
        { id: 'product', name: t('toolProductStudio', 'Product Studio'), icon: <ProductIcon /> },
        { id: 'expand', name: t('toolExpand', 'Canvas Expand'), icon: <ExpandIcon /> },
        { id: 'variations', name: t('toolVariations', 'Variations'), icon: <VariationsIcon /> }
      ]
    },
    adjust: {
      name: t('toolAdjust', 'Adjust'),
      items: [
        { id: 'enhance', name: t('toolEnhance', 'Auto Enhance'), icon: <EnhanceIcon /> },
        { id: 'focus', name: t('toolFocus', 'Smart Focus'), icon: <FocusIcon /> },
        { id: 'crop', name: t('toolCrop', 'Crop & Rotate'), icon: <CropIcon /> },
        { id: 'color', name: t('toolColor', 'Color Balance'), icon: <PaletteIcon /> },
        { id: 'adjust', name: t('toolAdjustManual', 'Manual Adjust'), icon: <AdjustIcon /> },
        { id: 'upscale', name: t('toolUpscale', 'AI Upscale'), icon: <UpscaleIcon /> },
        { id: 'restore', name: t('toolRestore', 'Restore Photo'), icon: <MagicWandIcon /> }
      ]
    },
    style: {
      name: t('toolStyle', 'Style & Text'),
      items: [
        { id: 'filters', name: t('toolFilters', 'Creative Filters'), icon: <FilterIcon /> },
        { id: 'style-transfer', name: t('toolStyleTransfer', 'Style Transfer'), icon: <StyleTransferIcon /> },
        { id: 'text', name: t('toolText', 'Text Overlay'), icon: <TextIcon /> },
        { id: 'captions', name: t('toolCaptions', 'Captions'), icon: <CaptionIcon /> },
        { id: 'cardify', name: t('toolCardify', 'Cardify'), icon: <CardIcon /> }
      ]
    }
  };

  // Find the category of the active tab to expand it automatically
  const getCategoryOfTab = (tab: Tab | null): ToolCategory => {
    if (!tab) return 'ai-edit';
    for (const [catKey, catVal] of Object.entries(categories)) {
      if (catVal.items.some(item => item.id === tab)) {
        return catKey as ToolCategory;
      }
    }
    return 'ai-edit';
  };

  const [activeCategory, setActiveCategory] = React.useState<ToolCategory>(() => getCategoryOfTab(activeTab));

  // Sync category if activeTab changes externally
  React.useEffect(() => {
    if (activeTab) {
      setActiveCategory(getCategoryOfTab(activeTab));
    }
  }, [activeTab]);

  return (
    <nav className="w-full relative z-20 px-4 flex flex-col gap-2">
      {/* Category Pills Selector */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 rounded-2xl w-fit mx-auto backdrop-blur-md shadow-sm">
        {(Object.keys(categories) as ToolCategory[]).map((catKey) => {
          const isSelected = activeCategory === catKey;
          return (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                isSelected
                  ? 'bg-theme-gradient text-white shadow-md shadow-theme-accent/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-white/5'
              }`}
            >
              {categories[catKey].name}
            </button>
          );
        })}
      </div>

      {/* Sub-tools list */}
      <div 
        className="glass rounded-2xl p-1.5 flex items-center justify-center gap-1.5 shadow-2xl border border-white/30 dark:border-white/10 backdrop-blur-xl max-w-full overflow-x-auto no-scrollbar"
      >
        {categories[activeCategory].items.map((tab) => {
          const isTabActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 ease-in-out group min-w-[80px] relative overflow-hidden active:scale-95 ${
                isTabActive
                  ? 'bg-white dark:bg-white/10 shadow-lg shadow-theme-accent/10 scale-[1.03]'
                  : 'hover:bg-white/50 dark:hover:bg-white/5 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Active Indicator Glow */}
              {isTabActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-theme-accent/10 to-transparent pointer-events-none" />
              )}

              <div className={`w-5 h-5 transition-all duration-300 ${
                isTabActive
                  ? 'text-theme-accent scale-110'
                  : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
              }`}>
                {tab.icon}
              </div>
              <span className={`text-[9px] font-bold tracking-wide uppercase leading-none transition-colors ${
                isTabActive
                  ? 'text-theme-accent'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
              }`}>
                {tab.name}
              </span>

              {/* Bottom highlight line for active tab */}
              {isTabActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-theme-gradient rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Toolbar;
