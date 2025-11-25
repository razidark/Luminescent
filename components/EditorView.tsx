/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { useLanguage } from '../contexts/LanguageContext';
import { type HistoryItem, type Tab, type AddToHistoryOptions } from '../types';
import { useEditor } from '../contexts/EditorContext';
import DrawingCanvas, { type DrawingCanvasRef } from './DrawingCanvas';
import ZoomPanWrapper, { type ZoomPanRef } from './ZoomPanWrapper';
import CompareSlider from './CompareSlider';
import Spinner from './Spinner';
import EmptyStatePanel from './EmptyStatePanel';
import FilterPanel from './FilterPanel';
import AdjustmentPanel from './AdjustmentPanel';
import CropPanel from './CropPanel';
import ExpandPanel from './ExpandPanel';
import UpscalePanel from './UpscalePanel';
import ErasePanel from './MagicErasePanel';
import RetouchPanel from './RetouchPanel';
import BackgroundPanel from './BackgroundPanel';
import CardifyPanel from './CardifyPanel';
import RestorePanel from './RestorePanel';
import MemePanel from './MemePanel';
import TextPanel from './TextPanel';
import ProductPanel from './ProductSelector';
import AddProductPanel from './AddProductPanel';
import ColorPanel from './ColorPanel';
import StyleTransferPanel from './StyleTransferPanel';
import CaptionPanel from './CaptionPanel';
import VariationsPanel from './VariationsPanel';
import { UndoIcon, RedoIcon, EyeIcon, ZoomInIcon, ZoomOutIcon, FitToScreenIcon, SaveIcon, DownloadIcon, ResetIcon } from './icons';
import { useClickOutside } from '../hooks/useClickOutside';
import { dataURLtoFile } from '../utils/helpers';

interface EditorViewProps {
    history: HistoryItem[];
    historyIndex: number;
    activeTab: Tab | null;
    setActiveTab: (tab: Tab | null) => void;
    hasTransparentBackground: boolean;
    isPanelCollapsed: boolean;
    isSavingToCreations: boolean;
    handleUndo: () => void;
    handleRedo: () => void;
    handleReset: () => void;
    handleUploadNew: () => void;
    handleDownload: () => void;
    handleSaveToCreations: (file?: File) => Promise<boolean>;
    addImageToHistory: (newImageFile: File, options: AddToHistoryOptions) => void;
}

