/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import * as geminiService from '../services/geminiService';
import { dataURLtoFile, processImageWithWorker } from '../utils/helpers';
import { useLanguage } from './LanguageContext';
import { type AddToHistoryOptions, type TextOptions, type MemeOptions } from '../types';

interface EditorContextState {
    // FIX: Added `currentImage` to the context state so it can be accessed by child components like `AdjustmentPanel`.
    currentImage: File | null;
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
    prompt: string;
    memeSuggestions: string[];
    captionSuggestions: string[];
    captionSources: { uri: string, title: string }[];
    isPickingColor: boolean;
    sourceColor: string | null;
    setError: (error: string | null) => void;
    setPrompt: (prompt: string) => void;
    setMemeSuggestions: (suggestions: string[]) => void;
    setIsPickingColor: (isPicking: boolean) => void;
    setSourceColor: (color: string | null) => void;
    handleMagicErase: (maskImageUrl: string) => Promise<void>;
    handleSelectiveAdjust: (maskImageUrl: string) => Promise<void>;
    handleApplyRetouch: (maskImageUrl: string) => Promise<void>;
    handleApplyHeal: (maskImageUrl: string) => Promise<void>;
    handleApplyFilter: (filterPrompt: string, name: string) => Promise<void>;
    handleApplyLuckyFilter: () => Promise<void>;
    handleApplyAdjustment: (adjustmentPrompt: string) => Promise<void>;
    handleApplyCrop: (completedCrop: { x: number; y: number; width: number; height: number; }, imageElement: HTMLImageElement) => Promise<void>;
    handleApplyExpand: (direction: 'top' | 'bottom' | 'left' | 'right', expansionPrompt: string) => Promise<void>;
    handleApplyUpscale: (scale: number) => Promise<void>;
    handleApplyEnhance: (intensity: 'subtle' | 'medium' | 'strong') => Promise<void>;
    handleApplyRestore: (options: { fixDamage: boolean; improveClarity: boolean; colorize: boolean; enhanceFaces: boolean; }) => Promise<void>;
    handleRemoveBackground: () => Promise<void>;
    handleReplaceBackground: (backgroundPrompt: string) => Promise<void>;
    handleSetProductBackground: (name: string, customPrompt?: string) => Promise<void>;
    handleAddProductShadow: () => Promise<void>;
    handleApplyAddProduct: (maskImageUrl: string) => Promise<void>;
    handleApplyCardify: (cardPrompt: string) => Promise<void>;
    handleApplyText: (options: TextOptions) => Promise<void>;
    handleApplyMeme: (options: MemeOptions) => Promise<void>;
    handleGenerateMemeSuggestions: () => Promise<void>;
    handleGeneratePalette: () => Promise<string[]>;
    handleApplyPalette: (palette: string[], selectedColor: string) => Promise<void>;
    handleApplyRecolor: (targetColor: string, tolerance: number) => Promise<void>;
    handleApplyStyleTransfer: (styleImage: File) => Promise<void>;
    handleGenerateCaptions: () => Promise<void>;
    handleGenerateVariations: (creativity: 'low' | 'medium' | 'high') => Promise<string[] | null>;
    handleGeneratePromptSuggestions: (context: 'add' | 'replace') => Promise<string[]>;
    handleGenerateCreativeText: (type: 'quote' | 'caption' | 'pun') => Promise<{ text: string, color: string }>;
    handleDetectObjects: (label: string) => Promise<Array<{ ymin: number, xmin: number, ymax: number, xmax: number }>>;
    handleGenerateExpansionSuggestions: () => Promise<Array<{ direction: 'top' | 'bottom' | 'left' | 'right', prompt: string }>>;
    handleApplySketch: (sketchDataUrl: string, prompt: string) => Promise<void>;
    handleApplyFocus: (intensity: 'subtle' | 'medium' | 'strong') => Promise<void>;
    handleMagicMask: (label: string) => Promise<string | null>;
}

const EditorContext = React.createContext<EditorContextState | undefined>(undefined);

