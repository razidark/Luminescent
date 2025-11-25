/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { GenerateIcon, MagicWandIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { enhancePrompt } from '../services/geminiService';

interface GeneratePanelProps {
  onGenerate: (prompt: string, numImages: number, aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16') => void;
  isLoading: boolean;
}

type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

const GeneratePanel: React.FC<GeneratePanelProps> = ({ onGenerate, isLoading }) => {
  const { t } = useLanguage();
  const [prompt, setPrompt] = React.useState('');
  const [numImages, setNumImages] = React.useState<1 | 2 | 4>(1);
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatio>('1:1');
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);

  const stylePresets = [
    'Photorealistic', 'Cinematic', 'Anime', 'Fantasy Art', 'Cyberpunk', 'Steampunk', 'Watercolor', 'Pixel Art', 'Low Poly', 'Surreal'
  ];

  const handleApply = () => {
    if (prompt.trim()) {
      onGenerate(prompt, numImages, aspectRatio);
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
    <div className="w-full p-6 flex flex-col gap-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('generateImageTitle')}</h3>
      
      <div className="relative w-full">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isListening ? t('listening') : t('generateImagePlaceholder')}
            className={`flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-theme-accent focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base min-h-[80px] pr-12 ${isListening ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
            disabled={isLoading || isEnhancing}
            rows={3}
          />
           <div className="absolute bottom-2 right-2 flex flex-col gap-2">
               <button
                onClick={handleEnhancePrompt}
                disabled={isLoading || isEnhancing || !prompt.trim()}
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('enhancePrompt')}
                className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-theme-accent hover:bg-theme-accent hover:text-white transition-all disabled:opacity-50"
              >
                <MagicWandIcon className={`w-5 h-5 ${isEnhancing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleMicClick}
                disabled={isLoading || isEnhancing || isListening}
                data-tooltip-id="app-tooltip"
                data-tooltip-content={t('voiceInput')}
                className={`p-2 rounded-full bg-gray-100 dark:bg-white/10 transition-all disabled:opacity-50 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20'}`}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
           </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">{t('stylePresets')}</span>
        {stylePresets.map(style => (
            <button
                key={style}
                onClick={() => handleStyleClick(style)}
                disabled={isLoading || isEnhancing}
                className="px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200"
            >
                {style}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('cropAspectRatio')}</label>
          <div className="flex items-center gap-2 flex-wrap">
            {(['1:1', '4:3', '3:4', '16:9', '9:16'] as const).map(ar => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                disabled={isLoading}
                className={`flex-grow px-4 py-2 rounded-md text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                  aspectRatio === ar
                    ? 'bg-theme-gradient text-white shadow-md shadow-theme-accent/20'
                    : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('numberOfImages')}</label>
          <div className="flex items-center gap-2">
            {([1, 2, 4] as const).map(num => (
              <button
                key={num}
                onClick={() => setNumImages(num)}
                disabled={isLoading}
                className={`flex-grow px-4 py-2 rounded-md text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                  numImages === num
                    ? 'bg-theme-gradient text-white shadow-md shadow-theme-accent/20'
                    : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200'
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
        className="w-full mt-2 bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
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