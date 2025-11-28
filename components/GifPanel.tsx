
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
// @ts-ignore - gifshot has no types available in standard registry for direct esm import easily
import gifshot from 'gifshot';
import { HistoryItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { GifIcon, DownloadIcon, CheckCircleIcon } from './icons';
import Spinner from './Spinner';
import RangeSlider from './RangeSlider';

interface GifPanelProps {
    history: HistoryItem[];
    isLoading: boolean;
    t?: (key: string) => string; // Optional for compatibility if passed, but we use useLanguage
}

const GifPanel: React.FC<GifPanelProps> = ({ history, isLoading: isAppLoading }) => {
    const { t } = useLanguage();
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [selectedIndices, setSelectedIndices] = React.useState<Set<number>>(() => new Set(history.map((_, i) => i)));
    
    // Settings
    const [interval, setInterval] = React.useState(0.5); // seconds
    const [gifWidth, setGifWidth] = React.useState(300); // pixels
    const [reverse, setReverse] = React.useState(false);

    const generateGif = async () => {
        if (selectedIndices.size === 0) return;
        
        // Safety check for library availability
        if (!gifshot || typeof gifshot.createGIF !== 'function') {
            console.error("Gifshot library not loaded correctly.");
            alert("GIF creation library unavailable. Please refresh and try again.");
            return;
        }
        
        setIsGenerating(true);
        setPreviewUrl(null);

        try {
            // Filter and Prepare images from history
            const imageUrls = history
                .map((item, index) => ({ url: item.thumbnailUrl, index }))
                .filter(item => selectedIndices.has(item.index))
                .map(item => item.url);
            
            if (reverse) {
                imageUrls.reverse();
            }

            if (imageUrls.length === 0) {
                setIsGenerating(false);
                return;
            }

            // gifshot expects images array
            gifshot.createGIF({
                images: imageUrls,
                interval: interval,
                gifWidth: gifWidth,
                gifHeight: gifWidth, // Square by default but it adapts
                numFrames: imageUrls.length, // Use all selected frames
                frameDuration: 1, // Default, controlled by interval mainly
                sampleInterval: 10, // Quality tradeoff
                numWorkers: 2,
            }, (obj: any) => {
                if (!obj.error) {
                    setPreviewUrl(obj.image);
                } else {
                    console.error("GIF Generation Error:", obj.errorMsg);
                    alert("Failed to generate GIF. The images might be too large or incompatible.");
                }
                setIsGenerating(false);
            });
        } catch (e) {
            console.error("Unexpected error generating GIF:", e);
            setIsGenerating(false);
            alert("An unexpected error occurred while generating the GIF.");
        }
    };

    const handleDownload = () => {
        if (previewUrl) {
            const link = document.createElement('a');
            link.href = previewUrl;
            link.download = `animation-${Date.now()}.gif`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const toggleSelection = (index: number) => {
        const newSelection = new Set(selectedIndices);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        setSelectedIndices(newSelection);
    };

    const selectAll = () => {
        setSelectedIndices(new Set(history.map((_, i) => i)));
    };

    const deselectAll = () => {
        setSelectedIndices(new Set());
    };

    const isBusy = isAppLoading || isGenerating;

    return (
        <div className="w-full p-6 flex flex-col gap-6 animate-fade-in h-full overflow-hidden">
            <div className="text-center flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">GIF Creator</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 -mt-1">Turn your edit history into an animation.</p>
            </div>

            <div className="flex-grow flex flex-col gap-4 overflow-hidden">
                {/* Selection Grid */}
                <div className="flex justify-between items-center px-1 flex-shrink-0">
                    <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{selectedIndices.size} Frames Selected</span>
                    <div className="flex gap-2">
                        <button onClick={selectAll} className="text-xs text-theme-accent hover:underline" data-tooltip-id="app-tooltip" data-tooltip-content={t('selectAll')}>Select All</button>
                        <button onClick={deselectAll} className="text-xs text-gray-500 hover:underline" data-tooltip-id="app-tooltip" data-tooltip-content={t('deselectAll')}>Deselect All</button>
                    </div>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto custom-scrollbar p-1 max-h-48 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/10">
                    {history.map((item, index) => (
                        <button 
                            key={index} 
                            onClick={() => toggleSelection(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden transition-all border-2 ${selectedIndices.has(index) ? 'border-theme-accent ring-2 ring-theme-accent/30' : 'border-transparent opacity-60 grayscale'}`}
                        >
                            <img src={item.thumbnailUrl} alt={`Frame ${index}`} className="w-full h-full object-cover" />
                            {selectedIndices.has(index) && (
                                <div className="absolute top-1 right-1 bg-white rounded-full text-theme-accent">
                                    <CheckCircleIcon className="w-4 h-4" />
                                </div>
                            )}
                            <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded">{index + 1}</span>
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 flex flex-col gap-3 flex-shrink-0">
                    <RangeSlider 
                        label="Frame Delay (Seconds)" 
                        value={interval} 
                        min={0.1} 
                        max={2.0} 
                        step={0.1} 
                        onChange={setInterval} 
                        disabled={isBusy}
                        labelValue={`${interval}s`}
                    />

                    <RangeSlider 
                        label="Width (px)" 
                        value={gifWidth} 
                        min={100} 
                        max={800} 
                        step={50} 
                        onChange={setGifWidth} 
                        disabled={isBusy}
                        labelValue={`${gifWidth}px`}
                    />

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={reverse} 
                                onChange={(e) => setReverse(e.target.checked)} 
                                className="rounded border-gray-300 text-theme-accent focus:ring-theme-accent bg-gray-100 dark:bg-gray-700"
                                disabled={isBusy}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Reverse Order</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Action Area */}
            <div className="flex-shrink-0">
                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-white/5 rounded-xl">
                        <Spinner />
                        <p className="mt-2 text-sm text-gray-500">Rendering GIF...</p>
                    </div>
                ) : previewUrl ? (
                    <div className="flex flex-col gap-4 animate-fade-in">
                        <div className="rounded-lg overflow-hidden border-2 border-theme-accent shadow-lg bg-black/10">
                            <img src={previewUrl} alt="Generated GIF" className="max-w-full h-40 object-contain mx-auto" />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPreviewUrl(null)}
                                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-all text-sm"
                                data-tooltip-id="app-tooltip"
                                data-tooltip-content={t('backToEditor')}
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleDownload}
                                className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-theme-gradient text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm"
                                data-tooltip-id="app-tooltip"
                                data-tooltip-content={t('download')}
                            >
                                <DownloadIcon className="w-5 h-5" />
                                Download
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={generateGif}
                        disabled={isBusy || selectedIndices.size < 2}
                        className="w-full bg-theme-gradient text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:transform-none"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <GifIcon className="w-5 h-5" />
                            Create GIF
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
};

export default React.memo(GifPanel);