interface EditorProviderProps {
    children: React.ReactNode;
    currentImage: File | null;
    addImageToHistory: (newImageFile: File, options: AddToHistoryOptions) => void;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children, currentImage, addImageToHistory }) => {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = React.useState<string>('');
    const [error, setError] = React.useState<string | null>(null);
    const [prompt, setPrompt] = React.useState<string>('');
    const [memeSuggestions, setMemeSuggestions] = React.useState<string[]>([]);
    const [captionSuggestions, setCaptionSuggestions] = React.useState<string[]>([]);
    const [captionSources, setCaptionSources] = React.useState<{ uri: string, title: string }[]>([]);
    const [isPickingColor, setIsPickingColor] = React.useState(false);
    const [sourceColor, setSourceColor] = React.useState<string | null>(null);

    React.useEffect(() => {
        setMemeSuggestions([]);
        setCaptionSuggestions([]);
        setCaptionSources([]);
    }, [currentImage]);

    const handleApiError = React.useCallback((err: unknown) => {
      let message = err instanceof Error ? err.message : 'An unknown error occurred.';
      let userFriendlyMessage = ``;
      if (message.includes('blocked')) userFriendlyMessage += t('errorBlocked');
      else if (message.includes('stopped unexpectedly')) userFriendlyMessage += t('errorStopped');
      else if (message.includes('did not return an image')) userFriendlyMessage += t('errorNoImage');
      else userFriendlyMessage = message;
      setError(userFriendlyMessage);
      console.error(err);
    }, [t]);

    const handleApiCall = React.useCallback(async <T extends any[]>(
        apiFunction: (...args: T) => Promise<string>,
        args: T,
        loadingMsgKey: string,
        historyOptions: AddToHistoryOptions,
        loadingMsgParams?: Record<string, string | number>
    ) => {
        if (!currentImage) {
            setError(t('errorNoImageToEdit'));
            return;
        }
        let message = t(loadingMsgKey as any);
        if (loadingMsgParams) {
             message = Object.entries(loadingMsgParams).reduce(
                (acc, [key, value]) => acc.replace(`{${key}}`, String(value)),
                message
            );
        }

        setLoadingMessage(message);
        setIsLoading(true);
        setError(null);

        try {
            const resultDataUrl = await apiFunction(...args);
            const resultFile = dataURLtoFile(resultDataUrl, `edited-${Date.now()}.png`);
            addImageToHistory(resultFile, historyOptions);
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentImage, addImageToHistory, handleApiError, t]);


    const handleMagicErase = React.useCallback(async (maskImageUrl: string) => {
        if (!maskImageUrl) { setError(t('errorNoMask')); return; }
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        const maskFile = dataURLtoFile(maskImageUrl, 'mask.png');
        await handleApiCall(
            geminiService.generateInpaintedImage,
            [currentImage, maskFile, prompt],
            'loadingMagicErase',
            {
                action: prompt ? t('actionErase').replace('{prompt}', prompt) : t('actionMagicErase'),
                actionKey: prompt ? 'actionErase' : 'actionMagicErase',
                actionParams: prompt ? { prompt } : undefined,
            }
        );
    }, [currentImage, prompt, handleApiCall, t, setError]);

    const handleApplyHeal = React.useCallback(async (maskImageUrl: string) => {
        if (!maskImageUrl) { setError(t('errorNoMask')); return; }
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        const maskFile = dataURLtoFile(maskImageUrl, 'mask.png');
        await handleApiCall(
            geminiService.generateInpaintedImage,
            [currentImage, maskFile, ''], // Empty prompt for healing
            'loadingMagicErase',
            { action: t('actionHeal'), actionKey: 'actionHeal' }
        );
    }, [currentImage, handleApiCall, t, setError]);

    const handleSelectiveAdjust = React.useCallback(async (maskImageUrl: string) => {
        if (!maskImageUrl) { setError(t('errorNoMaskAdjust')); return; }
        if (!prompt) { setError(t('errorNoAdjustmentPrompt')); return; }
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        const maskFile = dataURLtoFile(maskImageUrl, 'mask.png');
        await handleApiCall(
            geminiService.generateSelectiveAdjustment,
            [currentImage, maskFile, prompt],
            'loadingSelectiveAdjust',
            { action: t('actionRetouch').replace('{prompt}', prompt), actionKey: 'actionRetouch', actionParams: { prompt } }
        );
    }, [currentImage, prompt, handleApiCall, t, setError]);

    const handleApplyRetouch = React.useCallback(async (maskImageUrl: string) => {
        if (!maskImageUrl) { setError(t('errorNoMask')); return; }
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        const maskFile = dataURLtoFile(maskImageUrl, 'mask.png');
        await handleApiCall(
            geminiService.generateRetouchImage,
            [currentImage, maskFile, prompt],
            'loadingMagicErase',
            {
                action: t('actionRetouch').replace('{prompt}', prompt),
                actionKey: 'actionRetouch',
                actionParams: { prompt },
            }
        );
    }, [currentImage, prompt, handleApiCall, t, setError]);

    const handleApplyFilter = React.useCallback(async (filterPrompt: string, name: string) => {
        if (!currentImage) { setError(t('errorNoFilter')); return; }
        await handleApiCall(
            geminiService.generateFilteredImage,
            [currentImage, filterPrompt],
            'loadingFilter',
            { action: t('actionFilter').replace('{name}', name), actionKey: 'actionFilter', actionParams: { name } }
        );
    }, [currentImage, handleApiCall, t, setError]);

    const handleApplyLuckyFilter = React.useCallback(async () => {
        if (!currentImage) { setError(t('errorNoFilter')); return; }
        await handleApiCall(
            geminiService.generateLuckyFilterImage,
            [currentImage],
            'loadingLucky',
            { action: t('actionLuckyFilter'), actionKey: 'actionLuckyFilter' }
        );
    }, [currentImage, handleApiCall, t, setError]);

    const handleApplyAdjustment = React.useCallback(async (adjustmentPrompt: string) => {
        if (!currentImage) { setError(t('errorNoAdjustment')); return; }
        await handleApiCall(
            geminiService.generateAdjustedImage,
            [currentImage, adjustmentPrompt],
            'loadingAdjustment',
            { action: t('actionAdjust'), actionKey: 'actionAdjust' }
        );
    }, [currentImage, handleApiCall, t, setError]);
    
    const handleApplyCrop = React.useCallback(async (completedCrop: any, imageElement: HTMLImageElement) => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        if (!completedCrop?.width || !completedCrop?.height) { setError(t('errorNoCropSelection')); return; }
        
        setIsLoading(true);
        setError(null);
        try {
            const croppedFile = await processImageWithWorker('CROP', { 
                image: currentImage, 
                crop: completedCrop,
                imageElement: {
                    naturalWidth: imageElement.naturalWidth,
                    naturalHeight: imageElement.naturalHeight,
                    width: imageElement.width,
                    height: imageElement.height,
                }
            });
            addImageToHistory(croppedFile, { action: t('actionCrop'), actionKey: 'actionCrop' });
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentImage, addImageToHistory, handleApiError, t, setError]);

    const handleApplyExpand = React.useCallback(async (direction: 'top' | 'bottom' | 'left' | 'right', expansionPrompt: string) => {
        if (!currentImage) { setError(t('errorNoExpand')); return; }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = await new Promise<HTMLImageElement>(resolve => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.src = URL.createObjectURL(currentImage);
        });

        const expandRatio = 0.5; // expand by 50%
        let newWidth = img.width, newHeight = img.height;
        let drawX = 0, drawY = 0;

        if (direction === 'top' || direction === 'bottom') {
            newHeight = img.height * (1 + expandRatio);
            drawY = direction === 'top' ? img.height * expandRatio : 0;
        } else {
            newWidth = img.width * (1 + expandRatio);
            drawX = direction === 'left' ? img.width * expandRatio : 0;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, drawX, drawY);

        const expandedImageBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!expandedImageBlob) return;
        
        const expandedImageFile = new File([expandedImageBlob], 'expanded.png', { type: 'image/png' });

        await handleApiCall(
            geminiService.generateExpandedImage,
            [expandedImageFile, expansionPrompt],
            'loadingExpand',
            { 
                action: t('actionExpand').replace('{direction}', direction),
                actionKey: 'actionExpand',
                actionParams: { direction }
            }
        );
    }, [currentImage, handleApiCall, t, setError]);

    const handleApplyUpscale = React.useCallback(async (scale: number) => {
        if (!currentImage) { setError(t('errorNoUpscale')); return; }
        await handleApiCall(
            geminiService.generateUpscaledImage,
            [currentImage, scale],
            'loadingUpscale',
            { 
                action: t('actionUpscale').replace('{scale}', `${scale}`),
                actionKey: 'actionUpscale',
                actionParams: { scale }
            },
            { scale: `${scale}` }
        );
    }, [currentImage, handleApiCall, t, setError]);

    const handleApplyEnhance = React.useCallback(async (intensity: 'subtle' | 'medium' | 'strong') => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        await handleApiCall(
            geminiService.generateEnhancedImage,
            [currentImage, intensity],
            'loadingEnhance',
            { action: t('actionEnhance'), actionKey: 'actionEnhance' }
        );
    }, [currentImage, handleApiCall, t, setError]);

    const handleApplyRestore = React.useCallback(async (options: any) => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        const { fixDamage, improveClarity, colorize, enhanceFaces } = options;
        if (!fixDamage && !improveClarity && !colorize && !enhanceFaces) { setError(t('errorNoRestoreOptions')); return; }
        
        const restorePrompts: string[] = [];
        if (fixDamage) restorePrompts.push('Fix scratches, tears, and folds.');
        if (improveClarity) restorePrompts.push('Improve clarity and sharpness.');
        if (colorize) restorePrompts.push('Colorize the photo naturally.');
        if (enhanceFaces) restorePrompts.push('Enhance facial details without changing identity.');
        
        await handleApiCall(
            geminiService.generateRestoredImage,
            [currentImage, restorePrompts.join(' ')],
            'loadingRestore',
            { action: t('actionRestore'), actionKey: 'actionRestore' }
        );
    }, [currentImage, handleApiCall, t, setError]);
    
    const handleRemoveBackground = React.useCallback(async () => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        await handleApiCall(
            geminiService.generateRemovedBackgroundImage,
            [currentImage],
            'loadingRemoveBg',
            { action: t('actionRemoveBg'), actionKey: 'actionRemoveBg', hasTransparentBackground: true }
        );
    }, [currentImage, handleApiCall, t]);

    const handleReplaceBackground = React.useCallback(async (backgroundPrompt: string) => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        await handleApiCall(
            geminiService.generateReplacedBackgroundImage,
            [currentImage, backgroundPrompt],
            'loadingReplaceBg',
            { action: t('actionReplaceBg'), actionKey: 'actionReplaceBg', hasTransparentBackground: false }
        );
    }, [currentImage, handleApiCall, t]);
    
    const handleSetProductBackground = React.useCallback(async (name: string, customPrompt?: string) => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        await handleApiCall(
            geminiService.generateProductBackgroundImage,
            [currentImage, name, customPrompt],
            'loadingReplaceBg',
            { 
                action: t('actionProductBg').replace('{name}', name), 
                actionKey: 'actionProductBg', 
                actionParams: { name },
                hasTransparentBackground: false 
            }
        );
    }, [currentImage, handleApiCall, t]);
    
    const handleAddProductShadow = React.useCallback(async () => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        await handleApiCall(
            geminiService.generateProductShadowImage,
            [currentImage],
            'loadingAdjustment',
            { action: t('actionProductShadow'), actionKey: 'actionProductShadow' }
        );
    }, [currentImage, handleApiCall, t]);

    const handleApplyAddProduct = React.useCallback(async (maskImageUrl: string) => {
        if (!prompt) { setError(t('addProductPlaceholder')); return; }
        if (!maskImageUrl) { setError(t('errorNoMask')); return; }
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }

        const maskFile = dataURLtoFile(maskImageUrl, 'mask.png');

        await handleApiCall(
            geminiService.generateAddedProductImage,
            [currentImage, maskFile, prompt],
            'loadingGenerateImages',
            {
                action: t('actionAddProduct').replace('{prompt}', prompt),
                actionKey: 'actionAddProduct',
                actionParams: { prompt }
            }
        );
    }, [currentImage, prompt, addImageToHistory, handleApiCall, t, setError]);

    const handleApplyCardify = React.useCallback(async (cardPrompt: string) => {
        if (!currentImage) { setError(t('errorNoCardify')); return; }
        await handleApiCall(
            geminiService.generateCardImage,
            [currentImage, cardPrompt],
            'loadingCardify',
            { action: t('actionCardify'), actionKey: 'actionCardify' }
        );
    }, [currentImage, handleApiCall, t, setError]);
    
    const handleApplyText = React.useCallback(async (options: TextOptions) => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        setIsLoading(true);
        setError(null);
        try {
            const newFile = await processImageWithWorker('TEXT', { image: currentImage, textOptions: options });
            addImageToHistory(newFile, { action: t('actionAddText'), actionKey: 'actionAddText' });
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentImage, addImageToHistory, handleApiError, t, setError]);
    
    const handleApplyMeme = React.useCallback(async (options: MemeOptions) => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        setIsLoading(true);
        setError(null);
        try {
            const newFile = await processImageWithWorker('MEMEIFY', { image: currentImage, memeOptions: options });
            addImageToHistory(newFile, { action: t('actionMemeify'), actionKey: 'actionMemeify' });
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentImage, addImageToHistory, handleApiError, t, setError]);

    const handleGenerateMemeSuggestions = React.useCallback(async () => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        setLoadingMessage(t('loadingMemes'));
        setIsLoading(true);
        setError(null);
        try {
            const suggestions = await geminiService.generateMemeSuggestions(currentImage);
            setMemeSuggestions(suggestions);
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentImage, t, setError, handleApiError]);

    const handleGeneratePalette = React.useCallback(async (): Promise<string[]> => {
        if (!currentImage) {
            setError(t('errorNoImageToEdit'));
            return [];
        }
        setIsLoading(true);
        setLoadingMessage(t('loadingPalette'));
        setError(null);
        try {
            return await geminiService.generateColorPalette(currentImage);
        } catch (err) {
            handleApiError(err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [currentImage, t, setError, handleApiError]);

    const handleApplyPalette = React.useCallback(async (palette: string[], selectedColor: string) => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        await handleApiCall(
            geminiService.applyColorPalette,
            [currentImage, palette, selectedColor],
            'loadingApplyPalette',
            { action: t('actionApplyPalette'), actionKey: 'actionApplyPalette' }
        );
    }, [currentImage, handleApiCall, t, setError]);

    const handleApplyRecolor = React.useCallback(async (targetColor: string, tolerance: number) => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        if (!sourceColor) { return; }
        await handleApiCall(
            geminiService.generateRecoloredImage,
            [currentImage, sourceColor, targetColor, tolerance],
            'loadingApplyPalette', // Re-using a generic loading message
            { action: t('actionRecolor'), actionKey: 'actionRecolor' }
        );
    }, [currentImage, sourceColor, handleApiCall, t, setError]);

    const handleApplyStyleTransfer = React.useCallback(async (styleImage: File) => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        await handleApiCall(
            geminiService.generateStyledImage,
            [currentImage, styleImage],
            'loadingStyleTransfer',
            { action: t('actionStyleTransfer'), actionKey: 'actionStyleTransfer' }
        );
    }, [currentImage, handleApiCall, t, setError]);
    
    const handleGenerateCaptions = React.useCallback(async () => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        setLoadingMessage(t('captionsGenerating'));
        setIsLoading(true);
        setError(null);
        try {
            const { captions, sources } = await geminiService.generateCaptions(currentImage);
            setCaptionSuggestions(captions);
            setCaptionSources(sources);
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentImage, t, setError, handleApiError]);
    
    const handleGenerateVariations = React.useCallback(async (creativity: 'low' | 'medium' | 'high'): Promise<string[] | null> => {
        if (!currentImage) {
            setError(t('errorNoImageToEdit'));
            return null;
        }
        setLoadingMessage(t('loadingVariations'));
        setIsLoading(true);
        setError(null);
        try {
            return await geminiService.generateImageVariations(currentImage, creativity);
        } catch (err) {
            handleApiError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [currentImage, t, setError, handleApiError]);

    const handleGeneratePromptSuggestions = React.useCallback(async (context: 'add' | 'replace'): Promise<string[]> => {
        if (!currentImage) {
            setError(t('errorNoImageToEdit'));
            return [];
        }
        setError(null);
        try {
            const suggestions = await geminiService.generatePromptSuggestions(currentImage, context);
            return suggestions;
        } catch (err) {
            handleApiError(err);
            return [];
        }
    }, [currentImage, handleApiError, t, setError]);

    const handleGenerateCreativeText = React.useCallback(async (type: 'quote' | 'caption' | 'pun'): Promise<{ text: string, color: string }> => {
        if (!currentImage) {
            setError(t('errorNoImageToEdit'));
            return { text: '', color: '#FFFFFF' };
        }
        setError(null);
        setIsLoading(true);
        setLoadingMessage(t('suggesting'));
        try {
            return await geminiService.generateCreativeText(currentImage, type);
        } catch (err) {
            handleApiError(err);
            return { text: '', color: '#FFFFFF' };
        } finally {
            setIsLoading(false);
        }
    }, [currentImage, handleApiError, t, setError]);

    const handleDetectObjects = React.useCallback(async (label: string): Promise<Array<{ ymin: number, xmin: number, ymax: number, xmax: number }>> => {
        if (!currentImage) {
            setError(t('errorNoImageToEdit'));
            return [];
        }
        setError(null);
        // We don't set global isLoading here to allow specific UI element loading
        try {
            return await geminiService.detectObjects(currentImage, label);
        } catch (err) {
            handleApiError(err);
            return [];
        }
    }, [currentImage, handleApiError, t, setError]);

    const handleMagicMask = React.useCallback(async (label: string): Promise<string | null> => {
        if (!currentImage) {
            setError(t('errorNoImageToEdit'));
            return null;
        }
        setError(null);
        // Do not set global isLoading to keep UI responsive for local indicators
        try {
            return await geminiService.generateSegmentationMask(currentImage, label);
        } catch (err) {
            handleApiError(err);
            return null;
        }
    }, [currentImage, handleApiCall, t, setError]);

    const handleGenerateExpansionSuggestions = React.useCallback(async (): Promise<Array<{ direction: 'top' | 'bottom' | 'left' | 'right', prompt: string }>> => {
        if (!currentImage) {
            setError(t('errorNoImageToEdit'));
            return [];
        }
        setError(null);
        setIsLoading(true);
        setLoadingMessage(t('suggestingExpansions'));
        try {
            return await geminiService.generateExpansionSuggestions(currentImage);
        } catch (err) {
            handleApiError(err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [currentImage, handleApiError, t, setError]);

    const handleApplySketch = React.useCallback(async (sketchDataUrl: string, prompt: string) => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        
        // Composite Sketch + Image before sending
        // We can do this efficiently in an offscreen canvas or similar logic here
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = await new Promise<HTMLImageElement>(resolve => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.src = URL.createObjectURL(currentImage);
        });
        
        const sketch = await new Promise<HTMLImageElement>(resolve => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.src = sketchDataUrl;
        });

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        // Draw sketch overlay
        ctx.drawImage(sketch, 0, 0, img.naturalWidth, img.naturalHeight);
        
        const compositedBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!compositedBlob) return;
        const compositedFile = new File([compositedBlob], 'composited_sketch.png', { type: 'image/png' });

        await handleApiCall(
            geminiService.generateSketchImage,
            [compositedFile, prompt],
            'loadingGenerateImages',
            {
                action: t('actionSketch').replace('{prompt}', prompt),
                actionKey: 'actionSketch',
                actionParams: { prompt }
            }
        );
    }, [currentImage, handleApiCall, t, setError]);

    const handleApplyFocus = React.useCallback(async (intensity: 'subtle' | 'medium' | 'strong') => {
        if (!currentImage) { setError(t('errorNoImageToEdit')); return; }
        await handleApiCall(
            geminiService.generateFocusImage,
            [currentImage, intensity],
            'loadingFilter', // Reusing loading message
            { action: t('actionFocus'), actionKey: 'actionFocus' }
        );
    }, [currentImage, handleApiCall, t, setError]);


    // Use useMemo to stable the context value and prevent unnecessary re-renders of consumers
    const value = React.useMemo<EditorContextState>(() => ({
        currentImage,
        isLoading,
        loadingMessage,
        error,
        prompt,
        memeSuggestions,
        captionSuggestions,
        captionSources,
        isPickingColor,
        sourceColor,
        setError,
        setPrompt,
        setMemeSuggestions,
        setIsPickingColor,
        setSourceColor,
        handleMagicErase,
        handleSelectiveAdjust,
        handleApplyRetouch,
        handleApplyHeal,
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
        handleApplyMeme,
        handleGenerateMemeSuggestions,
        handleGeneratePalette,
        handleApplyPalette,
        handleApplyRecolor,
        handleApplyStyleTransfer,
        handleGenerateCaptions,
        handleGenerateVariations,
        handleGeneratePromptSuggestions,
        handleGenerateCreativeText,
        handleDetectObjects,
        handleGenerateExpansionSuggestions,
        handleApplySketch,
        handleApplyFocus,
        handleMagicMask,
    }), [
        currentImage,
        isLoading,
        loadingMessage,
        error,
        prompt,
        memeSuggestions,
        captionSuggestions,
        captionSources,
        isPickingColor,
        sourceColor,
        // Handlers are already stable via useCallback
        handleMagicErase,
        handleSelectiveAdjust,
        handleApplyRetouch,
        handleApplyHeal,
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
        handleApplyMeme,
        handleGenerateMemeSuggestions,
        handleGeneratePalette,
        handleApplyPalette,
        handleApplyRecolor,
        handleApplyStyleTransfer,
        handleGenerateCaptions,
        handleGenerateVariations,
        handleGeneratePromptSuggestions,
        handleGenerateCreativeText,
        handleDetectObjects,
        handleGenerateExpansionSuggestions,
        handleApplySketch,
        handleApplyFocus,
        handleMagicMask
    ]);

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = (): EditorContextState => {
    const context = React.useContext(EditorContext);
    if (context === undefined) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};