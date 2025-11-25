/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { memo, useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Spinner from './Spinner';
import GeneratePanel from './GeneratePanel';
// FIX: Imported all missing icons to resolve module export errors.
import { GenerateIcon, EditIcon, DownloadIcon, SaveIcon } from './icons';
import { dataURLtoFile } from '../utils/helpers';

interface GeneratorViewProps {
    isLoading: boolean;
    loadingMessage: string;
    generatedImages: string[];
    prompt: string;
    error: string | null;
    setError: (error: string | null) => void;
    onSelectForEditing: (base64Image: string) => void;
    onDownload: (file: File) => void;
    onGenerate: (prompt: string, numImages: number, aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16') => void;
}

const GeneratorView: React.FC<GeneratorViewProps> = ({
    isLoading,
    loadingMessage,
    generatedImages,
    prompt,
    error,
    setError,
    onSelectForEditing,
    onDownload,
    onGenerate
}) => {
    const { t } = useLanguage();
    const [savedStates, setSavedStates] = useState<boolean[]>([]);

    useEffect(() => {
        // Reset saved states when a new set of images is generated
        setSavedStates(new Array(generatedImages.length).fill(false));
    }, [generatedImages]);

    const handleSave = async (imgSrc: string, index: number) => {
        const { addCreation } = await import('../utils/db');
        const file = dataURLtoFile(imgSrc, 'creation.png');
        await addCreation({
            type: 'image',
            blob: file,
            thumbnailBlob: file,
            prompt: prompt,
            createdAt: new Date(),
        });
        setSavedStates(prev => {
            const newStates = [...prev];
            newStates[index] = true;
            return newStates;
        });
    };

    return (
        <>
            <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
                <div className="relative w-full shadow-2xl rounded-2xl overflow-hidden checkerboard-bg flex justify-center items-center h-[55vh] min-h-[350px] md:h-[60vh] md:min-h-[450px] border border-gray-200 dark:border-gray-800">
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/70 z-30 flex flex-col items-center justify-center gap-4 animate-fade-in backdrop-blur-sm p-8 text-center">
                            <Spinner />
                            <p className="text-gray-300 text-lg font-semibold">{loadingMessage}</p>
                            <div className="w-full max-w-md bg-gray-500/30 rounded-full h-2.5 mt-4 overflow-hidden">
                                <div className="bg-theme-gradient h-2.5 rounded-full animate-progress-image"></div>
                            </div>
                        </div>
                    )}
                    {generatedImages.length > 0 ? (
                        <div className={`w-full h-full grid gap-4 p-4 ${generatedImages.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} overflow-y-auto custom-scrollbar`}>
                            {generatedImages.map((imgSrc, index) => (
                                <div key={index} className="relative group rounded-xl overflow-hidden shadow-lg">
                                    <img src={imgSrc} alt={`Generated image ${index + 1}`} className="w-full h-full object-contain bg-black/20" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                        <button
                                            onClick={() => handleSave(imgSrc, index)}
                                            data-tooltip-id="app-tooltip"
                                            data-tooltip-content={savedStates[index] ? t('gallerySaved') : t('gallerySave')}
                                            className={`p-3 bg-white/10 text-gray-200 rounded-full transition-all duration-200 ${savedStates[index] ? 'bg-green-500/50 cursor-default' : 'hover:bg-theme-accent-hover'}`}
                                            disabled={savedStates[index]}
                                        >
                                            <SaveIcon className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={() => onSelectForEditing(imgSrc)}
                                            data-tooltip-id="app-tooltip"
                                            data-tooltip-content={t('editImage')}
                                            className="p-3 bg-white/10 text-gray-200 rounded-full transition-colors hover:bg-theme-accent-hover"
                                        >
                                            <EditIcon className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={() => onDownload(dataURLtoFile(imgSrc, 'download.jpeg'))}
                                            data-tooltip-id="app-tooltip"
                                            data-tooltip-content={t('download')}
                                            className="p-3 bg-white/10 text-gray-200 rounded-full transition-colors hover:bg-theme-accent-hover"
                                        >
                                            <DownloadIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 p-8">
                            <GenerateIcon className="w-24 h-24 mx-auto text-gray-600/50" />
                            <h2 className="mt-4 text-2xl font-bold text-gray-300">{t('imageGeneration')}</h2>
                            <p className="mt-2 max-w-md mx-auto text-gray-500">{t('imageGenerationDescription')}</p>
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
                 <div className="w-full mt-6 glass-panel p-1">
                    <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl backdrop-blur-sm">
                        <GeneratePanel onGenerate={onGenerate} isLoading={isLoading} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default memo(GeneratorView);