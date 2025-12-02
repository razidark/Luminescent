
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SparkleIcon, SynthwaveIcon, AnimeIcon, LomoIcon, GlitchIcon, CyberpunkIcon, FilmNoirIcon, WatercolorIcon, VintageIcon, PopArtIcon, SteampunkIcon, ClaymationIcon, BlueprintIcon, ComicBookIcon, InfraredIcon, GouacheIcon, DoubleExposureIcon, LongExposureIcon, TiltShiftIcon, SolarizedIcon, PixelArtIcon, ArtDecoIcon, ArtNouveauIcon, RevolutionaryPropagandaIcon, CorporateIcon, PunkRockCollageIcon, MinimalistFreedomIcon, RoyalRegaliaIcon, MatrixIcon, BladeRunnerIcon, WesAndersonIcon, MadMaxIcon, AmelieIcon, GoldenHourIcon, MonochromeIcon, SketchIcon, OrigamiIcon, UkiyoeIcon, VanGoghIcon, GhibliIcon, DuneIcon, ArcaneIcon, SpiderVerseIcon, BokehIcon, LightLeakIcon, Anaglyph3DIcon, SearchIcon, HDRIcon, StudioLightIcon, ClarifyIcon, VibranceIcon, SoftGlowIcon, NeonIcon, PastelIcon, CharcoalIcon, OilPaintIcon, MosaicIcon, PsychedelicIcon } from './icons';

interface FilterPanelProps {
  onApplyFilter: (prompt: string, name: string) => void;
  onApplyLuckyFilter: () => void;
  isLoading: boolean;
}

interface FilterPreset {
    name: string;
    prompt: string;
    icon: React.ReactNode;
}

interface FilterCategory {
    id: string;
    titleKey: keyof typeof import('../i18n/locales/en').default;
    presets: FilterPreset[];
}

