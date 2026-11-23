
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

const SegmentedControl: React.FC<{
    options: { id: string; label: string }[];
    activeId: string;
    onChange: (id: any) => void;
}> = ({ options, activeId, onChange }) => {
    const activeIndex = options.findIndex(o => o.id === activeId);
    
    return (
        <div className="segmented-control">
            <div 
                className="segmented-slider"
                style={{ 
                    left: `calc(4px + ${activeIndex * (100 / options.length)}%)`, 
                    width: `calc(${100 / options.length}% - 8px)` 
                }}
            />
            {options.map(option => (
                <div
                    key={option.id}
                    onClick={() => onChange(option.id)}
                    className={`segmented-option ${activeId === option.id ? 'active' : ''}`}
                    style={{ width: `${100 / options.length}%`, textAlign: 'center' }}
                >
                    {option.label}
                </div>
            ))}
        </div>
    );
};

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

    if (!thumbUrl) return <div className="w-full h-full bg-gray-200 dark:bg-gray-800 shimmer-bg rounded-2xl" />;

    return (
        <div 
            onClick={onClick}
            className="relative group rounded-2xl overflow-hidden aspect-square border border-gray-200 dark:border-white/10 shadow-md hover:shadow-xl hover:shadow-theme-accent/15 transition-all duration-300 hover:scale-[1.03] cursor-pointer"
        >
            <img 
                src={thumbUrl} 
                alt={`Creation ${item.id}`} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
            />
            {item.type === 'video' && (
                <div className="absolute bottom-3 right-3 p-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <VideoIcon className="w-4 h-4 text-white drop-shadow-md" />
                </div>
            )}
            
            {/* Interactive Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[3px]">
                {item.prompt && (
                    <button 
                        onClick={onRemix} 
                        className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-md transition-all hover:bg-theme-accent hover:shadow-lg hover:shadow-theme-accent/30 hover:scale-110 active:scale-90" 
                        data-tooltip-id="app-tooltip"
                        data-tooltip-content={t('galleryRemix')}
                    >
                        <RefreshIcon className="w-5 h-5" />
                    </button>
                )}
                <button 
                    onClick={onEdit} 
                    disabled={item.type === 'video'} 
                    className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-md transition-all hover:bg-theme-accent hover:shadow-lg hover:shadow-theme-accent/30 hover:scale-110 active:scale-90 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-white/10 disabled:cursor-not-allowed"
                    data-tooltip-id="app-tooltip"
                    data-tooltip-content={t('galleryEdit')}
                >
                    <EditIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={onDownload} 
                    className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-md transition-all hover:bg-theme-accent hover:shadow-lg hover:shadow-theme-accent/30 hover:scale-110 active:scale-90"
                    data-tooltip-id="app-tooltip"
                    data-tooltip-content={t('galleryDownload')}
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={onDelete} 
                    className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-md transition-all hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30 hover:scale-110 active:scale-90"
                    data-tooltip-id="app-tooltip"
                    data-tooltip-content={t('galleryDelete')}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
});

// Memory-safe interactive modal component
const GalleryPreviewModal: React.FC<{
    item: Creation;
    onClose: () => void;
    onEdit: (item: Creation) => void;
    onDownload: (item: Creation) => void;
    onDelete: (id: number) => void;
    onRemix: (item: Creation) => void;
    t: (key: string) => string;
}> = memo(({ item, onClose, onEdit, onDownload, onDelete, onRemix, t }) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const objectUrl = URL.createObjectURL(item.blob);
        setUrl(objectUrl);
        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [item.blob]);

    if (!url) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
            <div 
                className="relative w-full max-w-4xl max-h-[90vh] flex flex-col gap-4 p-6 glass-card-premium rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 animate-scale-up" 
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                    aria-label="Close preview"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Media Container */}
                <div className="flex-grow overflow-hidden rounded-2xl bg-black/20 dark:bg-black/40 flex items-center justify-center min-h-[300px] max-h-[65vh]">
                    {item.type === 'image' ? (
                        <img src={url} alt="Preview" className="max-w-full max-h-[65vh] object-contain select-none" />
                    ) : (
                        <video src={url} controls autoPlay loop className="max-w-full max-h-[65vh] object-contain" />
                    )}
                </div>

                {/* Footer and Info */}
                <div className="flex items-center justify-between gap-4 pt-2 flex-wrap border-t border-gray-200/50 dark:border-white/10">
                    <div className="flex flex-col gap-1 min-w-0">
                        {item.prompt && (
                            <span className="text-gray-955 dark:text-white text-sm font-bold italic truncate max-w-md" title={item.prompt}>
                                "{item.prompt}"
                            </span>
                        )}
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                            {new Date(item.createdAt).toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {item.prompt && (
                            <button
                                onClick={() => { onClose(); onRemix(item); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-theme-gradient text-white rounded-xl transition-all hover:brightness-110 font-bold shadow-lg shadow-theme-accent/20 active:scale-95 text-xs"
                            >
                                <RefreshIcon className="w-4 h-4" />
                                {t('galleryRemix')}
                            </button>
                        )}
                        <button
                            onClick={() => { onClose(); onEdit(item); }}
                            disabled={item.type === 'video'}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-xl transition-all hover:bg-gray-200 dark:hover:bg-white/10 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <EditIcon className="w-4 h-4" />
                            {t('galleryEdit')}
                        </button>
                        <button
                            onClick={() => onDownload(item)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-xl transition-all hover:bg-gray-200 dark:hover:bg-white/10 font-bold text-xs"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            {t('galleryDownload')}
                        </button>
                        <button
                            onClick={() => onDelete(item.id!)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl transition-all hover:bg-red-500 hover:text-white font-bold text-xs"
                        >
                            <TrashIcon className="w-4 h-4" />
                            {t('galleryDelete')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

const GalleryView: React.FC<GalleryViewProps> = ({ onEdit, setError, onRemix }) => {
    const { t } = useLanguage();
    const [creations, setCreations] = useState<Creation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
    const [previewItem, setPreviewItem] = useState<Creation | null>(null);

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
                setCreations(prev => prev.filter(c => c.id !== id));
                if (previewItem?.id === id) {
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
        return (
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-8 animate-fade-in">
                {/* Title Skeleton */}
                <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-2xl shimmer-bg" />
                
                {/* Segmented Control Skeleton */}
                <div className="h-12 w-80 bg-gray-200 dark:bg-gray-800 rounded-2xl shimmer-bg" />

                {/* Grid Skeleton */}
                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl shimmer-bg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
            <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100">{t('galleryTitle')}</h1>
            
            <SegmentedControl
                activeId={filter}
                onChange={setFilter}
                options={[
                    { id: 'all', label: t('galleryAll') },
                    { id: 'image', label: t('galleryImages') },
                    { id: 'video', label: t('galleryVideos') }
                ]}
            />

            {filteredCreations.length === 0 ? (
                 <div className="text-center text-gray-400 p-8 mt-16 animate-fade-in">
                    <GalleryIcon className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-300">{t('galleryEmptyTitle')}</h2>
                    <p className="mt-2 max-w-md mx-auto text-sm text-gray-500 dark:text-gray-400">{t('galleryEmptyDesc')}</p>
                </div>
            ) : (
                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredCreations.map((item, index) => (
                        <div key={item.id} className="animate-reveal opacity-0" style={{ animationDelay: `${index * 40}ms` }}>
                            <GalleryThumbnail
                                item={item}
                                t={t as any}
                                onClick={() => setPreviewItem(item)}
                                onEdit={(e) => { e.stopPropagation(); handleEdit(item); }}
                                onDownload={(e) => { e.stopPropagation(); handleDownload(item); }}
                                onDelete={(e) => { e.stopPropagation(); handleDelete(item.id!); }}
                                onRemix={(e) => { e.stopPropagation(); handleRemix(item); }}
                            />
                        </div>
                    ))}
                </div>
            )}
            
            {previewItem && (
                <GalleryPreviewModal
                    item={previewItem}
                    onClose={() => setPreviewItem(null)}
                    onEdit={handleEdit}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    onRemix={handleRemix}
                    t={t as any}
                />
            )}
        </div>
    );
};

export default memo(GalleryView);
