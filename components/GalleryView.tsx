
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, memo, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Creation, Tab } from '../types';
import { getAllCreations, deleteCreation } from '../utils/db';
import Spinner from './Spinner';
import { GalleryIcon, DownloadIcon, EditIcon, TrashIcon, VideoIcon, RefreshIcon } from './icons';

interface GalleryViewProps {
    onEdit: (file: File, targetTab: Tab) => void;
    setError: (error: string | null) => void;
    onRemix: (prompt: string) => void;
}

// Sub-component to manage Object URL lifecycle and prevent memory leaks
const GalleryThumbnail: React.FC<{ 
    item: Creation; 
    onClick: () => void; 
    onEdit: (e: React.MouseEvent) => void; 
    onDownload: (e: React.MouseEvent) => void; 
    onDelete: (e: React.MouseEvent) => void; 
    onRemix: (e: React.MouseEvent) => void;
    t: (key: string) => string;
}> = memo(({ item, onClick, onEdit, onDownload, onDelete, onRemix, t }) => {
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);

    useEffect(() => {
        const url = URL.createObjectURL(item.thumbnailBlob);
        setThumbUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [item.thumbnailBlob]);

    if (!thumbUrl) return <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse" />;

    return (
        <div className="relative group rounded-lg overflow-hidden aspect-square animated-border-box" onClick={onClick}>
            <img src={thumbUrl} alt={`Creation ${item.id}`} className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110" />
            {item.type === 'video' && <VideoIcon className="absolute bottom-2 right-2 w-6 h-6 text-white drop-shadow-lg" />}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                {item.prompt && (
                    <button 
                        onClick={onRemix} 
                        className="p-3 bg-white/10 text-gray-200 rounded-full transition-all hover:bg-theme-accent-hover hover:scale-110 active:scale-95" 
                        data-tooltip-id="app-tooltip"
                        data-tooltip-content={t('galleryRemix')}
                    >
                        <RefreshIcon className="w-6 h-6" />
                    </button>
                )}
                <button 
                    onClick={onEdit} 
                    disabled={item.type === 'video'} 
                    className="p-3 bg-white/10 text-gray-200 rounded-full transition-all hover:bg-theme-accent-hover hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-tooltip-id="app-tooltip"
                    data-tooltip-content={t('galleryEdit')}
                >
                    <EditIcon className="w-6 h-6" />
                </button>
                <button 
                    onClick={onDownload} 
                    className="p-3 bg-white/10 text-gray-200 rounded-full transition-all hover:bg-theme-accent-hover hover:scale-110 active:scale-95"
                    data-tooltip-id="app-tooltip"
                    data-tooltip-content={t('galleryDownload')}
                >
                    <DownloadIcon className="w-6 h-6" />
                </button>
                <button 
                    onClick={onDelete} 
                    className="p-3 bg-white/10 text-gray-200 rounded-full transition-all hover:bg-red-500/80 hover:scale-110 active:scale-95"
                    data-tooltip-id="app-tooltip"
                    data-tooltip-content={t('galleryDelete')}
                >
                    <TrashIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
});

const GalleryView: React.FC<GalleryViewProps> = ({ onEdit, setError, onRemix }) => {
    const { t } = useLanguage();
    const [creations, setCreations] = useState<Creation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
    const [previewItem, setPreviewItem] = useState<{item: Creation, url: string} | null>(null);

    const fetchCreations = useCallback(async () => {
        setIsLoading(true);
        try {
            const items = await getAllCreations();
            setCreations(items);
        } catch (error) {
            console.error("Failed to load creations:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCreations();
    }, [fetchCreations]);
    
    const handleDelete = async (id: number) => {
        if (window.confirm(t('galleryDeleteConfirm'))) {
            try {
                await deleteCreation(id);
                setCreations(creations.filter(c => c.id !== id));
                if (previewItem?.item.id === id) {
                    setPreviewItem(null);
                }
            } catch (error) {
                console.error("Failed to delete creation:", error);
                setError(error instanceof Error ? error.message : 'Failed to delete creation.');
            }
        }
    };

    const handleDownload = (item: Creation) => {
        const url = URL.createObjectURL(item.blob);
        const link = document.createElement('a');
        link.href = url;
        const extension = item.type === 'video' ? 'mp4' : 'png';
        link.download = `luminescence-creation-${item.id}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleEdit = (item: Creation) => {
        if (item.type === 'image') {
            const file = new File([item.blob], `creation-${item.id}.png`, { type: item.blob.type });
            onEdit(file, 'erase');
        }
    };

    const handleRemix = (item: Creation) => {
        if (item.prompt) {
            onRemix(item.prompt);
        }
    };

    const filteredCreations = creations.filter(c => {
        if (filter === 'all') return true;
        return c.type === filter;
    });

    if (isLoading) {
        return <div className="flex justify-center items-center h-[60vh]"><Spinner /></div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">{t('galleryTitle')}</h1>
            <div className="flex items-center gap-2">
                {(['all', 'image', 'video'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-md text-base font-semibold transition-all duration-200 active:scale-95 ${
                            filter === f
                            ? 'text-white shadow-md shadow-theme-accent/20 bg-theme-gradient'
                            : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200'
                        }`}
                    >
                        {f === 'all' ? t('galleryAll') : f === 'image' ? t('galleryImages') : t('galleryVideos')}
                    </button>
                ))}
            </div>

            {filteredCreations.length === 0 ? (
                 <div className="text-center text-gray-400 p-8 mt-16">
                    <GalleryIcon className="w-24 h-24 mx-auto text-gray-600" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-300">{t('galleryEmptyTitle')}</h2>
                    <p className="mt-2 max-w-md mx-auto">{t('galleryEmptyDesc')}</p>
                </div>
            ) : (
                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredCreations.map(item => (
                        <GalleryThumbnail
                            key={item.id}
                            item={item}
                            t={t as any}
                            onClick={() => setPreviewItem({item, url: URL.createObjectURL(item.blob)})}
                            onEdit={(e) => { e.stopPropagation(); handleEdit(item); }}
                            onDownload={(e) => { e.stopPropagation(); handleDownload(item); }}
                            onDelete={(e) => { e.stopPropagation(); handleDelete(item.id!); }}
                            onRemix={(e) => { e.stopPropagation(); handleRemix(item); }}
                        />
                    ))}
                </div>
            )}
            
            {previewItem && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewItem(null)}>
                     <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                        {previewItem.item.type === 'image' ? (
                            <img src={previewItem.url} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                             <video src={previewItem.url} controls autoPlay loop className="w-full h-full object-contain" />
                        )}
                        <div className="flex items-center justify-center gap-4 p-4 bg-gray-900/50 rounded-b-lg flex-wrap backdrop-blur-md border-t border-white/10">
                             {previewItem.item.prompt && <span className="text-gray-300 text-sm italic hidden md:block truncate max-w-md">"{previewItem.item.prompt}"</span>}
                             <div className="flex items-center gap-2 flex-shrink-0">
                                {previewItem.item.prompt && <button onClick={() => { setPreviewItem(null); handleRemix(previewItem.item); }} className="flex items-center gap-2 px-4 py-2 bg-theme-gradient text-white rounded-md transition-colors hover:brightness-110 font-semibold shadow-lg active:scale-95"><RefreshIcon className="w-4 h-4"/>{t('galleryRemix')}</button>}
                                <button onClick={() => { setPreviewItem(null); handleEdit(previewItem.item); }} disabled={previewItem.item.type === 'video'} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-md transition-colors hover:bg-gray-300 dark:hover:bg-white/20 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"><EditIcon className="w-4 h-4"/>{t('galleryEdit')}</button>
                                <button onClick={() => handleDownload(previewItem.item)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-md transition-colors hover:bg-gray-300 dark:hover:bg-white/20 font-semibold"><DownloadIcon className="w-4 h-4"/>{t('galleryDownload')}</button>
                                <button onClick={() => handleDelete(previewItem.item.id!)} className="flex items-center gap-2 px-4 py-2 bg-red-800/50 text-red-200 rounded-md transition-colors hover:bg-red-800/80 font-semibold"><TrashIcon className="w-4 h-4"/>{t('galleryDelete')}</button>
                            </div>
                        </div>
                     </div>
                 </div>
            )}

        </div>
    );
};

export default memo(GalleryView);
