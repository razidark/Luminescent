/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { VideoIcon, UploadIcon, TimeIcon, CameraIcon, CinematicIcon, RealisticIcon, AnimatedIcon, HyperlapseIcon, MagicWandIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { enhancePrompt } from '../services/geminiService';

interface VideoPanelProps {
  onGenerate: (prompt: string, image?: File) => void;
  isLoading: boolean;
}

type Duration = 'short' | 'medium' | 'long';
type Style = 'cinematic' | 'realistic' | 'animated' | 'hyperlapse';
type Motion = 'static' | 'pan' | 'zoom' | 'rotate';

const SettingButton: React.FC<{isActive: boolean, onClick: () => void, disabled: boolean, children: React.ReactNode, label: string}> = ({ isActive, onClick, disabled, children, label }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center justify-start gap-2 w-full text-center text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all duration-200 ease-in-out active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed group`}
    >
        <div className={`w-16 h-16 flex items-center justify-center rounded-full bg-gray-200/60 dark:bg-white/5 group-hover:bg-gray-300/80 dark:group-hover:bg-white/10 transition-all duration-300 border-2 ${isActive ? 'border-theme-accent glow' : 'border-gray-300/80 dark:border-gray-700/80'}`}>
            <div className="w-8 h-8 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{children}</div>
        </div>
        <span className="leading-tight">{label}</span>
    </button>
);


const VideoPanel: React.FC<VideoPanelProps> = ({ onGenerate, isLoading }) => {
  const { t } = useLanguage();
  const [prompt, setPrompt] = React.useState('');
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isListening, setIsListening] = React.useState(false);
  const [isEnhancing, setIsEnhancing] = React.useState(false);

  // New state for advanced controls
  const [duration, setDuration] = React.useState<Duration>('medium');
  const [style, setStyle] = React.useState<Style>('cinematic');
  const [motion, setMotion] = React.useState<Motion>('pan');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const fullPrompt = React.useMemo(() => {
    let finalPrompt = prompt;
    if (style) finalPrompt += `, ${style} style`;
    if (duration === 'short') finalPrompt += ', short duration (around 3 seconds)';
    if (duration === 'medium') finalPrompt += ', medium duration (around 5 seconds)';
    if (duration === 'long') finalPrompt += ', long duration (around 7 seconds)';
    if (motion !== 'static') finalPrompt += `, with ${motion} camera motion`;
    return finalPrompt;
  }, [prompt, duration, style, motion]);

  const handleApply = () => {
    if (prompt.trim()) {
      onGenerate(fullPrompt, imageFile || undefined);
    }
  };
  
  return (
    <div className="w-full p-6 flex flex-col gap-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('videoGeneration')}</h3>
      
      <div className="relative w-full">
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isListening ? t('listening') : t('videoGenerationDescription')}
            className={`flex-grow bg-white/80 dark:bg-gray-800/50 border border-gray-300/80 dark:border-gray-700/60 text-gray-800 dark:text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-theme-accent focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base min-h-[80px] pr-12 ${isListening ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
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
      
      <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <div className="flex-shrink-0">
            {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-md object-cover"/>
            ) : (
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-500">
                    <UploadIcon className="h-10 w-10" />
                </div>
            )}
        </div>
        <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('videoAnimateImageTitle')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('videoAnimateImageDesc')}</p>
            <div className="flex gap-2 mt-1">
                <label htmlFor="image-upload-video" className="cursor-pointer px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-md transition-colors hover:bg-gray-300 dark:hover:bg-white/20 font-semibold text-sm">
                    {t('uploadImage')}
                </label>
                <input id="image-upload-video" type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isLoading} />
                {imageFile && <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="px-4 py-2 bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-200 rounded-md transition-colors hover:bg-red-300 dark:hover:bg-red-900/60 font-semibold text-sm">{t('remove')}</button>}
            </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('videoSettings')}</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('videoDuration')}</label>
            <div className="grid grid-cols-3 gap-2">
                <SettingButton isActive={duration === 'short'} onClick={() => setDuration('short')} disabled={isLoading} label={t('videoDurationShort')}><TimeIcon /></SettingButton>
                <SettingButton isActive={duration === 'medium'} onClick={() => setDuration('medium')} disabled={isLoading} label={t('videoDurationMedium')}><TimeIcon /></SettingButton>
                <SettingButton isActive={duration === 'long'} onClick={() => setDuration('long')} disabled={isLoading} label={t('videoDurationLong')}><TimeIcon /></SettingButton>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('videoStyle')}</label>
             <div className="grid grid-cols-4 gap-2">
                <SettingButton isActive={style === 'cinematic'} onClick={() => setStyle('cinematic')} disabled={isLoading} label={t('videoStyleCinematic')}><CinematicIcon /></SettingButton>
                <SettingButton isActive={style === 'realistic'} onClick={() => setStyle('realistic')} disabled={isLoading} label={t('videoStyleRealistic')}><RealisticIcon /></SettingButton>
                <SettingButton isActive={style === 'animated'} onClick={() => setStyle('animated')} disabled={isLoading} label={t('videoStyleAnimated')}><AnimatedIcon /></SettingButton>
                <SettingButton isActive={style === 'hyperlapse'} onClick={() => setStyle('hyperlapse')} disabled={isLoading} label={t('videoStyleHyperlapse')}><HyperlapseIcon /></SettingButton>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('videoCameraMotion')}</label>
            <div className="grid grid-cols-4 gap-2">
                <SettingButton isActive={motion === 'static'} onClick={() => setMotion('static')} disabled={isLoading} label={t('videoMotionStatic')}><CameraIcon /></SettingButton>
                <SettingButton isActive={motion === 'pan'} onClick={() => setMotion('pan')} disabled={isLoading} label={t('videoMotionPan')}><CameraIcon /></SettingButton>
                <SettingButton isActive={motion === 'zoom'} onClick={() => setMotion('zoom')} disabled={isLoading} label={t('videoMotionZoom')}><CameraIcon /></SettingButton>
                <SettingButton isActive={motion === 'rotate'} onClick={() => setMotion('rotate')} disabled={isLoading} label={t('videoMotionRotate')}><CameraIcon /></SettingButton>
            </div>
          </div>
      </div>

      <button
        onClick={handleApply}
        disabled={isLoading || !prompt.trim()}
        className="w-full mt-2 bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/30 hover:shadow-xl hover:shadow-theme-accent/40 hover:brightness-110 active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:brightness-100"
      >
        <div className="flex items-center justify-center gap-2">
            <VideoIcon className="w-5 h-5" />
            {t('generateVideo')}
        </div>
      </button>
    </div>
  );
};

export default React.memo(VideoPanel);