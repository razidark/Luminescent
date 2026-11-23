/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useEditor } from '../contexts/EditorContext';
import { SparkleIcon, UploadIcon } from './icons';

interface StyleTransferPanelProps {
  isLoading: boolean;
}

const StyleTransferPanel: React.FC<StyleTransferPanelProps> = ({ isLoading }) => {
    const { t } = useLanguage();
    const { handleApplyStyleTransfer } = useEditor();
    
    const [styleImage, setStyleImage] = React.useState<File | null>(null);
    const [styleImageUrl, setStyleImageUrl] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setStyleImage(file);
            const url = URL.createObjectURL(file);
            if (styleImageUrl) {
                URL.revokeObjectURL(styleImageUrl);
            }
            setStyleImageUrl(url);
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

    const handleApply = () => {
        if (styleImage) {
            handleApplyStyleTransfer(styleImage);
        }
    };

    return (
        <div className="w-full p-6 flex flex-col items-center gap-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('styleTransferTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2 max-w-md">{t('styleTransferDescription')}</p>
            
            <div className="w-full max-w-md">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('styleTransferStyleImage')}</label>
                {styleImageUrl ? (
                    <div className="relative group">
                        <img src={styleImageUrl} alt="Style Preview" className="w-full h-48 object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <label htmlFor="style-image-upload" className="cursor-pointer px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-md transition-colors hover:bg-gray-300 dark:hover:bg-white/20 font-semibold text-sm">
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
                        <p className="text-gray-600 dark:text-gray-400 font-semibold">{t('styleTransferUpload')}</p>
                        <p className="text-sm text-gray-500">{t('styleTransferUploadDesc')}</p>
                        <label htmlFor="style-image-upload" className="mt-2 cursor-pointer text-theme-accent hover:text-theme-accent-hover font-bold">
                            {t('uploadImage')}
                        </label>
                    </div>
                )}
                <input id="style-image-upload" type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={isLoading} />
            </div>

            <button
                onClick={handleApply}
                disabled={isLoading || !styleImage}
                className="w-full max-w-xs mt-2 bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            >
                <div className="flex items-center justify-center gap-2">
                    <SparkleIcon className="w-5 h-5" />
                    {t('styleTransferApply')}
                </div>
            </button>
        </div>
    );
};

export default React.memo(StyleTransferPanel);