
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import ReactCrop, { type Crop, type PixelCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
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
import MergePanel from './MergePanel';
import ImageInspectorModal from './ImageInspectorModal';
import { UndoIcon, RedoIcon, EyeIcon, FitToScreenIcon, SaveIcon, DownloadIcon, ResetIcon, ZoomInIcon, ZoomOutIcon, HandIcon, CheckCircleIcon, InfoIcon, ShareIcon } from './icons';
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
    handleDownload: (file?: File) => void;
    handleSaveToCreations: (file?: File) => Promise<boolean>;
    addImageToHistory: (file: File, options: AddToHistoryOptions) => void;
}

const EditorView: React.FC<EditorViewProps> = ({
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
    handleUploadNew,
    handleDownload,
    handleSaveToCreations,
    addImageToHistory
}) => {
    const { t } = useLanguage();
    const editor = useEditor();
    
    const [brushSize, setBrushSize] = React.useState(30);
    const [brushColor, setBrushColor] = React.useState('rgba(255, 0, 0, 0.5)');
    const [drawTool, setDrawTool] = React.useState<'brush' | 'eraser'>('brush');
    const [sketchColor, setSketchColor] = React.useState('#000000');
    const [crop, setCrop] = React.useState<Crop>();
    const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>();
    const [cropAspect, setCropAspect] = React.useState<number | undefined>(undefined);
    const [isCompareVisible, setIsCompareVisible] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isSaved, setIsSaved] = React.useState(false);
    const [isPanMode, setIsPanMode] = React.useState(false);
    const [isInspectorOpen, setIsInspectorOpen] = React.useState(false);
    
    const zoomPanRef = React.useRef<ZoomPanRef>(null);
    const drawingCanvasRef = React.useRef<DrawingCanvasRef>(null);
    const imageRef = React.useRef<HTMLImageElement>(null);

    const currentItem = history[historyIndex];
    const currentImageUrl = currentItem?.thumbnailUrl;
    const originalImageUrl = history[0]?.thumbnailUrl;

    React.useEffect(() => {
        drawingCanvasRef.current?.clear();
    }, [historyIndex]);

    React.useEffect(() => {
        drawingCanvasRef.current?.clear();
        setCrop(undefined);
        setCompletedCrop(undefined);
        setDrawTool('brush');
        setIsPanMode(false);
        
        if (activeTab === 'sketch') {
            setBrushColor(sketchColor);
            setBrushSize(5);
        } else {
            setBrushColor('rgba(255, 0, 0, 0.5)');
            setBrushSize(30);
        }
    }, [activeTab, sketchColor]);

    React.useEffect(() => {
        if (activeTab === 'sketch') {
            setBrushColor(sketchColor);
        }
    }, [sketchColor, activeTab]);

    const getMask = () => drawingCanvasRef.current?.exportCanvas('mask') || null;
    const getDrawing = () => drawingCanvasRef.current?.exportCanvas('image') || null;

    const onSaveToCreations = async () => {
        if (isSaving || !currentItem?.file) return;
        setIsSaving(true);
        const success = await handleSaveToCreations(currentItem.file);
        setIsSaving(false);
        if (success) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }
    };

    const handleShare = async () => {
        if (!currentItem?.file) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    files: [currentItem.file],
                    title: 'Luminescent Creation',
                    text: 'Check out my creation from Luminescent!'
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            alert('Web Share API not supported on this device.');
        }
    };

    const renderPanel = () => {
        switch (activeTab) {
            case 'erase':
                return <ErasePanel 
                    prompt={editor.prompt} 
                    setPrompt={editor.setPrompt}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    tool={drawTool}
                    setTool={setDrawTool}
                    onGenerate={() => {
                        const mask = getMask();
                        if (mask) editor.handleMagicErase(mask);
                    }}
                    onClear={() => drawingCanvasRef.current?.clear()}
                    onUndo={() => drawingCanvasRef.current?.undo()}
                    onRedo={() => drawingCanvasRef.current?.redo()}
                    onInvert={() => drawingCanvasRef.current?.invert()}
                    isLoading={editor.isLoading}
                    onGenerateSuggestions={() => editor.handleGeneratePromptSuggestions('replace')}
                    onAutoSelect={(label) => editor.handleDetectObjects(label).then(boxes => drawingCanvasRef.current?.drawRects(boxes))}
                    onMagicMaskClick={(label) => editor.handleMagicMask(label).then(mask => mask && drawingCanvasRef.current?.drawMaskImage(mask))}
                />;
            case 'retouch':
                return <RetouchPanel
                    prompt={editor.prompt} 
                    setPrompt={editor.setPrompt}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    tool={drawTool}
                    setTool={setDrawTool}
                    onApplyRetouch={() => {
                        const mask = getMask();
                        if (mask) editor.handleApplyRetouch(mask);
                    }}
                    onApplyHeal={() => {
                        const mask = getMask();
                        if (mask) editor.handleApplyHeal(mask);
                    }}
                    onApplySelectiveAdjust={() => {
                        const mask = getMask();
                        if (mask) editor.handleSelectiveAdjust(mask);
                    }}
                    onClear={() => drawingCanvasRef.current?.clear()}
                    onUndo={() => drawingCanvasRef.current?.undo()}
                    onRedo={() => drawingCanvasRef.current?.redo()}
                    onInvert={() => drawingCanvasRef.current?.invert()}
                    isLoading={editor.isLoading}
                    onAutoSelect={(label) => editor.handleDetectObjects(label).then(boxes => drawingCanvasRef.current?.drawRects(boxes))}
                    onMagicMaskClick={(label) => editor.handleMagicMask(label).then(mask => mask && drawingCanvasRef.current?.drawMaskImage(mask))}
                />;
            case 'add-product':
                return <AddProductPanel
                    prompt={editor.prompt}
                    setPrompt={editor.setPrompt}
                    onGenerate={() => {
                        const mask = getMask();
                        if (mask) editor.handleApplyAddProduct(mask);
                    }}
                    isLoading={editor.isLoading}
                    hasMask={true}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    onClear={() => drawingCanvasRef.current?.clear()}
                    onUndo={() => drawingCanvasRef.current?.undo()}
                    onRedo={() => drawingCanvasRef.current?.redo()}
                    onInvert={() => drawingCanvasRef.current?.invert()}
                    onGenerateSuggestions={() => editor.handleGeneratePromptSuggestions('add')}
                    onAutoSelect={(label) => editor.handleDetectObjects(label).then(boxes => drawingCanvasRef.current?.drawRects(boxes))}
                    onMagicMaskClick={(label) => editor.handleMagicMask(label).then(mask => mask && drawingCanvasRef.current?.drawMaskImage(mask))}
                    tool={drawTool}
                    setTool={setDrawTool}
                />;
            case 'crop':
                return <CropPanel
                    onApplyCrop={() => {
                        if (completedCrop && imageRef.current) {
                            editor.handleApplyCrop(completedCrop, imageRef.current);
                        }
                    }}
                    onSetAspect={(aspect) => {
                        setCropAspect(aspect);
                        if (aspect && imageRef.current) {
                            const { width, height } = imageRef.current;
                            const newCrop = makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height);
                            setCrop(newCrop);
                            setCompletedCrop(convertToPixelCrop(newCrop, width, height));
                        } else {
                            setCrop(undefined);
                            setCompletedCrop(undefined);
                        }
                    }}
                    isLoading={editor.isLoading}
                    isCropping={!!completedCrop}
                    onAutoCrop={(box) => {
                        if (!imageRef.current) return;
                        const { width, height } = imageRef.current;
                        const c: Crop = {
                            unit: 'px',
                            x: (box.xmin / 1000) * width,
                            y: (box.ymin / 1000) * height,
                            width: ((box.xmax - box.xmin) / 1000) * width,
                            height: ((box.ymax - box.ymin) / 1000) * height,
                        };
                        setCrop(c);
                        setCompletedCrop(c as PixelCrop);
                    }}
                />;
            case 'expand':
                return <ExpandPanel onApplyExpand={editor.handleApplyExpand} isLoading={editor.isLoading} />;
            case 'upscale':
                return <UpscalePanel onApplyUpscale={editor.handleApplyUpscale} isLoading={editor.isLoading} />;
            case 'enhance':
                return <EnhancePanel onApplyEnhance={editor.handleApplyEnhance} isLoading={editor.isLoading} />;
            case 'restore':
                return <RestorePanel onApplyRestore={editor.handleApplyRestore} isLoading={editor.isLoading} />;
            case 'background':
                return <BackgroundPanel 
                    onRemoveBackground={editor.handleRemoveBackground} 
                    onReplaceBackground={editor.handleReplaceBackground} 
                    isLoading={editor.isLoading} 
                    hasTransparentBackground={hasTransparentBackground} 
                />;
            case 'product':
                return <ProductPanel 
                    onIsolate={editor.handleRemoveBackground} 
                    onSetBackground={editor.handleSetProductBackground} 
                    onAddShadow={editor.handleAddProductShadow} 
                    isLoading={editor.isLoading} 
                    hasTransparentBackground={hasTransparentBackground} 
                />;
            case 'cardify':
                return <CardifyPanel onApplyCardify={editor.handleApplyCardify} isLoading={editor.isLoading} currentImage={currentItem?.file} />;
            case 'memeify':
                return <MemePanel />;
            case 'text':
                return <TextPanel onApplyText={editor.handleApplyText} isLoading={editor.isLoading} />;
            case 'adjust':
                return <AdjustmentPanel onApplyAdjustment={editor.handleApplyAdjustment} isLoading={editor.isLoading} />;
            case 'filters':
                return <FilterPanel onApplyFilter={editor.handleApplyFilter} onApplyLuckyFilter={editor.handleApplyLuckyFilter} isLoading={editor.isLoading} />;
            case 'color':
                return <ColorPanel isLoading={editor.isLoading} />;
            case 'style-transfer':
                return <StyleTransferPanel isLoading={editor.isLoading} />;
            case 'captions':
                return <CaptionPanel onSelectSuggestion={(text) => navigator.clipboard.writeText(text).then(() => alert(t('copied')))} isLoading={editor.isLoading} />;
            case 'variations':
                return <VariationsPanel.Generate onGenerate={editor.handleGenerateVariations} isLoading={editor.isLoading} />;
            case 'gif':
                return <GifPanel history={history} isLoading={editor.isLoading} />;
            case 'sketch':
                return <SketchPanel 
                    prompt={editor.prompt} 
                    setPrompt={editor.setPrompt}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    color={sketchColor}
                    setColor={setSketchColor}
                    tool={drawTool}
                    setTool={setDrawTool}
                    onClear={() => drawingCanvasRef.current?.clear()}
                    onUndo={() => drawingCanvasRef.current?.undo()}
                    onRedo={() => drawingCanvasRef.current?.redo()}
                    onGenerate={() => {
                        const sketch = getDrawing();
                        if (sketch) editor.handleApplySketch(sketch, editor.prompt);
                    }}
                    isLoading={editor.isLoading} 
                />;
            case 'focus':
                return <FocusPanel onApplyFocus={editor.handleApplyFocus} isLoading={editor.isLoading} />;
            case 'merge':
                return <MergePanel isLoading={editor.isLoading} />;
            default:
                return <EmptyStatePanel />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full w-full gap-4 lg:gap-6 items-stretch animate-fade-in">
            <div className="flex-grow relative bg-slate-50 dark:bg-black/20 rounded-3xl overflow-hidden shadow-inner border border-black/5 dark:border-white/10 checkerboard-bg group min-h-[50vh]">
                {currentImageUrl && (
                    <ZoomPanWrapper
                        ref={zoomPanRef}
                        imageRef={imageRef}
                        imageUrl={currentImageUrl}
                        panningAllowed={isPanMode}
                    >
                        <div className="relative inline-block">
                            {activeTab === 'crop' ? (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(c) => setCrop(c)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={cropAspect}
                                    className="max-h-full max-w-full"
                                >
                                    <img 
                                        ref={imageRef} 
                                        src={currentImageUrl} 
                                        alt="Editing" 
                                        className="max-h-[80vh] max-w-full object-contain block select-none pointer-events-none" 
                                        style={{ transformOrigin: 'top left' }}
                                    />
                                </ReactCrop>
                            ) : (
                                <img 
                                    ref={imageRef} 
                                    src={currentImageUrl} 
                                    alt="Editing" 
                                    className="max-h-[80vh] max-w-full object-contain block select-none pointer-events-none" 
                                    style={{ transformOrigin: 'top left' }}
                                />
                            )}

                            {['erase', 'retouch', 'add-product', 'sketch'].includes(activeTab || '') && imageRef.current && (
                                <div className={`absolute inset-0 z-10 ${isPanMode ? 'pointer-events-none' : ''}`}>
                                    <DrawingCanvas 
                                        ref={drawingCanvasRef}
                                        imageElement={imageRef.current}
                                        brushSize={brushSize}
                                        brushColor={brushColor}
                                        onDrawEnd={handleDrawEnd} 
                                        tool={drawTool}
                                    />
                                </div>
                            )}

                            {isCompareVisible && originalImageUrl && activeTab !== 'crop' && (
                                <div className="absolute inset-0 z-20 pointer-events-auto">
                                    <CompareSlider 
                                        originalImage={originalImageUrl} 
                                        currentImage={currentImageUrl} 
                                    />
                                </div>
                            )}
                        </div>
                    </ZoomPanWrapper>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 p-2 bg-white/90 dark:bg-black/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 dark:border-white/10 z-30 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4">
                    <button onClick={handleUndo} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-gray-200 transition-colors active:scale-90" data-tooltip-id="app-tooltip" data-tooltip-content={t('undo')}>
                        <UndoIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button onClick={handleRedo} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-gray-200 transition-colors active:scale-90" data-tooltip-id="app-tooltip" data-tooltip-content={t('redo')}>
                        <RedoIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                    <button 
                        onClick={() => setIsPanMode(!isPanMode)} 
                        className={`p-2 rounded-full transition-colors active:scale-90 ${isPanMode ? 'bg-theme-accent text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200'}`}
                        data-tooltip-id="app-tooltip" 
                        data-tooltip-content={t('shortcutsPan')}
                    >
                        <HandIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button onClick={() => zoomPanRef.current?.zoomOut()} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-gray-200 transition-colors active:scale-90" data-tooltip-id="app-tooltip" data-tooltip-content={t('zoomOut')}>
                        <ZoomOutIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button onClick={() => zoomPanRef.current?.reset()} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-gray-200 transition-colors active:scale-90" data-tooltip-id="app-tooltip" data-tooltip-content={t('fitToScreen')}>
                        <FitToScreenIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button onClick={() => zoomPanRef.current?.zoomIn()} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-gray-200 transition-colors active:scale-90" data-tooltip-id="app-tooltip" data-tooltip-content={t('zoomIn')}>
                        <ZoomInIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                    <button onClick={() => setIsCompareVisible(!isCompareVisible)} className={`p-2 rounded-full transition-colors active:scale-90 ${isCompareVisible ? 'bg-theme-accent text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200'}`} data-tooltip-id="app-tooltip" data-tooltip-content={t('compareWithOriginal')}>
                        <EyeIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button onClick={() => setIsInspectorOpen(true)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-gray-200 transition-colors active:scale-90" data-tooltip-id="app-tooltip" data-tooltip-content={t('inspectorTitle')}>
                        <InfoIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {editor.isLoading && (
                    <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center backdrop-blur-md animate-fade-in">
                        <Spinner />
                        <p className="text-white mt-4 font-black text-lg drop-shadow-lg animate-pulse uppercase tracking-widest">{editor.loadingMessage}</p>
                    </div>
                )}
            </div>

            {!isPanelCollapsed && (
                <div className="w-full md:w-80 lg:w-[400px] flex-shrink-0 glass-panel flex flex-col overflow-hidden transition-all duration-500 h-2/5 md:h-auto animate-slide-in-right">
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white/30 dark:bg-transparent">
                        <div key={activeTab} className="h-full animate-fade-in">
                             {renderPanel()}
                        </div>
                    </div>
                    
                    <div className="p-4 border-t border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/40 flex flex-col gap-2 backdrop-blur-3xl shadow-2xl">
                        <button onClick={handleReset} className="w-full py-2.5 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all active:scale-95 text-xs flex items-center justify-center gap-2 uppercase tracking-wide">
                            <ResetIcon className="w-4 h-4" /> {t('resetAllChanges')}
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex gap-2 w-full">
                                <button onClick={() => handleDownload()} className="flex-1 py-3 bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-black rounded-xl hover:bg-gray-200 dark:hover:bg-white/15 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                                    <DownloadIcon className="w-4 h-4" /> {t('download')}
                                </button>
                                <button onClick={handleShare} className="py-3 px-4 bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/15 transition-all active:scale-95 flex items-center justify-center" title={t('share')}>
                                    <ShareIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <button 
                                onClick={onSaveToCreations} 
                                disabled={isSaving || isSavingToCreations || isSaved} 
                                className={`py-3 font-black rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 disabled:opacity-50 disabled:transform-none ${
                                    isSaved 
                                    ? 'bg-green-500 text-white shadow-green-500/40' 
                                    : 'bg-theme-gradient text-white shadow-theme-accent/30 hover:shadow-theme-accent/50 hover:scale-[1.02] hover:brightness-110'
                                }`}
                            >
                                {isSaving || isSavingToCreations ? (
                                    <Spinner />
                                ) : isSaved ? (
                                    <CheckCircleIcon className="w-4 h-4" />
                                ) : (
                                    <SaveIcon className="w-4 h-4" />
                                )}
                                {isSaved ? t('gallerySaved') : t('saveToCreations')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <ImageInspectorModal 
                isOpen={isInspectorOpen} 
                onClose={() => setIsInspectorOpen(false)} 
                image={currentItem?.file || null}
            />
        </div>
    );
};

const handleDrawEnd = () => {};

export default EditorView;