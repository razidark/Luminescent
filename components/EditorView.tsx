
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { useLanguage } from '../contexts/LanguageContext';
import { type HistoryItem, type Tab, type AddToHistoryOptions } from '../types';
import { CloseIcon, UndoIcon, RedoIcon, EyeIcon, FitToScreenIcon, CenterIcon, SaveIcon, DownloadIcon, ResetIcon, RotateLeftIcon, RotateRightIcon, FlipHorizontalIcon, FlipVerticalIcon, VideoIcon, CopyIcon, CheckCircleIcon, ZoomInIcon, ZoomOutIcon } from './icons';
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

    const sidebarRef = React.useRef<HTMLElement>(null);
    const eyedropperContainerRef = React.useRef<HTMLDivElement>(null);
    const eyedropperSwatchRef = React.useRef<HTMLDivElement>(null);

    // Update dynamic CSS variables via Refs to avoid inline style linting
    React.useEffect(() => {
        if (sidebarRef.current) {
            const widthValue = isPanelCollapsed ? '0px' : (window.innerWidth < 1024 ? '100%' : `${sidebarWidth}px`);
            sidebarRef.current.style.setProperty('--sidebar-width', widthValue);
        }
    }, [isPanelCollapsed, sidebarWidth]);

    React.useEffect(() => {
        if (eyedropperPreview) {
            if (eyedropperContainerRef.current) {
                eyedropperContainerRef.current.style.setProperty('--eye-x', `${eyedropperPreview.x}px`);
                eyedropperContainerRef.current.style.setProperty('--eye-y', `${eyedropperPreview.y}px`);
            }
            if (eyedropperSwatchRef.current) {
                eyedropperSwatchRef.current.style.setProperty('--eye-color', eyedropperPreview.color);
            }
        }
    }, [eyedropperPreview]);

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
        if (activeTab !== 'text' && activeTab !== 'captions') {
            setTextToApply(null);
        }
        if (activeTab !== 'color') {
            setIsPickingColor(false);
        }
    }, [activeTab, setIsPickingColor]);

    React.useEffect(() => {
        if (activeTab === 'crop' || activeTab === 'add-product') {
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
            return (
                <div key="variations" className="animate-fade-in w-full h-full flex flex-col">
                    <VariationsPanel.Generated variations={variations} onAccept={handleAcceptVariation} onBack={() => setVariations(null)} originalImageUrl={currentImageUrl} />
                </div>
            );
        }

        let content;
        switch (activeTab) {
            case 'erase': content = <ErasePanel prompt={prompt} setPrompt={setPrompt} brushSize={brushSize} setBrushSize={setBrushSize} onGenerate={() => handleMagicErase(maskImageUrl!)} onClear={() => canvasRef.current?.clear()} onUndo={() => canvasRef.current?.undo()} onRedo={() => canvasRef.current?.redo()} onInvert={() => canvasRef.current?.invert()} isLoading={isLoading} onGenerateSuggestions={() => handleGeneratePromptSuggestions('replace')} onAutoSelect={handleAutoSelect} onMagicMaskClick={handleMagicMaskRequest} tool={tool} setTool={setTool} />; break;
            case 'retouch': content = <RetouchPanel prompt={prompt} setPrompt={setPrompt} brushSize={brushSize} setBrushSize={setBrushSize} onApplyRetouch={() => handleApplyRetouch(maskImageUrl!)} onApplySelectiveAdjust={() => handleSelectiveAdjust(maskImageUrl!)} onApplyHeal={() => handleApplyHeal(maskImageUrl!)} onClear={() => canvasRef.current?.clear()} onUndo={() => canvasRef.current?.undo()} onRedo={() => canvasRef.current?.redo()} onInvert={() => canvasRef.current?.invert()} isLoading={isLoading} onAutoSelect={handleAutoSelect} onMagicMaskClick={handleMagicMaskRequest} tool={tool} setTool={setTool} />; break;
            case 'sketch': content = <SketchPanel prompt={prompt} setPrompt={setPrompt} brushSize={brushSize} setBrushSize={setBrushSize} color={sketchColor} setColor={setSketchColor} onGenerate={handleGenerateSketch} onClear={() => canvasRef.current?.clear()} onUndo={() => canvasRef.current?.undo()} onRedo={() => canvasRef.current?.redo()} isLoading={isLoading} tool={tool} setTool={setTool} />; break;
            case 'focus': content = <FocusPanel onApplyFocus={handleApplyFocus} isLoading={isLoading} />; break;
            case 'text': content = <TextPanel onApplyText={handleApplyText} isLoading={isLoading} initialText={textToApply} />; break;
            case 'adjust': content = <AdjustmentPanel onApplyAdjustment={handleApplyAdjustment} isLoading={isLoading} />; break;
            case 'color': content = <ColorPanel isLoading={isLoading} />; break;
            case 'filters': content = <FilterPanel onApplyFilter={handleApplyFilter} onApplyLuckyFilter={handleApplyLuckyFilter} isLoading={isLoading} />; break;
            case 'style-transfer': content = <StyleTransferPanel isLoading={isLoading} />; break;
            case 'crop': content = <CropPanel onApplyCrop={() => handleApplyCrop(completedCrop!, imgRef.current!)} onSetAspect={setAspect} isLoading={isLoading} isCropping={!!completedCrop} onAutoCrop={handleAutoCrop} />; break;
            case 'expand': content = <ExpandPanel onApplyExpand={handleApplyExpand} isLoading={isLoading} />; break;
            case 'variations': content = <VariationsPanel.Generate isLoading={isLoading} onGenerate={async (creativity) => { const results = await handleGenerateVariations(creativity); if (results) { setVariations(results); } }} />; break;
            case 'upscale': content = <UpscalePanel onApplyUpscale={handleApplyUpscale} isLoading={isLoading} />; break;
            case 'enhance': content = <EnhancePanel onApplyEnhance={handleApplyEnhance} isLoading={isLoading} />; break;
            case 'restore': content = <RestorePanel onApplyRestore={handleApplyRestore} isLoading={isLoading} />; break;
            case 'background': content = <BackgroundPanel onRemoveBackground={handleRemoveBackground} onReplaceBackground={handleReplaceBackground} isLoading={isLoading} hasTransparentBackground={hasTransparentBackground} />; break;
            case 'product': content = <ProductPanel onIsolate={handleRemoveBackground} onSetBackground={handleSetProductBackground} onAddShadow={handleAddProductShadow} isLoading={isLoading} hasTransparentBackground={hasTransparentBackground} />; break;
            case 'add-product': content = <AddProductPanel prompt={prompt} setPrompt={setPrompt} onGenerate={() => handleApplyAddProduct(maskImageUrl!)} isLoading={isLoading} hasMask={!!maskImageUrl} brushSize={brushSize} setBrushSize={setBrushSize} onClear={() => canvasRef.current?.clear()} onUndo={() => canvasRef.current?.undo()} onRedo={() => canvasRef.current?.redo()} onInvert={() => canvasRef.current?.invert()} onGenerateSuggestions={() => handleGeneratePromptSuggestions('add')} onAutoSelect={handleAutoSelect} onMagicMaskClick={handleMagicMaskRequest} tool={tool} setTool={setTool} />; break;
            case 'cardify': content = <CardifyPanel onApplyCardify={(prompt) => handleApplyCardify(prompt)} isLoading={isLoading} currentImage={currentImage} />; break;
            case 'captions': content = <CaptionPanel onSelectSuggestion={(text) => setTextToApply(text)} isLoading={isLoading} />; break;
            case 'gif': content = <GifPanel history={history} isLoading={isLoading} />; break;
            default: content = <EmptyStatePanel />; break;
        }

        return (
            <div key={activeTab || 'empty'} className="animate-fade-in w-full h-full flex flex-col">
                {content}
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row h-full w-full gap-0 relative rounded-3xl overflow-hidden border border-white/20 dark:border-white/10 shadow-2xl">
            {/* Main Canvas Area - Clean, full screen */}
            {/* Using a semi-transparent background to allow global theme (Matrix/Nebula) to show through slightly, but opaque enough for editing contrast */}
            <div ref={imageContainerRef} className="flex-grow relative bg-gray-50/50 dark:bg-black/20 overflow-hidden group backdrop-blur-sm">
                {/* Global Error Alert */}
                {error && (
                    <div className="absolute top-4 left-4 right-4 z-[60] animate-fade-in">
                            <div className="bg-red-50/90 dark:bg-red-950/90 backdrop-blur-md text-red-900 dark:text-red-100 p-5 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-600 dark:text-red-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-red-800 dark:text-red-300 mb-1 leading-none">
                                                {error.includes('IMAGE_OUTPUT_NOT_SUPPORTED') ? 'API Restriction Detected' : error.includes('429') || error.includes('quota') ? 'Quota Exceeded' : 'Operation Failed'}
                                            </h4>
                                            <p className="text-xs text-red-700/80 dark:text-red-400/80 leading-relaxed break-words">
                                                {error}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setError(null)}
                                            className="p-1 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-md transition-colors h-fit"
                                            title={t('closeErrorMessage')}
                                            aria-label={t('closeErrorMessage')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/普及" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-600 dark:text-red-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {(error.includes('IMAGE_OUTPUT_NOT_SUPPORTED') || error.includes('429') || error.includes('quota')) && (
                                        <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-red-200/50 dark:border-white/5">
                                            <p className="text-[11px] text-gray-800 dark:text-gray-200 font-bold mb-2 uppercase tracking-tight">How to fix this:</p>
                                            <ul className="text-[11px] text-gray-700 dark:text-gray-400 space-y-2 ml-1">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">•</span>
                                                    <span>Ensure <b>Imagen 3</b> is enabled in your AI Studio account.</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">•</span>
                                                    <span><b>PRO TIP:</b> Switch to <b>Gemini 3.1 Flash Image</b> for better multimodal support.</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">•</span>
                                                    <span><b>Billing:</b> Image generation models often require a <b>paid billing plan</b> (Pay-as-you-go) in AI Studio.</span>
                                                </li>
                                                <li className="flex items-start gap-2 opacity-60 italic">
                                                    <span className="text-red-500 mt-0.5">•</span>
                                                    <span>Basic filters and sliders still work locally without the API!</span>
                                                </li>
                                            </ul>
                                            
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button 
                                                    onClick={() => (window as any).openSettings?.()}
                                                    className="px-4 py-2 bg-theme-gradient text-white text-[11px] font-black rounded-lg shadow-lg shadow-theme-accent/20 hover:scale-105 transition-transform flex items-center gap-2"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    ABRIR CONFIGURAÇÕES IA
                                                </button>
                                                <a 
                                                    href="https://aistudio.google.com/app/apikey" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-[11px] font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors flex items-center gap-2"
                                                >
                                                    VISITAR AI STUDIO 
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                    </div>
                )}

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
                                className={`max-w-none block touch-none select-none ${(activeTab === 'filters' || activeTab === 'adjust') && historyIndex > 0 ? 'opacity-0' : 'opacity-100'} ${showCompare ? 'compare-mode-image' : ''}`}
                                draggable={false}
                            />

                            {/* Compare Slider Overlay */}
                            {(activeTab === 'filters' || activeTab === 'adjust') && currentImageUrl && originalImageUrl && historyIndex > 0 && (
                                <div className="absolute inset-0 w-full h-full">
                                    <CompareSlider
                                        originalImage={originalImageUrl}
                                        currentImage={currentImageUrl}
                                    />
                                </div>
                            )}

                            {/* True "Peek" / Compare Overlay for standard editing */}
                            {showCompare && !activeTab?.includes('filters') && !activeTab?.includes('adjust') && originalImageUrl && historyIndex > 0 && (
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

                            {/* AI Scanning Overlay */}
                            {isLoading && (
                                <div className="animate-scan" />
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
                        <button onClick={() => zoomPanRef.current?.zoomOut()} className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10" data-tooltip-id="app-tooltip" data-tooltip-content={t('zoomOut')} title={t('zoomOut')} aria-label={t('zoomOut')}>
                            <ZoomOutIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => zoomPanRef.current?.reset()} className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10" data-tooltip-id="app-tooltip" data-tooltip-content={t('fitToScreen')} title={t('fitToScreen')} aria-label={t('fitToScreen')}>
                            <FitToScreenIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => zoomPanRef.current?.zoomIn()} className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10" data-tooltip-id="app-tooltip" data-tooltip-content={t('zoomIn')} title={t('zoomIn')} aria-label={t('zoomIn')}>
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
                        disabled={historyIndex === 0}
                        className={`p-2 rounded-lg transition-all ${isCompareViewActive ? 'bg-theme-accent text-white' : 'text-white/80 hover:text-white hover:bg-white/10'} ${historyIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        data-tooltip-id="app-tooltip"
                        data-tooltip-content={t('compareWithOriginal')}
                        title={t('compareWithOriginal')}
                        aria-label={t('compareWithOriginal')}
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
                    className="w-4 flex-shrink-0 cursor-col-resize hover:bg-theme-accent/20 transition-colors flex items-center justify-center hidden lg:flex relative z-20 group border-l border-white/5 bg-gray-50/50 dark:bg-black/20"
                    onMouseDown={startResizing}
                >
                    {/* Visual Grip Indicator */}
                    <div className="w-1 h-8 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-theme-accent transition-colors shadow-sm" />
                </div>
            )}

            {/* Right Sidebar Panel */}
            <aside
                ref={sidebarRef}
                className={`flex-shrink-0 flex flex-col gap-0 transition-all duration-300 bg-white/40 dark:bg-black/40 backdrop-blur-xl border-l border-white/20 dark:border-white/10 ${isPanelCollapsed ? 'w-0 overflow-hidden opacity-0' : 'opacity-100 sidebar-resizable'}`}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Tool Header - Only show if activeTab is not null */}
                    {activeTab && (
                        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between bg-white/30 dark:bg-black/20 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-theme-gradient rounded-lg text-white shadow-lg shadow-theme-accent/20">
                                    {/* Icon placeholder or dynamic icon based on activeTab */}
                                    <div className="w-5 h-5 flex items-center justify-center">
                                         {/* We could map icons here too, but for now a simple glow is premium */}
                                         <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white leading-none">
                                        {(t as any)(`tool${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`)}
                                    </h2>

                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-tighter">AI Powered Studio</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveTab(null)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-all text-gray-500 dark:text-gray-400 hover:text-red-500 active:scale-90"
                                title={t('close')}
                                aria-label={t('close')}
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <div className="flex-grow overflow-y-auto custom-scrollbar relative p-4 group/sidebar">

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
                                title={t('undo')}
                                aria-label={t('undo')}
                            >
                                <UndoIcon className="w-5 h-5 text-gray-800 dark:text-white" />
                            </button>
                            <button
                                onClick={handleRedo}
                                disabled={!canRedo}
                                className="p-3 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 disabled:opacity-30 transition-all border border-gray-200/50 dark:border-white/5"
                                data-tooltip-id="app-tooltip"
                                data-tooltip-content={t('redo')}
                                title={t('redo')}
                                aria-label={t('redo')}
                            >
                                <RedoIcon className="w-5 h-5 text-gray-800 dark:text-white" />
                            </button>
                            <button
                                onClick={handleReset}
                                className="p-3 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-800 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-all border border-gray-200/50 dark:border-white/5"
                                data-tooltip-id="app-tooltip"
                                data-tooltip-content={t('reset')}
                                title={t('reset')}
                                aria-label={t('reset')}
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
                            ref={eyedropperContainerRef}
                            className="fixed pointer-events-none w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white z-[70] eyedropper-preview-container"
                        >
                            <div
                                ref={eyedropperSwatchRef}
                                className="w-full h-full eyedropper-color-swatch"
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