const EditorView: React.FC<EditorViewProps> = (props) => {
    const { t } = useLanguage();
    const { history, historyIndex, activeTab, setActiveTab, hasTransparentBackground, isPanelCollapsed, isSavingToCreations } = props;
    
    const {
        isLoading,
        loadingMessage,
        error,
        setError,
        prompt,
        setPrompt,
        isPickingColor,
        setIsPickingColor,
        setSourceColor,
        handleMagicErase,
        handleApplyRetouch,
        handleSelectiveAdjust,
        handleApplyFilter,
        handleApplyLuckyFilter,
        handleApplyAdjustment,
        handleApplyCrop,
        handleApplyExpand,
        handleApplyUpscale,
        handleApplyRestore,
        handleRemoveBackground,
        handleReplaceBackground,
        handleSetProductBackground,
        handleAddProductShadow,
        handleApplyAddProduct,
        handleApplyCardify,
        handleApplyText,
        handleGenerateVariations,
        handleGeneratePromptSuggestions,
        handleApplyHeal,
        handleDetectObjects,
    } = useEditor();

    const [isCompareViewActive, setIsCompareViewActive] = React.useState<boolean>(false);
    const [crop, setCrop] = React.useState<Crop>();
    const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>();
    const [aspect, setAspect] = React.useState<number | undefined>();
    const [brushSize, setBrushSize] = React.useState(40);
    const [maskImageUrl, setMaskImageUrl] = React.useState<string | null>(null);
    const [textToApply, setTextToApply] = React.useState<string | null>(null);
    const [isSaveMenuOpen, setIsSaveMenuOpen] = React.useState(false);
    const [variations, setVariations] = React.useState<string[] | null>(null);
    const [isSaveSuccess, setIsSaveSuccess] = React.useState(false);
    const [eyedropperPreview, setEyedropperPreview] = React.useState<{ x: number, y: number, color: string } | null>(null);
    
    const imgRef = React.useRef<HTMLImageElement>(null);
    const canvasRef = React.useRef<DrawingCanvasRef>(null);
    const zoomPanRef = React.useRef<ZoomPanRef>(null);
    const imageContainerRef = React.useRef<HTMLDivElement>(null);
    const saveButtonRef = React.useRef<HTMLDivElement>(null);

    useClickOutside(saveButtonRef, () => {
        if (isSaveMenuOpen) {
            setIsSaveMenuOpen(false);
        }
    });

    const currentImage = history[historyIndex]?.file;
    const originalImage = history[0]?.file;
    const [currentImageUrl, setCurrentImageUrl] = React.useState<string | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (currentImage) {
          const url = URL.createObjectURL(currentImage);
          setCurrentImageUrl(url);
          return () => URL.revokeObjectURL(url);
        } else {
          setCurrentImageUrl(null);
        }
    }, [currentImage]);

    React.useEffect(() => {
        if (originalImage) {
          const url = URL.createObjectURL(originalImage);
          setOriginalImageUrl(url);
          return () => URL.revokeObjectURL(url);
        } else {
          setOriginalImageUrl(null);
        }
    }, [originalImage]);
    
    React.useEffect(() => {
        setCrop(undefined);
        setCompletedCrop(undefined);
        canvasRef.current?.clear();
        setMaskImageUrl(null);
        setIsCompareViewActive(false);
        zoomPanRef.current?.reset();
        setVariations(null);
    }, [historyIndex]);
    
    React.useEffect(() => {
        if (activeTab !== 'text' && activeTab !== 'captions' && activeTab !== 'memeify') {
            setTextToApply(null);
        }
        if (activeTab !== 'color') {
            setIsPickingColor(false);
        }
    }, [activeTab, setIsPickingColor]);
    
    React.useEffect(() => {
      if(activeTab === 'crop' || activeTab === 'add-product') {
        setCrop(undefined);
        setCompletedCrop(undefined);
      }
    }, [activeTab]);

    React.useEffect(() => {
        // When the active tool changes, reset some local view states
        setIsCompareViewActive(false);
        zoomPanRef.current?.reset();
    }, [activeTab]);

    const canUndo = historyIndex > 0;
    const canRedo = history.length - 1 > historyIndex;
    const isZoomable = activeTab !== 'crop' && !isCompareViewActive && !!currentImage;

    const handleZoomToActual = () => {
        zoomPanRef.current?.zoomToActualSize();
    };

    const handleAcceptVariation = (imageDataUrl: string) => {
        const file = dataURLtoFile(imageDataUrl, 'variation.png');
        props.addImageToHistory(file, { actionKey: 'actionVariations', action: t('actionVariations') });
        setVariations(null);
    };

    const onSave = async () => {
        setIsSaveMenuOpen(false);
        const success = await props.handleSaveToCreations();
        if (success) {
            setIsSaveSuccess(true);
            setTimeout(() => setIsSaveSuccess(false), 2000);
        }
    };

    const getPixelColor = (e: React.MouseEvent<HTMLDivElement>): string | null => {
        if (!imgRef.current) return null;
    
        const img = imgRef.current;
        const rect = img.getBoundingClientRect();
        
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
            return null;
        }
    
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return null;
        
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
    
        const naturalX = Math.floor(x * (img.naturalWidth / rect.width));
        const naturalY = Math.floor(y * (img.naturalHeight / rect.height));
    
        const pixelData = ctx.getImageData(naturalX, naturalY, 1, 1).data;
        
        const componentToHex = (c: number) => {
            const hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        const rgbToHex = (r: number, g: number, b: number) => {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        };
    
        return rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
    };

    const handleColorPick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPickingColor) return;
        const hexColor = getPixelColor(e);
        if (hexColor) {
            setSourceColor(hexColor);
            setIsPickingColor(false);
            setEyedropperPreview(null);
        }
    };
    
    const handleMouseMoveForPicker = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPickingColor || !imgRef.current) return;
        const color = getPixelColor(e);
        if (color) {
            setEyedropperPreview({
                x: e.clientX,
                y: e.clientY,
                color: color,
            });
        }
    };

    const handleAutoSelect = async (label: string) => {
        const boxes = await handleDetectObjects(label);
        if (boxes && boxes.length > 0 && canvasRef.current) {
            canvasRef.current.drawRects(boxes);
        } else {
            // Optionally handle "no objects found" at the view level if desired
        }
    };

    const renderPanel = () => {
        if (variations) {
            return <VariationsPanel.Generated variations={variations} onAccept={handleAcceptVariation} onBack={() => setVariations(null)} originalImageUrl={currentImageUrl} />
        }
        switch(activeTab) {
            case 'erase': return <ErasePanel prompt={prompt} setPrompt={setPrompt} brushSize={brushSize} setBrushSize={setBrushSize} onGenerate={() => handleMagicErase(maskImageUrl!)} onClear={() => canvasRef.current?.clear()} isLoading={isLoading} onGenerateSuggestions={() => handleGeneratePromptSuggestions('replace')} onAutoSelect={handleAutoSelect} />;
            case 'retouch': return <RetouchPanel prompt={prompt} setPrompt={setPrompt} brushSize={brushSize} setBrushSize={setBrushSize} onApplyRetouch={() => handleApplyRetouch(maskImageUrl!)} onApplySelectiveAdjust={() => handleSelectiveAdjust(maskImageUrl!)} onApplyHeal={() => handleApplyHeal(maskImageUrl!)} onClear={() => canvasRef.current?.clear()} isLoading={isLoading} onAutoSelect={handleAutoSelect} />;
            case 'text': return <TextPanel onApplyText={handleApplyText} isLoading={isLoading} initialText={textToApply} />;
            case 'adjust': return <AdjustmentPanel onApplyAdjustment={handleApplyAdjustment} isLoading={isLoading} />;
            case 'color': return <ColorPanel isLoading={isLoading} />;
            case 'filters': return <FilterPanel onApplyFilter={handleApplyFilter} onApplyLuckyFilter={handleApplyLuckyFilter} isLoading={isLoading} />;
            case 'style-transfer': return <StyleTransferPanel isLoading={isLoading} />;
            case 'crop': return <CropPanel onApplyCrop={() => handleApplyCrop(completedCrop!, imgRef.current!)} onSetAspect={setAspect} isLoading={isLoading} isCropping={!!completedCrop} />;
            case 'expand': return <ExpandPanel onApplyExpand={handleApplyExpand} isLoading={isLoading} />;
            case 'variations': return <VariationsPanel.Generate isLoading={isLoading} onGenerate={async (creativity) => { const results = await handleGenerateVariations(creativity); if (results) { setVariations(results); } }} />;
            case 'upscale': return <UpscalePanel onApplyUpscale={handleApplyUpscale} isLoading={isLoading} />;
            case 'restore': return <RestorePanel onApplyRestore={handleApplyRestore} isLoading={isLoading} />;
            case 'background': return <BackgroundPanel onRemoveBackground={handleRemoveBackground} onReplaceBackground={handleReplaceBackground} isLoading={isLoading} hasTransparentBackground={hasTransparentBackground} />;
            case 'product': return <ProductPanel onIsolate={handleRemoveBackground} onSetBackground={handleSetProductBackground} onAddShadow={handleAddProductShadow} isLoading={isLoading} hasTransparentBackground={hasTransparentBackground} />;
            case 'add-product': return <AddProductPanel prompt={prompt} setPrompt={setPrompt} onGenerate={() => handleApplyAddProduct(maskImageUrl!)} isLoading={isLoading} hasMask={!!maskImageUrl} brushSize={brushSize} setBrushSize={setBrushSize} onClear={() => canvasRef.current?.clear()} onGenerateSuggestions={() => handleGeneratePromptSuggestions('add')} onAutoSelect={handleAutoSelect} />;
            case 'cardify': return <CardifyPanel onApplyCardify={handleApplyCardify} isLoading={isLoading} currentImage={currentImage} />;
            case 'memeify': return <MemePanel />;
            case 'captions': return <CaptionPanel onSelectSuggestion={(text) => { setTextToApply(text); setActiveTab('text'); }} isLoading={isLoading} />;
            default: return <EmptyStatePanel />;
        }
    };
    
    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full flex-grow h-[calc(100vh-140px)]">
            
            {/* Main content area (Image + bottom controls) */}
            <div className="flex-grow flex flex-col gap-4 min-w-0 animate-fade-in relative">
                <div 
                    ref={imageContainerRef}
                    className={`relative w-full rounded-3xl overflow-hidden checkerboard-bg flex justify-center items-center flex-grow min-h-0 luminescent-border ${isPickingColor ? 'cursor-crosshair' : ''}`}
                    onClick={handleColorPick}
                    onMouseMove={handleMouseMoveForPicker}
                    onMouseLeave={() => setEyedropperPreview(null)}
                >
                    {isCompareViewActive && originalImageUrl && currentImageUrl && historyIndex > 0 ? (
                        <CompareSlider originalImage={originalImageUrl} currentImage={currentImageUrl} />
                    ) : currentImageUrl ? (
                        <>
                            {activeTab === 'crop' ? (
                                <ReactCrop 
                                    crop={crop} 
                                    onChange={c => setCrop(c)} 
                                    onComplete={c => setCompletedCrop(c)}
                                    aspect={aspect}
                                    className="flex justify-center items-center"
                                >
                                    <img 
                                    ref={imgRef}
                                    key={`crop-${currentImageUrl}`}
                                    src={currentImageUrl} 
                                    alt="Crop this image"
                                    className="block max-w-full max-h-full object-contain"
                                    />
                                </ReactCrop>
                            ) : (
                                <ZoomPanWrapper ref={zoomPanRef} imageRef={imgRef} imageUrl={currentImageUrl}>
                                    <div className="relative">
                                        <img
                                        ref={imgRef}
                                        key={`view-${currentImageUrl}`}
                                        src={currentImageUrl}
                                        alt="Current"
                                        className="block max-w-full max-h-full object-contain pointer-events-none"
                                        />
                                        {['erase', 'retouch', 'add-product'].includes(activeTab || '') && imgRef.current && !isCompareViewActive && (
                                            <DrawingCanvas
                                                ref={canvasRef}
                                                imageElement={imgRef.current}
                                                brushSize={brushSize}
                                                brushColor="rgba(255, 0, 0, 0.5)"
                                                onDrawEnd={(dataUrl) => setMaskImageUrl(dataUrl)}
                                            />
                                        )}
                                    </div>
                                </ZoomPanWrapper>
                            )}
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/70 z-30 flex flex-col items-center justify-center gap-4 animate-fade-in backdrop-blur-sm">
                                    <Spinner />
                                    <p className="text-gray-300 font-medium">{loadingMessage}</p>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                {error && (
                    <div className="absolute top-4 left-4 right-4 z-50 bg-red-900/90 border border-red-500/50 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-md animate-fade-in flex items-center gap-3" role="alert">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1 text-sm">
                            <strong className="font-bold block">{t('anErrorOccurred')} </strong>
                            <span>{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}
                
                {/* Floating HUD Bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 w-full max-w-3xl px-4 pointer-events-none">
                    
                    {/* Center Controls */}
                    <div className="glass-panel p-2 flex items-center gap-1 pointer-events-auto mx-auto backdrop-blur-xl bg-white/70 dark:bg-black/70 border-white/20 dark:border-white/10 shadow-2xl">
                         <button onClick={props.handleUndo} disabled={!canUndo || isLoading} data-tooltip-id="app-tooltip" data-tooltip-content={t('undo')} className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            <UndoIcon className="w-5 h-5" />
                        </button>
                        <button onClick={props.handleRedo} disabled={!canRedo || isLoading} data-tooltip-id="app-tooltip" data-tooltip-content={t('redo')} className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            <RedoIcon className="w-5 h-5" />
                        </button>
                        
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

                        <button onClick={props.handleReset} disabled={historyIndex === 0 || isLoading} data-tooltip-id="app-tooltip" data-tooltip-content={t('resetAllChanges')} className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            <ResetIcon className="w-5 h-5" />
                        </button>

                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

                        <button
                            onClick={() => setIsCompareViewActive(prev => !prev)}
                            disabled={historyIndex <= 0 || isLoading} 
                            data-tooltip-id="app-tooltip"
                            data-tooltip-content={t('compareWithOriginal')} 
                            className={`p-2.5 rounded-lg transition-all duration-200 ${isCompareViewActive ? 'bg-theme-gradient text-white shadow-lg shadow-theme-accent/30 scale-110' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'} disabled:opacity-40 disabled:cursor-not-allowed`}>
                            <EyeIcon className="w-5 h-5" />
                        </button>

                        {isZoomable && (
                            <>
                                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
                                <button onClick={() => zoomPanRef.current?.zoomOut()} className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"><ZoomOutIcon className="w-4 h-4" /></button>
                                <button onClick={() => zoomPanRef.current?.reset()} className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"><FitToScreenIcon className="w-4 h-4" /></button>
                                <button onClick={() => zoomPanRef.current?.zoomIn()} className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"><ZoomInIcon className="w-4 h-4" /></button>
                            </>
                        )}
                    </div>

                     {/* Right Actions - Download */}
                     <div ref={saveButtonRef} className="glass-panel p-1 flex items-center pointer-events-auto ml-auto backdrop-blur-xl bg-white/70 dark:bg-black/70 border-white/20 dark:border-white/10 shadow-2xl">
                        <button onClick={() => props.handleDownload()} disabled={isLoading} data-tooltip-id="app-tooltip" data-tooltip-content={t('downloadImage')} className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-40">
                             <DownloadIcon className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
                        <button onClick={() => setIsSaveMenuOpen(!isSaveMenuOpen)} disabled={isLoading || isSavingToCreations} className={`p-2.5 rounded-lg transition-colors disabled:opacity-40 ${isSaveSuccess ? 'text-green-500 bg-green-100 dark:bg-green-900/30' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-theme-accent'}`}>
                            {isSavingToCreations ? <Spinner /> : <SaveIcon className="w-5 h-5" />}
                        </button>
                        {isSaveMenuOpen && (
                            <div className="absolute bottom-full right-0 mb-2 w-48 glass-panel p-1 z-50 animate-fade-in backdrop-blur-xl bg-white/90 dark:bg-black/90 border-white/20 dark:border-white/10">
                                <button
                                    onClick={onSave}
                                    disabled={isSavingToCreations || isSaveSuccess}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-left rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-60"
                                >
                                    {t('saveToCreations')}
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Tool panel area */}
            <aside className={`lg:flex-shrink-0 transition-all duration-500 ease-spring ${isPanelCollapsed ? 'lg:w-0 lg:opacity-0 lg:translate-x-10' : 'lg:w-[28rem] lg:opacity-100 lg:translate-x-0'}`}>
                <div className={`h-full w-full glass-panel overflow-hidden flex flex-col ${isPanelCollapsed ? 'hidden' : 'flex'} border-white/20 dark:border-white/10`}>
                    <div className="flex-grow overflow-y-auto custom-scrollbar pb-40">
                        {renderPanel()}
                    </div>
                </div>
            </aside>

            {isPickingColor && eyedropperPreview && (
                <div className="eyedropper-preview" style={{ left: eyedropperPreview.x + 15, top: eyedropperPreview.y + 15 }}>
                    <div className="eyedropper-color" style={{ backgroundColor: eyedropperPreview.color }} />
                    <span className="eyedropper-text">{eyedropperPreview.color.toUpperCase()}</span>
                </div>
            )}
        </div>
    );
};

export default React.memo(EditorView);