type Strength = 'Subtle' | 'Normal' | 'Strong';

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilter, onApplyLuckyFilter, isLoading }) => {
  const { t } = useLanguage();
  const [selectedPreset, setSelectedPreset] = React.useState<FilterPreset | null>(null);
  const [customPrompt, setCustomPrompt] = React.useState('');
  const [isLuckyLoading, setIsLuckyLoading] = React.useState(false);
  const [strength, setStrength] = React.useState<Strength>('Normal');
  const [activeCategoryId, setActiveCategoryId] = React.useState<string>('enhancement');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filterCategories: FilterCategory[] = [
    {
        id: 'enhancement',
        titleKey: 'filterCategoryEnhancement',
        presets: [
            { name: 'HDR', prompt: 'Apply a High Dynamic Range (HDR) effect. enhance details in both shadows and highlights, increase micro-contrast, and make the image look sharp and hyper-realistic.', icon: <HDRIcon /> },
            { name: 'Studio Light', prompt: 'Simulate professional studio lighting. Add flattering, soft key lighting to the main subject, balance the exposure, and create a clean, high-end photography look.', icon: <StudioLightIcon /> },
            { name: 'Clarify', prompt: 'Enhance the clarity and structure of the image. Remove haze, sharpen fine details, and boost local contrast to make the image pop.', icon: <ClarifyIcon /> },
            { name: 'Vibrance', prompt: 'Boost the vibrance and color saturation of the image smartly. Make colors richer and more lively without oversaturating skin tones.', icon: <VibranceIcon /> },
            { name: 'Soft Glow', prompt: 'Apply a soft, dreamy glamour glow effect. Soften the lighting and add a slight bloom to highlights for a romantic or nostalgic feel.', icon: <SoftGlowIcon /> },
        ]
    },
    {
        id: 'cinematic',
        titleKey: 'filterCategoryCinematic',
        presets: [
            { name: 'Film Noir', prompt: 'Apply a dramatic film noir style. The image should be in high-contrast black and white, with deep shadows and a moody, mysterious atmosphere.', icon: <FilmNoirIcon /> },
            { name: 'Blade Runner', prompt: "Transform the image with a Blade Runner-inspired neo-noir aesthetic. The scene should have very high contrast with deep shadows and vibrant, glowing neon highlights, particularly in cyan and magenta. Add a sense of a light, misty rain or atmospheric haze.", icon: <BladeRunnerIcon /> },
            { name: 'Wes Anderson', prompt: "Apply a distinct Wes Anderson aesthetic to the image. The style should be characterized by a heavily desaturated, pastel color palette, focusing on muted yellows, pinks, and teals. The lighting should be flat and even, giving the image a whimsical and meticulously staged, film-like quality.", icon: <WesAndersonIcon /> },
            { name: 'Mad Max', prompt: "Give the image a post-apocalyptic Mad Max: Fury Road aesthetic. The image should be heavily desaturated but with intense, warm orange and teal color grading. Increase the contrast and clarity to create a gritty, high-detail, sun-scorched desert look.", icon: <MadMaxIcon /> },
            { name: 'Amélie', prompt: "Apply a whimsical Amélie-inspired aesthetic. The image should be color-graded with a warm, romantic palette, heavily emphasizing saturated reds and greens and golden tones. The overall mood should be charming, dreamy, and slightly surreal.", icon: <AmelieIcon /> },
            { name: 'Dune', prompt: "Apply the aesthetic of the Dune films. The image should have a desaturated, almost monochromatic color palette with sandy, amber, and grey tones. Give it a sense of grand, epic scale with a hazy, atmospheric quality and harsh, cinematic lighting.", icon: <DuneIcon /> },
            { name: 'Golden Hour', prompt: "Bathe the image in the dramatic, warm light of a golden hour sunset, with deep, long shadows and an intensely magical, atmospheric glow.", icon: <GoldenHourIcon /> },
            { name: 'Monochrome', prompt: 'Convert the image to a high-contrast, dramatic monochrome (black and white) style.', icon: <MonochromeIcon /> },
        ]
    },
    {
        id: 'artistic',
        titleKey: 'filterCategoryArtistic',
        presets: [
            { name: 'Van Gogh', prompt: 'Transform the image into a painting in the style of Vincent Van Gogh, with thick, swirling impasto brushstrokes, a vibrant and emotional color palette, and a sense of dynamic movement.', icon: <VanGoghIcon /> },
            { name: 'Ghibli', prompt: 'Redraw the image in the beautiful, nostalgic style of a Studio Ghibli anime film. The scene should have lush, painterly backgrounds, soft and warm lighting, and a charming, whimsical feel.', icon: <GhibliIcon /> },
            { name: 'Oil Painting', prompt: 'Transform the image into a classic oil painting. Use visible, textured brushstrokes, rich blended colors, and a canvas texture effect.', icon: <OilPaintIcon /> },
            { name: 'Charcoal', prompt: 'Convert the image into a charcoal drawing. Use deep blacks and smudged greys on textured paper, emphasizing contrast and shading.', icon: <CharcoalIcon /> },
            { name: 'Mosaic', prompt: 'Reconstruct the image as a detailed tile mosaic art. The image should look like it is made of small, colored ceramic tiles with grout lines.', icon: <MosaicIcon /> },
            { name: 'Arcane', prompt: 'Transform the image into the unique, painterly 2D/3D animation style of the series Arcane. The style should feature a gritty, textured look with dramatic, high-contrast lighting, sharp linework, and a blend of Art Nouveau and punk aesthetics.', icon: <ArcaneIcon /> },
            { name: 'Spider-Verse', prompt: "Recreate the image in the dynamic, comic-book-inspired style of 'Spider-Man: Into the Spider-Verse'. The style should include visible halftone dots, chromatic aberration, Kirby Krackle energy effects, and bold, offset linework to simulate a living comic book panel.", icon: <SpiderVerseIcon /> },
            { name: 'Watercolor', prompt: 'Transform the image into a vibrant watercolor painting with visible brush strokes and bleeding colors.', icon: <WatercolorIcon /> },
            { name: 'Claymation', prompt: 'Transform the image into a claymation style. The subjects should look like they are made of modeling clay, with visible fingerprints and a stop-motion aesthetic.', icon: <ClaymationIcon /> },
            { name: 'Sketch', prompt: 'Transform the image into a detailed pencil sketch on textured paper, with visible hatching and cross-hatching for shading.', icon: <SketchIcon /> },
            { name: 'Gouache', prompt: 'Give the image the appearance of a gouache painting, with opaque, matte colors and visible brush strokes.', icon: <GouacheIcon /> },
            { name: 'Pop Art', prompt: 'Recreate the image in a bold, vibrant Pop Art style inspired by Andy Warhol, using blocks of saturated color and strong outlines.', icon: <PopArtIcon /> },
            { name: 'Comic Book', prompt: 'Convert the image into a classic comic book panel, with halftone dot shading, bold black ink outlines, and vibrant, flat colors.', icon: <ComicBookIcon /> },
            { name: 'Ukiyo-e', prompt: 'Redraw the image in the style of a traditional Japanese Ukiyo-e woodblock print, with flat areas of color, bold outlines, and a focus on flowing lines.', icon: <UkiyoeIcon /> },
            { name: 'Anime', prompt: 'Give the image a vibrant Japanese anime style, with bold outlines, cel-shading, and saturated colors.', icon: <AnimeIcon /> },
        ]
    },
    {
        id: 'retro',
        titleKey: 'filterCategoryRetro',
        presets: [
            { name: 'Synthwave', prompt: 'Apply a vibrant 80s synthwave aesthetic with neon magenta and cyan glows, and subtle scan lines.', icon: <SynthwaveIcon /> },
            { name: 'Lomo', prompt: 'Apply a Lomography-style cross-processing film effect with high-contrast, oversaturated colors, and dark vignetting.', icon: <LomoIcon /> },
            { name: 'Vintage', prompt: 'Give the image an authentic vintage photo effect from the early 1900s, with sepia tones, faded colors, and a subtle grain texture.', icon: <VintageIcon /> },
            { name: 'Infrared', prompt: 'Simulate a surreal infrared photo effect, shifting foliage to white and skies to a deep, dark color, creating a dreamlike landscape.', icon: <InfraredIcon /> },
            { name: 'Solarized', prompt: 'Apply a solarization effect, reversing the tones of the image for a surreal, high-contrast look.', icon: <SolarizedIcon /> },
            { name: 'Pixel Art', prompt: 'Convert the image into a retro pixel art style, with a limited color palette and visible blocky pixels.', icon: <PixelArtIcon /> },
            { name: 'Matrix', prompt: "Apply a Matrix-style aesthetic. The image should have a strong green color cast, with subtle, faint vertical lines of digital code or 'digital rain' overlaying the scene. Increase contrast and give it a dark, cyberpunk feel.", icon: <MatrixIcon /> },
        ]
    },
    {
        id: 'stylized',
        titleKey: 'filterCategoryStylized',
        presets: [
            { name: 'Neon Noir', prompt: 'Apply a stylish Neon Noir aesthetic. High contrast, deep blacks, and selective splashes of vibrant neon colors (pinks, blues, purples) illuminating the scene.', icon: <NeonIcon /> },
            { name: 'Psychedelic', prompt: 'Transform the image with a psychedelic art style. Use swirling, vivid colors, distorted patterns, and a dreamlike, hallucinogenic quality.', icon: <PsychedelicIcon /> },
            { name: 'Pastel Dream', prompt: 'Apply a soft, dreamy pastel aesthetic. Use a palette of light pinks, baby blues, mint greens, and lavenders. Reduce contrast slightly for a gentle, ethereal look.', icon: <PastelIcon /> },
            { name: 'Art Deco', prompt: 'Transform the image with a luxurious Art Deco style, featuring bold geometric patterns, sharp lines, and a glamorous, metallic color palette.', icon: <ArtDecoIcon /> },
            { name: 'Art Nouveau', prompt: 'Apply an elegant Art Nouveau style to the image, characterized by flowing, organic lines, intricate floral patterns, and a soft, natural color palette.', icon: <ArtNouveauIcon /> },
            { name: 'Glitch', prompt: 'Transform the image into a futuristic holographic projection with digital glitch effects and chromatic aberration.', icon: <GlitchIcon /> },
            { name: 'Cyberpunk', prompt: "Transform the image with a cyberpunk aesthetic. The scene should be set on a dark, rainy city street with glowing neon signs reflecting on wet surfaces, bathing everything in vibrant, moody light. Infuse the image with high-tech, futuristic elements. The overall mood should be gritty and cool.", icon: <CyberpunkIcon /> },
            { name: 'Steampunk', prompt: 'Reimagine the image with a steampunk aesthetic. Add intricate gears, brass and copper details, and a warm, Victorian-era industrial feel.', icon: <SteampunkIcon /> },
            { name: 'Blueprint', prompt: 'Redraw the image as a technical blueprint on blue paper, with white lines and annotations.', icon: <BlueprintIcon /> },
            { name: 'Double Exposure', prompt: 'Create a double exposure effect, blending the main subject with a second image of a misty forest landscape.', icon: <DoubleExposureIcon /> },
            { name: 'Long Exposure', prompt: 'Simulate a dramatic long exposure photograph, blurring moving elements like water or clouds into smooth, ethereal textures.', icon: <LongExposureIcon /> },
            { name: 'Tilt-Shift', prompt: 'Apply a dramatic tilt-shift effect, creating a shallow depth of field that makes the scene look like a miniature model.', icon: <TiltShiftIcon /> },
            { name: 'Bokeh', prompt: 'Apply a strong bokeh effect to the background, turning out-of-focus highlights into soft, pleasing circles of light, while keeping the main subject sharp. This should create a shallow depth of field effect.', icon: <BokehIcon /> },
            { name: 'Light Leak', prompt: 'Add vintage-style light leaks to the image, with warm, hazy streaks of orange, red, and yellow light bleeding in from the edges, creating a nostalgic, analog film look.', icon: <LightLeakIcon /> },
            { name: 'Anaglyph 3D', prompt: 'Create a stereoscopic anaglyph 3D effect. The image should have its red and cyan color channels offset from each other to create a sense of depth, best viewed with 3D glasses.', icon: <Anaglyph3DIcon /> },
            { name: 'Propaganda', prompt: 'Reimagine the image in a bold revolutionary propaganda art style, inspired by early 20th-century constructivism. Use a limited color palette of bold reds, blacks, and beige. Emphasize strong geometric shapes, dynamic diagonal lines, and a stark, high-contrast look.', icon: <RevolutionaryPropagandaIcon /> },
            { name: 'Corporate', prompt: 'Transform the image into a sleek, corporate pop art style. Use a vibrant, clean color palette, bold outlines, and halftone dots, reminiscent of commercial advertising from the 1960s, celebrating consumer culture.', icon: <CorporateIcon /> },
            { name: 'Punk Collage', prompt: 'Give the image a gritty, DIY punk rock zine aesthetic. The result should look like a photocopied, cut-and-paste collage with high contrast, rough textures, and a chaotic, anti-establishment energy.', icon: <PunkRockCollageIcon /> },
            { name: 'Minimalism', prompt: 'Apply an ultra-minimalist aesthetic to the image, emphasizing clean lines, negative space, and a restricted, muted color palette. The style should convey a sense of simplicity, clarity, and individual focus.', icon: <MinimalistFreedomIcon /> },
            { name: 'Regal', prompt: 'Redraw the image with a luxurious, royal aesthetic. Incorporate ornate gold filigree, rich textures like velvet and silk, and a deep color palette of royal purples, crimson reds, and gold to give it a regal and opulent feel.', icon: <RoyalRegaliaIcon /> },
            { name: 'Origami', prompt: 'Reconstruct the scene in a 3D origami style, with all objects and subjects appearing to be folded from colorful paper.', icon: <OrigamiIcon /> },
        ]
    }
  ];
  
  const activePrompt = selectedPreset?.prompt || customPrompt;
  const activeName = selectedPreset?.name || customPrompt;
  const isBusy = isLoading || isLuckyLoading;
  
  const filteredPresets = React.useMemo(() => {
      if (!searchQuery.trim()) {
          const category = filterCategories.find(c => c.id === activeCategoryId);
          return category ? category.presets : [];
      }
      // Flatten categories and filter
      return filterCategories.flatMap(c => c.presets).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, activeCategoryId]);

  const handlePresetClick = (preset: FilterPreset) => {
    setSelectedPreset(preset);
    setCustomPrompt('');
    setStrength('Normal');
  };
  
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedPreset(null);
  };

  const handleApply = () => {
    if (activePrompt) {
      let finalPrompt = activePrompt;
      if (selectedPreset) { // Only apply strength to presets, not custom prompts
        switch (strength) {
          case 'Subtle':
            finalPrompt = `Subtle and gentle. ${activePrompt}`;
            break;
          case 'Strong':
            finalPrompt = `Strong and dramatic. ${activePrompt}`;
            break;
        }
      }
      onApplyFilter(finalPrompt, activeName);
    }
  };
  
  const handleLuckyClick = async () => {
    setIsLuckyLoading(true);
    try {
        await onApplyLuckyFilter();
    } finally {
        setIsLuckyLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 animate-fade-in h-full">
      <div className="text-center space-y-4">
         <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">{t('filterTitle')}</h3>
         
         {/* Search Bar */}
         <div className="relative w-full max-w-md mx-auto">
             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input 
                type="text" 
                placeholder="Search filters..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
             />
         </div>

         {/* Category Tabs - Hide if searching */}
         {!searchQuery && (
            <div className="flex flex-wrap justify-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                {filterCategories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategoryId(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeCategoryId === cat.id ? 'bg-white dark:bg-gray-700 text-theme-accent shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        {t(cat.titleKey as any)}
                    </button>
                ))}
            </div>
         )}
      </div>
      
      {/* Filter Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
        {filteredPresets.map(preset => (
            <button
            key={preset.name}
            onClick={() => handlePresetClick(preset)}
            disabled={isBusy}
            className={`relative group flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 active:scale-95 ${selectedPreset?.name === preset.name ? 'border-theme-accent bg-theme-accent/5' : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-200 dark:hover:border-gray-700'}`}
            >
                <div className={`w-10 h-10 mb-2 text-gray-700 dark:text-gray-300 transition-colors ${selectedPreset?.name === preset.name ? 'text-theme-accent' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                    {preset.icon}
                </div>
                <span className="text-[10px] font-bold text-center leading-tight text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">{preset.name}</span>
                {selectedPreset?.name === preset.name && (
                    <div className="absolute inset-0 rounded-xl ring-2 ring-theme-accent ring-offset-2 ring-offset-white dark:ring-offset-black opacity-50 pointer-events-none"></div>
                )}
            </button>
        ))}
        {filteredPresets.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                No filters found matching "{searchQuery}"
            </div>
        )}
      </div>

      <div className="space-y-4 mt-auto">
          {/* Custom Prompt Input */}
          <input
            type="text"
            value={customPrompt}
            onChange={handleCustomChange}
            placeholder={t('filterPlaceholder')}
            className="w-full bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-theme-accent focus:outline-none transition disabled:opacity-60 text-sm"
            disabled={isBusy}
          />

          {selectedPreset && (
            <div className="animate-fade-in flex flex-col items-center gap-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('effectStrength')}</label>
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                    {(['Subtle', 'Normal', 'Strong'] as const).map(level => (
                        <button
                            key={level}
                            onClick={() => setStrength(level)}
                            disabled={isBusy}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                                strength === level
                                ? 'bg-white dark:bg-gray-700 text-theme-accent shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            {t(`strength${level}` as any)}
                        </button>
                    ))}
                </div>
            </div>
          )}
          
          <div className="flex gap-2">
               <button
                onClick={handleLuckyClick}
                className="flex-1 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold py-3.5 px-4 rounded-xl transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={isBusy}
                title={t('feelingLucky')}
              >
                <SparkleIcon className={`w-4 h-4 ${isLuckyLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t('feelingLucky')}</span>
              </button>

              <button
                onClick={handleApply}
                className="flex-[2] bg-theme-gradient text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-theme-accent/20 hover:shadow-theme-accent/40 hover:-translate-y-0.5 active:scale-95 text-sm disabled:opacity-50 disabled:shadow-none disabled:transform-none"
                disabled={isBusy || !activePrompt.trim()}
              >
                {t('applyFilter')}
              </button>
          </div>
      </div>
    </div>
  );
};

export default React.memo(FilterPanel);
