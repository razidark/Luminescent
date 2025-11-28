
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
import GifPanel from './GifPanel';
import EnhancePanel from './EnhancePanel';
import SketchPanel from './SketchPanel';
import FocusPanel from './FocusPanel';
import { UndoIcon, RedoIcon, EyeIcon, FitToScreenIcon, CenterIcon, SaveIcon, DownloadIcon, ResetIcon, RotateLeftIcon, RotateRightIcon, FlipHorizontalIcon, FlipVerticalIcon, VideoIcon, CopyIcon, CheckCircleIcon, ZoomInIcon, ZoomOutIcon } from './icons';
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
    const { 
        history, 
        historyIndex, 
        activeTab, 
        setActiveTab, 
        hasTransparentBackground, 
        isPanelCollapsed, 
        isSavingToCreations,
        handleUndo,
        handleRedo,
        handleReset,
        handleDownload
    } = props;
    
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
        handleApplyEnhance,
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
        handleApplySketch,
        handleApplyFocus,
        handleMagicMask,
    } = useEditor();

    const [isCompareViewActive, setIsCompareViewActive] = React.useState<boolean>(false);
    const [isPeeking, setIsPeeking] = React.useState<boolean>(false);
    const [crop, setCrop] = React.useState<Crop>();
    const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>();
    const [aspect, setAspect] = React.useState<number | undefined>();
    const [brushSize, setBrushSize] = React.useState(40);
    const [maskImageUrl, setMaskImageUrl] = React.useState<string | null>(null);
    const [textToApply, setTextToApply] = React.useState<string | null>(null);
    const [isSaveMenuOpen, setIsSaveMenuOpen] = React.useState(false);
    const [variations, setVariations] = React.useState<string[] | null>(null);
    const [isSaveSuccess, setIsSaveSuccess] = React.useState(false);
    const [isCopySuccess, setIsCopySuccess] = React.useState(false);
    const [eyedropperPreview, setEyedropperPreview] = React.useState<{ x: number, y: number, color: string } | null>(null);
    const [tool, setTool] = React.useState<'brush' | 'eraser'>('brush');
    const [sketchColor, setSketchColor] = React.useState('#000000');
    
    // Resizable Sidebar State
    const [sidebarWidth, setSidebarWidth] = React.useState(384); // Default to 384px (w-96)
    
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
        setTool('brush');
        setSketchColor('#000000');
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
        setIsCompareViewActive(false);
        zoomPanRef.current?.reset();
        setTool('brush');
        setSketchColor('#000000');
    }, [activeTab]);

    // Keyboard listeners for "Peek Original" and Brush Shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;

            if (e.key === '\\' && !isPeeking) setIsPeeking(true);
            
            if (['erase', 'retouch', 'add-product', 'sketch'].includes(activeTab || '')) {
                if (e.key === '[') {
                    setBrushSize(prev => Math.max(10, prev - 5));
                } else if (e.key === ']') {
                    setBrushSize(prev => Math.min(100, prev + 5));
                }
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === '\\') setIsPeeking(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isPeeking, activeTab]);

    const canUndo = historyIndex > 0;
    const canRedo = history.length - 1 > historyIndex;
    const isZoomable = activeTab !== 'crop' && !isCompareViewActive && !!currentImage;

    // Use either the toggle state OR the peek state (holding backslash)
    const showCompare = isCompareViewActive || isPeeking;

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

    const handleAnimateClick = () => {
        if (currentImage) {
            setActiveTab('video');
        }
    };

    const handleCopyToClipboard = async () => {
        if (currentImage) {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [currentImage.type]: currentImage
                    })
                ]);
                setIsCopySuccess(true);
                setTimeout(() => setIsCopySuccess(false), 2000);
            } catch (err) {
                console.error('Failed to copy image: ', err);
                setError('Failed to copy to clipboard');
            }
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
        }
    };

    const handleMagicMaskRequest = async (label: string) => {
        const maskUrl = await handleMagicMask(label);
        if (maskUrl && canvasRef.current) {
            canvasRef.current.drawMaskImage(maskUrl);
        }
    };

    React.useEffect(() => {
        const handler = (e: any) => {
            if (e.detail) handleMagicMaskRequest(e.detail);
        };
        window.addEventListener('magic-mask-request', handler);
        return () => window.removeEventListener('magic-mask-request', handler);
    }, [handleMagicMask]);

    const handleAutoCrop = (box: { ymin: number, xmin: number, ymax: number, xmax: number }) => {
        if (!imgRef.current) return;
        const img = imgRef.current;
        const crop: Crop = {
            unit: '%',
            x: (box.xmin / 1000) * 100,
            y: (box.ymin / 1000) * 100,
            width: ((box.xmax - box.xmin) / 1000) * 100,
            height: ((box.ymax - box.ymin) / 1000) * 100,
        };
        setCrop(crop);
        const pixelCrop: PixelCrop = {
            unit: 'px',
            x: (box.xmin / 1000) * img.width,
            y: (box.ymin / 1000) * img.height,
            width: ((box.xmax - box.xmin) / 1000) * img.width,
            height: ((box.ymax - box.ymin) / 1000) * img.height,
        };
        setCompletedCrop(pixelCrop);
    };

    const handleGenerateSketch = async () => {
        if (canvasRef.current) {
            const sketchDataUrl = canvasRef.current.exportCanvas('image');
            if (sketchDataUrl) {
                handleApplySketch(sketchDataUrl, prompt);
            }
        }
    };

    const startResizing = (mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault(); // Prevent text selection
        const startX = mouseDownEvent.clientX;
        const startWidth = sidebarWidth;

        const doDrag = (mouseMoveEvent: MouseEvent) => {
            // Dragging left (smaller clientX) increases width because sidebar is on right
            const newWidth = startWidth + (startX - mouseMoveEvent.clientX);
            // Limit constraints: min 280px, max 800px
            if (newWidth > 280 && newWidth < 800) {
                setSidebarWidth(newWidth);
            }
        };

        const stopDrag = () => {
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
            document.body.style.cursor = ''; // Reset cursor
        };

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
        document.body.style.cursor = 'col-resize';
    };

    const renderPanel = () => {
        if (variations) {
            return <VariationsPanel.Generated variations={variations} onAccept={handleAcceptVariation} onBack={() => setVariations(null)} originalImageUrl={currentImageUrl} />
        }
        switch(activeTab) {
            case 'erase': return <ErasePanel prompt={prompt} setPrompt={setPrompt} brushSize={brushSize} setBrushSize={setBrushSize} onGenerate={() => handleMagicErase(maskImageUrl!)} onClear={() => canvasRef.current?.clear()} onUndo={() => canvasRef.current?.undo()} onRedo={() => canvasRef.current?.redo()} onInvert={() => canvasRef.current?.invert()} isLoading={isLoading} onGenerateSuggestions={() => handleGeneratePromptSuggestions('replace')} onAutoSelect={handleAutoSelect} onMagicMaskClick={handleMagicMaskRequest} tool={tool} setTool={setTool} />;
            case 'retouch': return <RetouchPanel prompt={prompt} setPrompt={setPrompt} brushSize={brushSize} setBrushSize={setBrushSize} onApplyRetouch={() => handleApplyRetouch(maskImageUrl!)} onApplySelectiveAdjust={() => handleSelectiveAdjust(maskImageUrl!)} onApplyHeal={() => handleApplyHeal(maskImageUrl!)} onClear={() => canvasRef.current?.clear()} onUndo={() => canvasRef.current?.undo()} onRedo={() => canvasRef.current?.redo()} onInvert={() => canvasRef.current?.invert()} isLoading={isLoading} onAutoSelect={handleAutoSelect} onMagicMaskClick={handleMagicMaskRequest} tool={tool} setTool={setTool} />;
            case 'sketch': return <SketchPanel prompt={prompt} setPrompt={setPrompt} brushSize={brushSize} setBrushSize={setBrushSize} color={sketchColor} setColor={setSketchColor} onGenerate={handleGenerateSketch} onClear={() => canvasRef.current?.clear()} onUndo={() => canvasRef.current?.undo()} onRedo={() => canvasRef.current?.redo()} isLoading={isLoading} tool={tool} setTool={setTool} />;
            case 'focus': return <FocusPanel onApplyFocus={handleApplyFocus} isLoading={isLoading} />;
            case 'text': return <TextPanel onApplyText={handleApplyText} isLoading={isLoading} initialText={textToApply} />;
            case 'adjust': return <AdjustmentPanel onApplyAdjustment={handleApplyAdjustment} isLoading={isLoading} />;
            case 'color': return <ColorPanel isLoading={isLoading} />;
            case 'filters': return <FilterPanel onApplyFilter={handleApplyFilter} onApplyLuckyFilter={handleApplyLuckyFilter} isLoading={isLoading} />;
            case 'style-transfer': return <StyleTransferPanel isLoading={isLoading} />;
            case 'crop': return <CropPanel onApplyCrop={() => handleApplyCrop(completedCrop!, imgRef.current!)} onSetAspect={setAspect} isLoading={isLoading} isCropping={!!completedCrop} onAutoCrop={handleAutoCrop} />; 
            case 'expand': return <ExpandPanel onApplyExpand={handleApplyExpand} isLoading={isLoading} />;
            case 'variations': return <VariationsPanel.Generate isLoading={isLoading} onGenerate={async (creativity) => { const results = await handleGenerateVariations(creativity); if (results) { setVariations(results); } }} />;
            case 'upscale': return <UpscalePanel onApplyUpscale={handleApplyUpscale} isLoading={isLoading} />;
            case 'enhance': return <EnhancePanel onApplyEnhance={handleApplyEnhance} isLoading={isLoading} />;
            case 'restore': return <RestorePanel onApplyRestore={handleApplyRestore} isLoading={isLoading} />;
            case 'background': return <BackgroundPanel onRemoveBackground={handleRemoveBackground} onReplaceBackground={handleReplaceBackground} isLoading={isLoading} hasTransparentBackground={hasTransparentBackground} />;
            case 'product': return <ProductPanel onIsolate={handleRemoveBackground} onSetBackground={handleSetProductBackground} onAddShadow={handleAddProductShadow} isLoading={isLoading} hasTransparentBackground={hasTransparentBackground} />;
            case 'add-product': return <AddProductPanel prompt={prompt} setPrompt={setPrompt} onGenerate={() => handleApplyAddProduct(maskImageUrl!)} isLoading={isLoading} hasMask={!!maskImageUrl} brushSize={brushSize} setBrushSize={setBrushSize} onClear={() => canvasRef.current?.clear()} onUndo={() => canvasRef.current?.undo()} onRedo={() => canvasRef.current?.redo()} onInvert={() => canvasRef.current?.invert()} onGenerateSuggestions={() => handleGeneratePromptSuggestions('add')} onAutoSelect={handleAutoSelect} onMagicMaskClick={handleMagicMaskRequest} tool={tool} setTool={setTool} />;
            case 'cardify': return <CardifyPanel onApplyCardify={(prompt) => handleApplyCardify(prompt)} isLoading={isLoading} currentImage={currentImage} />;
            case 'memeify': return <MemePanel />;
            case 'captions': return <CaptionPanel onSelectSuggestion={(text) => setTextToApply(text)} isLoading={isLoading} />;
            case 'gif': return <GifPanel history={history} isLoading={isLoading} />;
            default: return <EmptyStatePanel />;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full w-full gap-0 relative rounded-3xl overflow-hidden border border-white/20 dark:border-white/10 shadow-2xl">
            {/* Main Canvas Area - Clean, full screen */}
            {/* Using a semi-transparent background to allow global theme (Matrix/Nebula) to show through slightly, but opaque enough for editing contrast */}
            <div ref={imageContainerRef} className="flex-grow relative bg-gray-50/50 dark:bg-black/20 overflow-hidden checkerboard-bg group backdrop-blur-sm">
                {currentImageUrl ? (
                    <ZoomPanWrapper
                        ref={zoomPanRef}
                        imageRef={imgRef}
                        imageUrl={currentImageUrl}
                        minScale={0.1}
                        maxScale={8}
                    >
                        <div className="relative shadow-2xl">
                            <img
                                ref={imgRef}
                                src={currentImageUrl}
                                alt="Editing"
                                className={`max-w-none block touch-none select-none ${activeTab === 'filters' || activeTab === 'adjust' ? 'opacity-0' : 'opacity-100'}`}
                                draggable={false}
                                style={{
                                    filter: showCompare ? 'grayscale(100%) blur(2px)' : 'none',
                                    transition: 'filter 0.2s ease'
                                }}
                            />
                            
                            {/* Compare Slider Overlay */}
                            {(activeTab === 'filters' || activeTab === 'adjust') && currentImageUrl && originalImageUrl && (
                                <div className="absolute inset-0 w-full h-full">
                                    <CompareSlider 
                                        originalImage={originalImageUrl} 
                                        currentImage={currentImageUrl} 
                                    />
                                </div>
                            )}

                            {/* True "Peek" / Compare Overlay for standard editing */}
                            {showCompare && !activeTab?.includes('filters') && !activeTab?.includes('adjust') && originalImageUrl && (
                                 <div className="absolute inset-0 z-50 pointer-events-none">
                                    <img 
                                        src={originalImageUrl} 
                                        alt="Original" 
                                        className="w-full h-full object-contain" 
                                    />
                                </div>
                            )}

                            {/* Drawing Canvas Layer */}
                            {/* Hide drawing canvas when peeking/comparing so we see the original cleanly */}
                            {!showCompare && (activeTab === 'erase' || activeTab === 'retouch' || activeTab === 'add-product' || activeTab === 'sketch') && imgRef.current && (
                                <div className="absolute inset-0 z-10">
                                    <DrawingCanvas
                                        ref={canvasRef}
                                        imageElement={imgRef.current}
                                        brushSize={brushSize}
                                        brushColor={activeTab === 'sketch' ? sketchColor : 'rgba(255, 0, 0, 0.5)'}
                                        tool={tool}
                                        onDrawEnd={setMaskImageUrl}
                                    />
                                </div>
                            )}
                            
                            {/* Crop Tool Layer */}
                            {activeTab === 'crop' && crop && !showCompare && (
                                <div className="absolute inset-0 z-20">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        aspect={aspect}
                                        className="h-full"
                                    >
                                        <div className="w-full h-full" /> 
                                    </ReactCrop>
                                </div>
                            )}
                        </div>
                    </ZoomPanWrapper>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {t('errorNoImageToEdit')}
                    </div>
                )}

                {/* Consolidated Bottom HUD Control Bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 z-30 shadow-xl transition-all duration-300 hover:bg-black/70">
                    
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1">
                        <button onClick={() => zoomPanRef.current?.zoomOut()} className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10" data-tooltip-id="app-tooltip" data-tooltip-content={t('zoomOut')}>
                            <ZoomOutIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => zoomPanRef.current?.reset()} className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10" data-tooltip-id="app-tooltip" data-tooltip-content={t('fitToScreen')}>
                            <FitToScreenIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => zoomPanRef.current?.zoomIn()} className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10" data-tooltip-id="app-tooltip" data-tooltip-content={t('zoomIn')}>
                            <ZoomInIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-white/20"></div>

                    {/* Transform Controls */}
                    <div className="flex items-center gap-1">
                        <button onClick={() => zoomPanRef.current?.rotateLeft()} className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10" title="Rotate Left">
                            <RotateLeftIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => zoomPanRef.current?.flipHorizontal()} className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10" title="Flip Horizontal">
                            <FlipHorizontalIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-white/20"></div>

                    {/* Compare Button */}
                    <button
                        onClick={() => setIsCompareViewActive(!isCompareViewActive)}
                        className={`p-2 rounded-lg transition-all ${isCompareViewActive ? 'bg-theme-accent text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                        data-tooltip-id="app-tooltip"
                        data-tooltip-content={t('compareWithOriginal')}
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                </div>

                {isLoading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 animate-fade-in">
                        <Spinner />
                        <p className="text-white font-bold text-lg animate-pulse">{loadingMessage}</p>
                    </div>
                )}
            </div>

            {/* Resize Handle (Desktop Only) */}
            {!isPanelCollapsed && (
                <div 
                    className="w-4 flex-shrink-0 cursor-col-resize hover:bg-theme-accent/20 transition-colors flex items-center justify-center hidden lg:flex relative z-20 group border-l border-white/5"
                    onMouseDown={startResizing}
                >
                    <div className="w-1 h-8 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-theme-accent transition-colors shadow-sm" />
                </div>
            )}

            {/* Right Sidebar Panel */}
            <aside 
                className={`flex-shrink-0 flex flex-col gap-4 transition-all duration-300 bg-white/40 dark:bg-black/40 backdrop-blur-xl border-l border-white/20 dark:border-white/10 ${isPanelCollapsed ? 'w-0 overflow-hidden opacity-0' : 'opacity-100'}`}
                style={{ width: isPanelCollapsed ? 0 : (window.innerWidth < 1024 ? '100%' : `${sidebarWidth}px`) }}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-grow overflow-y-auto custom-scrollbar relative p-4">
                       {renderPanel()}
                    </div>
                    
                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 backdrop-blur-md flex items-center justify-between gap-2">
                        <div className="flex gap-2">
                            <button 
                                onClick={handleUndo} 
                                disabled={!canUndo} 
                                className="p-3 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 disabled:opacity-30 transition-all border border-gray-200/50 dark:border-white/5"
                                data-tooltip-id="app-tooltip"
                                data-tooltip-content={t('undo')}
                            >
                                <UndoIcon className="w-5 h-5 text-gray-800 dark:text-white" />
                            </button>
                            <button 
                                onClick={handleRedo} 
                                disabled={!canRedo} 
                                className="p-3 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 disabled:opacity-30 transition-all border border-gray-200/50 dark:border-white/5"
                                data-tooltip-id="app-tooltip"
                                data-tooltip-content={t('redo')}
                            >
                                <RedoIcon className="w-5 h-5 text-gray-800 dark:text-white" />
                            </button>
                             <button 
                                onClick={handleReset} 
                                className="p-3 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-800 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-all border border-gray-200/50 dark:border-white/5"
                                data-tooltip-id="app-tooltip"
                                data-tooltip-content={t('reset')}
                            >
                                <ResetIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex gap-2 relative" ref={saveButtonRef}>
                             <button
                                onClick={() => setIsSaveMenuOpen(!isSaveMenuOpen)}
                                className={`flex items-center gap-2 px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg ${isSaveSuccess ? 'bg-green-500 dark:bg-green-500 text-white dark:text-white' : ''}`}
                            >
                                {isSaveSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <SaveIcon className="w-5 h-5" />}
                                <span>{isSaveSuccess ? t('gallerySaved') : t('gallerySave')}</span>
                            </button>
                            
                            {isSaveMenuOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
                                    <button onClick={onSave} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm font-medium">
                                        <SaveIcon className="w-4 h-4" /> {t('saveToCreations')}
                                    </button>
                                    <button onClick={() => { handleDownload(); setIsSaveMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm font-medium">
                                        <DownloadIcon className="w-4 h-4" /> {t('downloadImage')}
                                    </button>
                                    <button onClick={() => { handleCopyToClipboard(); setIsSaveMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm font-medium">
                                        <CopyIcon className="w-4 h-4" /> {t('copyToClipboard')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
            
            {isCopySuccess && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold animate-fade-in z-50 flex items-center gap-2 backdrop-blur-md">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    {t('copied')}
                </div>
            )}
            
            {activeTab === 'color' && isPickingColor && (
                <div 
                    className="fixed inset-0 z-[60] cursor-none" 
                    onClick={handleColorPick}
                    onMouseMove={handleMouseMoveForPicker}
                >
                    {eyedropperPreview && (
                        <div 
                            className="fixed pointer-events-none w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white z-[70]"
                            style={{ 
                                left: eyedropperPreview.x, 
                                top: eyedropperPreview.y, 
                                transform: 'translate(-50%, -50%)' 
                            }}
                        >
                            <div 
                                className="w-full h-full"
                                style={{ backgroundColor: eyedropperPreview.color }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-1 h-1 bg-black/50 rounded-full" />
                            </div>
                            <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-mono font-bold bg-black/50 text-white py-0.5">
                                {eyedropperPreview.color}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(EditorView);
