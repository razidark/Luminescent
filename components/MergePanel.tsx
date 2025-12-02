
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useEditor } from '../contexts/EditorContext';
import { SparkleIcon, UploadIcon } from './icons';

interface MergePanelProps {
  isLoading: boolean;
}

const MergePanel: React.FC<MergePanelProps> = ({ isLoading }) => {
    const { t } = useLanguage();
    const { handleApplyMerge } = useEditor();
    
    const [mergeImage, setMergeImage] = React.useState<File | null>(null);
    const [mergeImageUrl, setMergeImageUrl] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [blendMode, setBlendMode] = React.useState<'smart' | 'character' | 'double_exposure' | 'texture'>('smart');
    const [customPrompt, setCustomPrompt] = React.useState('');

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setMergeImage(file);
            const url = URL.createObjectURL(file);
            if (mergeImageUrl) {
                URL.revokeObjectURL(mergeImageUrl);
            }
            setMergeImageUrl(url);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };

    const constructPrompt = () => {
        let base = "";
        switch (blendMode) {
            case 'smart':
                base = "Intelligently blend the content of the second image into the first image, maintaining a realistic composition.";
                break;
            case 'character':
                base = "Take the character or main subject from the second image and place them seamlessly into the scene of the first image. Adjust lighting and perspective to match.";
                break;
            case 'double_exposure':
                base = "Create an artistic double exposure effect, merging the textures and forms of both images.";
                break;
            case 'texture':
                base = "Apply the texture and artistic style of the second image onto the shapes and objects of the first image.";
                break;
        }
        if (customPrompt) {
            base += ` Additional instructions: ${customPrompt}`;
        }
        return base;
    };

    const handleApply = () => {
        if (mergeImage) {
            handleApplyMerge(mergeImage, constructPrompt());
        }
    };

    return (
        <div className="w-full p-6 flex flex-col items-center gap-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('mergeTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2 max-w-md">{t('mergeDescription')}</p>
            
            <div className="w-full max-w-md">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('mergeUpload')}</label>
                {mergeImageUrl ? (
                    <div className="relative group">
                        <img src={mergeImageUrl} alt="Merge Preview" className="w-full h-48 object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <label htmlFor="merge-image-upload" className="cursor-pointer px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-md transition-colors hover:bg-gray-300 dark:hover:bg-white/20 font-semibold text-sm">
                                {t('uploadDifferentImage')}
                            </label>
                        </div>
                    </div>
                ) : (
                    <div
                        onDrop={handleDrop}
                        onDragEnter={handleDragEvents}
                        onDragOver={handleDragEvents}
                        onDragLeave={handleDragEvents}
                        className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${isDragging ? 'border-theme-accent bg-theme-accent/10' : 'border-gray-300 dark:border-gray-600 hover:border-theme-accent'}`}
                    >
                        <UploadIcon className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2"/>
                        <p className="text-gray-600 dark:text-gray-400 font-semibold">{t('mergeUpload')}</p>
                        <p className="text-sm text-gray-500">{t('mergeUploadDesc')}</p>
                        <label htmlFor="merge-image-upload" className="mt-2 cursor-pointer text-theme-accent hover:text-theme-accent-hover font-bold">
                            {t('uploadImage')}
                        </label>
                    </div>
                )}
                <input id="merge-image-upload" type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={isLoading} />
            </div>

            <div className="w-full max-w-md space-y-3">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">{t('mergeMode')}</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setBlendMode('smart')}
                        className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border ${blendMode === 'smart' ? 'bg-theme-accent text-white border-transparent' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                    >
                        {t('mergeModeSmart')}
                    </button>
                    <button
                        onClick={() => setBlendMode('character')}
                        className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border ${blendMode === 'character' ? 'bg-theme-accent text-white border-transparent' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                    >
                        {t('mergeModeCharacter')}
                    </button>
                    <button
                        onClick={() => setBlendMode('double_exposure')}
                        className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border ${blendMode === 'double_exposure' ? 'bg-theme-accent text-white border-transparent' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                    >
                        {t('mergeModeDoubleExp')}
                    </button>
                    <button
                        onClick={() => setBlendMode('texture')}
                        className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border ${blendMode === 'texture' ? 'bg-theme-accent text-white border-transparent' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                    >
                        {t('mergeModeTexture')}
                    </button>
                </div>
            </div>

            <div className="w-full max-w-md">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('mergePrompt')}</label>
                <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={t('mergePlaceholder')}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-theme-accent focus:outline-none transition disabled:cursor-not-allowed disabled:opacity-60 text-sm shadow-sm"
                    rows={3}
                    disabled={isLoading}
                />
            </div>

            <button
                onClick={handleApply}
                disabled={isLoading || !mergeImage}
                className="w-full max-w-xs mt-2 bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            >
                <div className="flex items-center justify-center gap-2">
                    <SparkleIcon className="w-5 h-5" />
                    {t('applyMerge')}
                </div>
            </button>
        </div>
    );
};

export default React.memo(MergePanel);
