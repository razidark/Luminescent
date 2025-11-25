
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { memo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Spinner from './Spinner';
import VideoPanel from './VideoPanel';
// FIX: Imported the missing `DownloadIcon` and `SaveIcon` to resolve module export errors.
import { VideoIcon, DownloadIcon, SaveIcon } from './icons';

interface VideoViewProps {
    isLoading: boolean;
    loadingMessage: string;
    generatedVideoUrl: string | null;
    prompt: string;
    error: string | null;
    setError: (error: string | null) => void;
    onDownload: (file: File) => void;
    onGenerate: (prompt: string, image?: File) => void;
}

const VideoView: React.FC<VideoViewProps> = ({
    isLoading,
    loadingMessage,
    generatedVideoUrl,
    prompt,
    error,
    setError,
    onDownload,
    onGenerate
}) => {
    const { t } = useLanguage();
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = async () => {
        if (!generatedVideoUrl) return;
        const { addCreation } = await import('../utils/db');
        const response = await fetch(generatedVideoUrl);
        const blob = await response.blob();
        
        // Creating a video thumbnail requires drawing a frame to a canvas
        const video = document.createElement('video');
        // Important attributes for reliable rendering across browsers
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.src = generatedVideoUrl;
        
        // Important: Wait for the seek to complete before drawing
        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(async (thumbnailBlob) => {
                 if (thumbnailBlob) {
                    await addCreation({
                        type: 'video',
                        blob,
                        thumbnailBlob,
                        prompt,
                        createdAt: new Date(),
                    });
                    setIsSaved(true);
                }
            }, 'image/jpeg', 0.8);
        };

        // Trigger the seek
        video.currentTime = 1; 
    };

    return (
        <>
            <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
                <div className="relative w-full shadow-2xl rounded-xl overflow-hidden checkerboard-bg flex justify-center items-center h-[55vh] min-h-[350px] md:h-[60vh] md:min-h-[450px]">
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/70 z-30 flex flex-col items-center justify-center gap-4 animate-fade-in backdrop-blur-sm p-8 text-center">
                            <Spinner />
                            <p className="text-gray-300 text-lg font-semibold">{loadingMessage}</p>
                             <div className="w-full max-w-md bg-gray-500/30 rounded-full h-2.5 mt-4 overflow-hidden">
                                <div className="bg-theme-gradient h-2.5 rounded-full animate-progress-video"></div>
                            </div>
                        </div>
                    )}
                    {generatedVideoUrl ? (
                        <div className="w-full h-full relative group">
                            <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full object-contain" />
                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={handleSave}
                                    data-tooltip-id="app-tooltip"
                                    data-tooltip-content={isSaved ? t('gallerySaved') : t('gallerySave')}
                                    className={`p-3 bg-white/10 text-gray-200 rounded-full transition-all duration-200 backdrop-blur-sm ${isSaved ? 'bg-green-500/50 cursor-default' : 'hover:bg-theme-accent-hover'}`}
                                >
                                    <SaveIcon className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={async () => {
                                        const response = await fetch(generatedVideoUrl);
                                        const blob = await response.blob();
                                        const file = new File([blob], `video-${Date.now()}.mp4`, { type: 'video/mp4' });
                                        onDownload(file);
                                    }}
                                    data-tooltip-id="app-tooltip"
                                    data-tooltip-content={t('downloadVideo')}
                                    className="p-3 bg-white/10 text-gray-200 rounded-full transition-colors hover:bg-theme-accent-hover backdrop-blur-sm"
                                >
                                    <DownloadIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 p-8">
                            <VideoIcon className="w-24 h-24 mx-auto text-gray-600" />
                            <h2 className="mt-4 text-2xl font-bold text-gray-300">{t('videoGeneration')}</h2>
                            <p className="mt-2 max-w-md mx-auto">{t('videoGenerationDescription')}</p>
                        </div>
                    )}
                </div>
                {error && (
                    <div className="w-full bg-red-900/40 border border-red-600/50 text-red-200 px-4 py-3 rounded-lg relative animate-fade-in flex items-center gap-3" role="alert" aria-live="polite">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <strong className="font-bold">{t('anErrorOccurred')} </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="absolute top-0 bottom-0 right-0 px-4 py-3"
                            aria-label={t('closeErrorMessage')}
                        >
                            <svg className="fill-current h-6 w-6 text-red-400 hover:text-red-200 transition-colors" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 2.652a1.2 1.2 0 1 1-1.697-1.697L8.183 10 5.531 7.349a1.2 1.2 0 1 1 1.697-1.697L10 8.183l-2.651-2.651a1.2 1.2 0 1 1 1.697 1.697L11.819 10l2.652 2.651a1.2 1.2 0 0 1-.123 1.698z"/></svg>
                        </button>
                    </div>
                 )}
            </div>

            <div className="w-full max-w-6xl mx-auto flex flex-col items-center mt-6">
                <div className="w-full mt-6 p-1 rounded-lg animated-border-box">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-md">
                        <VideoPanel onGenerate={onGenerate} isLoading={isLoading} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default memo(VideoView);
