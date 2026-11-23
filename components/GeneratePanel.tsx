/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { GenerateIcon, MagicWandIcon, SparkleIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { enhancePrompt } from '../services/geminiService';

interface GeneratePanelProps {
  onGenerate: (prompt: string, numImages: number, aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16', quality: 'standard' | 'pro', imageSize: '1K' | '2K' | '4K') => void;
  isLoading: boolean;
}

type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
type Quality = 'standard' | 'pro';
type ImageSize = '1K' | '2K' | '4K';

const GeneratePanel: React.FC<GeneratePanelProps> = ({ onGenerate, isLoading }) => {
  const { t } = useLanguage();
  const [prompt, setPrompt] = React.useState('');
  const [numImages, setNumImages] = React.useState<1 | 2 | 4>(1);
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatio>('1:1');
  const [quality, setQuality] = React.useState<Quality>('standard');
  const [imageSize, setImageSize] = React.useState<ImageSize>('1K');
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);

  const stylePresets = [
    'Photorealistic', 'Cinematic', 'Anime', 'Fantasy Art', 'Cyberpunk', 'Steampunk', 'Watercolor', 'Pixel Art', 'Low Poly', 'Surreal'
  ];

  const handleApply = () => {
    if (prompt.trim()) {
      onGenerate(prompt, numImages, aspectRatio, quality, imageSize);
    }
  };
  
  const handleStyleClick = (style: string) => {
    const newPrompt = prompt.trim().length > 0 ? `${prompt.trim()}, ${style.toLowerCase()}` : style;
    setPrompt(newPrompt);
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (e) {
      console.error("Failed to enhance prompt", e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(t('errorNoVoice'));
      return;
    }
    
    if (isListening) return;

    setIsListening(true);
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  return (
    <div className="w-full p-6 flex flex-col gap-6 animate-fade-in">
      <h3 className="text-sm font-black uppercase tracking-widest text-center text-gray-900 dark:text-white pb-2 border-b border-gray-200/50 dark:border-white/5">{t('generateImageTitle')}</h3>
      
      <div className="relative w-full">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isListening ? t('listening') : t('generateImagePlaceholder')}
            className={`flex-grow bg-white/40 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl p-4 focus:ring-2 focus:ring-theme-accent focus:bg-white/70 dark:focus:bg-white/10 focus:outline-none transition-all w-full disabled:cursor-not-allowed disabled:opacity-60 text-sm min-h-[90px] pr-12 ${isListening ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
            disabled={isLoading || isEnhancing}
            rows={3}
          />
           <div className="absolute bottom-3 right-3 flex flex-col gap-2">
               <button
                onClick={handleEnhancePrompt}
                disabled={isLoading || isEnhancing || !prompt.trim()}
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('enhancePrompt')}
                className="p-2 rounded-xl bg-gray-100/80 dark:bg-white/10 text-theme-accent hover:bg-theme-accent hover:text-white transition-all duration-200 active:scale-95 disabled:opacity-40"
              >
                <MagicWandIcon className={`w-4 h-4 ${isEnhancing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleMicClick}
                disabled={isLoading || isEnhancing || isListening}
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('voiceInput')}
                className={`p-2 rounded-xl bg-gray-100/80 dark:bg-white/10 transition-all duration-200 active:scale-95 disabled:opacity-40 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20'}`}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
           </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('stylePresets')}</span>
        <div className="flex flex-wrap gap-2 max-h-[110px] overflow-y-auto custom-scrollbar p-1">
          {stylePresets.map(style => (
              <button
                  key={style}
                  onClick={() => handleStyleClick(style)}
                  disabled={isLoading || isEnhancing}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-250 active:scale-95 disabled:opacity-50 border border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-800 dark:text-gray-200 hover:scale-[1.02]"
              >
                  {style}
              </button>
          ))}
        </div>
      </div>

      {/* Quality & Size Selection */}
      <div className="p-5 bg-white/30 dark:bg-white/5 rounded-2xl border border-gray-200/60 dark:border-white/10 space-y-4">
          <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 block">Model Quality</label>
              <div className="flex gap-2">
                  <button
                      onClick={() => setQuality('standard')}
                      disabled={isLoading}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${quality === 'standard' ? 'bg-white dark:bg-gray-800 text-theme-accent border-theme-accent/20 shadow-sm' : 'bg-transparent text-gray-600 dark:text-gray-400 border-transparent hover:bg-white/50 dark:hover:bg-white/10'}`}
                  >
                      Standard (Fast)
                  </button>
                  <button
                      onClick={() => setQuality('pro')}
                      disabled={isLoading}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${quality === 'pro' ? 'bg-theme-gradient text-white border-transparent shadow-md shadow-theme-accent/10' : 'bg-transparent text-gray-600 dark:text-gray-400 border-transparent hover:bg-white/50 dark:hover:bg-white/10'}`}
                  >
                      <SparkleIcon className="w-4 h-4" />
                      Pro (High Quality)
                  </button>
              </div>
          </div>

          {quality === 'pro' && (
              <div className="animate-fade-in pt-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 block">Resolution</label>
                  <div className="flex gap-2">
                      {(['1K', '2K', '4K'] as const).map(size => (
                          <button
                              key={size}
                              onClick={() => setImageSize(size)}
                              disabled={isLoading}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${imageSize === size ? 'bg-white dark:bg-gray-800 text-theme-accent border-theme-accent/30 shadow-sm' : 'bg-gray-100/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-transparent'}`}
                          >
                               {size}
                          </button>
                      ))}
                  </div>
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('cropAspectRatio')}</label>
          <div className="flex items-center gap-2 flex-wrap">
            {(['1:1', '4:3', '3:4', '16:9', '9:16'] as const).map(ar => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                disabled={isLoading}
                className={`flex-grow px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 border ${
                  aspectRatio === ar
                    ? 'bg-theme-gradient text-white border-transparent shadow-md shadow-theme-accent/15'
                    : 'bg-white/40 dark:bg-white/5 border-gray-200/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('numberOfImages')}</label>
          <div className="flex items-center gap-2">
            {([1, 2, 4] as const).map(num => (
              <button
                key={num}
                onClick={() => setNumImages(num)}
                disabled={isLoading}
                className={`flex-grow px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 border ${
                  numImages === num
                    ? 'bg-theme-gradient text-white border-transparent shadow-md shadow-theme-accent/15'
                    : 'bg-white/40 dark:bg-white/5 border-gray-200/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleApply}
        disabled={isLoading || isEnhancing || !prompt.trim()}
        className="w-full mt-2 bg-theme-gradient text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 text-sm disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        <div className="flex items-center justify-center gap-2">
            <GenerateIcon className="w-5 h-5" />
            {t('generate')}
        </div>
      </button>
    </div>
  );
};

export default React.memo(GeneratePanel);
