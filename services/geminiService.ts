
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { 
    GoogleGenAI, 
    GenerateContentResponse, 
    Modality, 
    Type, 
    HarmBlockThreshold, 
    HarmCategory,
    Part,
    Content
} from "@google/genai";

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

const getAiKey = (): string => {
    const key = process.env.API_KEY;
    if (key && key !== "undefined" && key !== "null" && key.length > 5) {
        return key;
    }
    const windowKey = (window as any).process?.env?.API_KEY;
    if (windowKey && windowKey !== "undefined" && windowKey !== "null") {
        return windowKey;
    }
    return "";
};

const getAiClient = () => {
    const apiKey = getAiKey();
    if (!apiKey) {
        throw new Error("API_KEY_REQUIRED: Please connect your account to use AI features.");
    }
    return new GoogleGenAI({ apiKey });
};

const fileToGenerativePart = async (file: File): Promise<Part> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    
    return { inlineData: { mimeType: mimeMatch[1], data: arr[1] } };
};

const handleApiResponse = (response: GenerateContentResponse, context: string): string => {
    if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error(`The request was blocked by AI safety filters.`);
    }

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error(`No image returned for ${context}.`);
};

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (error.message?.includes("Requested entity was not found")) {
            if (typeof (window as any).aistudio !== 'undefined' && (window as any).aistudio.openSelectKey) {
                 await (window as any).aistudio.openSelectKey();
                 return withRetry(fn, retries, delay); 
            }
        }

        if (retries > 0 && (error.status === 429 || error.status >= 500)) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        
        throw error;
    }
}

export const inspectImage = async (image: File): Promise<any> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    imagePart, 
                    { text: "Inspect this image in depth. Identify visible objects, 5 dominant colors (hex), artistic style, composition, and lighting. Also provide 3 creative style suggestions for transformation. Return a JSON object." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        style: { type: Type.STRING },
                        composition: { type: Type.STRING },
                        lighting: { type: Type.STRING },
                        colors: { type: Type.ARRAY, items: { type: Type.STRING } },
                        prompt: { type: Type.STRING },
                        detectedObjects: { type: Type.ARRAY, items: { type: Type.STRING } },
                        styleSuggestions: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    title: { type: Type.STRING }, 
                                    description: { type: Type.STRING } 
                                } 
                            } 
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Enhance this image generation prompt: "${originalPrompt}"`,
        });
        return response.text?.trim() || originalPrompt;
    });
};

export const generateImages = async (
    prompt: string, 
    numImages: number, 
    aspectRatio: string, 
    quality: 'standard' | 'pro', 
    imageSize: string
): Promise<string[]> => {
    const model = quality === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const promises = Array(numImages).fill(null).map(async () => {
        return withRetry(async () => {
            const ai = getAiClient();
            const response = await ai.models.generateContent({
                model: model,
                contents: { parts: [{ text: prompt }] },
                config: {
                    safetySettings,
                    imageConfig: {
                        aspectRatio: aspectRatio as any,
                        imageSize: quality === 'pro' ? imageSize as any : undefined
                    }
                }
            });
            return handleApiResponse(response, 'generation');
        });
    });
    return await Promise.all(promises);
};

export const generateVideo = async (prompt: string, image?: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const model = 'veo-3.1-fast-generate-preview';
        let operation;
        if (image) {
            const imagePart = await fileToGenerativePart(image);
            if (!imagePart.inlineData) throw new Error("Processing failed");
            operation = await ai.models.generateVideos({
                model,
                prompt,
                image: { imageBytes: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType as any },
                config: { aspectRatio: '16:9' } 
            });
        } else {
            operation = await ai.models.generateVideos({ model, prompt, config: { aspectRatio: '16:9' } });
        }
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        if (operation.error) throw new Error(operation.error.message);
        return operation.response?.generatedVideos?.[0]?.video?.uri || '';
    });
};

export const generateInpaintedImage = async (image: File, mask: File, prompt: string) => _generateImageEdit(image, prompt, 'inpainting', mask);
export const generateRetouchImage = async (image: File, mask: File, prompt: string) => _generateImageEdit(image, prompt, 'retouch', mask);
export const generateSelectiveAdjustment = async (image: File, mask: File, prompt: string) => _generateImageEdit(image, prompt, 'selective adjust', mask);
export const generateFilteredImage = async (image: File, filterPrompt: string) => _generateImageEdit(image, filterPrompt, 'filter');

export const generateLuckyFilterImage = async (image: File) => {
    let specificPrompt = "Apply a creative filter.";
    try {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: "Suggest a unique artistic filter style for this image. Return only text." }] }
        });
        if (response.text) specificPrompt = response.text.trim();
    } catch (e) {}
    return _generateImageEdit(image, specificPrompt, 'lucky filter');
};

export const generateAdjustedImage = async (image: File, adjustmentPrompt: string) => _generateImageEdit(image, adjustmentPrompt, 'adjustment');
export const generateExpandedImage = async (image: File, expansionPrompt: string) => _generateImageEdit(image, expansionPrompt, 'expand');
export const generateUpscaledImage = async (image: File, scale: number) => _generateImageEdit(image, `Upscale ${scale}x`, 'upscale', undefined, 'gemini-3-pro-image-preview');
export const generateEnhancedImage = async (image: File, intensity: string) => _generateImageEdit(image, `Enhance quality: ${intensity}`, 'enhance');
export const generateRestoredImage = async (image: File, prompt: string) => _generateImageEdit(image, prompt, 'restore');
export const generateRemovedBackgroundImage = async (image: File) => _generateImageEdit(image, "Remove background", 'remove bg');
export const generateReplacedBackgroundImage = async (image: File, prompt: string) => _generateImageEdit(image, prompt, 'replace bg');
export const generateProductBackgroundImage = async (image: File, name: string, customPrompt?: string) => _generateImageEdit(image, customPrompt || `Professional background for ${name}`, 'product bg');
export const generateProductShadowImage = async (image: File) => _generateImageEdit(image, "Add realistic shadow", 'product shadow');
export const generateAddedProductImage = async (image: File, mask: File, prompt: string) => _generateImageEdit(image, prompt, 'add product', mask);
export const generateCardImage = async (image: File, cardPrompt: string) => _generateImageEdit(image, cardPrompt, 'cardify', undefined, 'gemini-3-pro-image-preview');
export const generateSketchImage = async (image: File, prompt: string) => _generateImageEdit(image, prompt, 'sketch to image');
export const generateFocusImage = async (image: File, intensity: string) => _generateImageEdit(image, `Bokeh ${intensity}`, 'focus');

export const generateMergedImage = async (base: File, overlay: File, prompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const parts = [await fileToGenerativePart(base), await fileToGenerativePart(overlay), { text: prompt }];
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts } });
        return handleApiResponse(response, 'merge');
    });
};

export const generateColorPalette = async (image: File): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: "Extract 5 dominant hex colors. Return JSON array." }] },
            config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const applyColorPalette = async (image: File, palette: string[], selectedColor: string) => _generateImageEdit(image, `Recolor with ${palette.join(', ')}`, 'apply palette');
export const generateRecoloredImage = async (image: File, source: string, target: string, tolerance: number) => _generateImageEdit(image, `Replace ${source} with ${target}`, 'recolor');

export const generateStyledImage = async (image: File, styleImage: File) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const parts = [await fileToGenerativePart(image), await fileToGenerativePart(styleImage), { text: "Apply second image style to first." }];
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts } });
        return handleApiResponse(response, 'style transfer');
    });
};

export const generateCaptions = async (image: File): Promise<{captions: string[], sources: any[]}> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: { parts: [imagePart, { text: "Generate 3 creative captions." }] },
            config: { tools: [{ googleSearch: {} }] }
        });
        return { captions: (response.text?.split('\n') || []).slice(0, 3), sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
    });
};

export const generateImageVariations = async (image: File, creativity: string): Promise<string[] | null> => {
    const prompt = `Generate 4 variations. Creativity: ${creativity}.`;
    const promises = Array(4).fill(null).map(async () => {
        return withRetry(async () => {
            const ai = getAiClient();
            const imagePart = await fileToGenerativePart(image);
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: [imagePart, { text: prompt }] } });
            return handleApiResponse(response, 'variation');
        });
    });
    return Promise.all(promises);
};

export const generatePromptSuggestions = async (image: File, context: 'add' | 'replace'): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const text = context === 'add' ? "Suggest 5 objects to add. JSON array." : "Suggest 5 edits. JSON array.";
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text }] },
            config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateCreativeText = async (image: File, type: 'quote' | 'caption' | 'pun'): Promise<{ text: string, color: string }> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: `Generate a creative ${type}. Return JSON {text, color}.` }] },
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, color: { type: Type.STRING } } } }
        });
        return JSON.parse(response.text || '{"text": "", "color": "#ffffff"}');
    });
};

export const detectObjects = async (image: File, label: string): Promise<Array<{ ymin: number, xmin: number, ymax: number, xmax: number }>> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: `Detect "${label}". Return JSON array of {ymin, xmin, ymax, xmax}.` }] },
            config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { ymin: { type: Type.NUMBER }, xmin: { type: Type.NUMBER }, ymax: { type: Type.NUMBER }, xmax: { type: Type.NUMBER } } } } }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateSegmentationMask = async (image: File, label: string): Promise<string | null> => _generateImageEdit(image, `Segment ${label}`, 'mask');
export const generateExpansionSuggestions = async (image: File): Promise<Array<{ direction: 'top' | 'bottom' | 'left' | 'right', prompt: string }>> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: "Suggest expansion ideas. JSON array {direction, prompt}." }] },
            config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { direction: { type: Type.STRING }, prompt: { type: Type.STRING } } } } }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateAutoAdjustments = async (image: File): Promise<Record<string, number>> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: "Suggest brightness/contrast/etc. JSON." }] },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const generateLuckyAdjustment = async (image: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: { parts: [imagePart, { text: "Surprise me with an edit instruction." }] } });
        return response.text || "Make it art.";
    });
};

export const generateCardDetails = async (image: File, cardType: string): Promise<any> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: { parts: [imagePart, { text: `Generate ${cardType} card info. JSON.` }] }, config: { responseMimeType: "application/json" } });
        return JSON.parse(response.text || "{}");
    });
};

export async function* chatWithGeminiStream(history: any[], message: string, file?: File, useReasoning: boolean = false) {
    const ai = getAiClient();
    const model = useReasoning ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    const chat = ai.chats.create({ model, history: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })) });
    const parts: any[] = [{ text: message }];
    if (file) parts.unshift(await fileToGenerativePart(file));
    const result = await chat.sendMessageStream({ message: parts });
    for await (const chunk of result) yield { text: chunk.text, groundingMetadata: chunk.candidates?.[0]?.groundingMetadata };
}

export const analyzeVideo = async (videoFile: File, prompt: string): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const filePart = await fileToGenerativePart(videoFile);
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: { parts: [filePart, { text: prompt }] } });
        return response.text || "";
    });
};

export const transcribeAudio = async (audioFile: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const filePart = await fileToGenerativePart(audioFile);
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: { parts: [filePart, { text: "Transcribe." }] } });
        return response.text || "";
    });
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-preview-tts', contents: [{ parts: [{ text }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } } });
        const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64) throw new Error("TTS failed");
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
    });
};

export const generateSmartReplies = async (history: any[]): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: "Suggest 3 smart replies. JSON array.", config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } } });
        return JSON.parse(response.text || "[]");
    });
};

export const generateMemeSuggestions = async (image: File): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: { parts: [imagePart, { text: "Generate 5 funny captions. JSON array." }] }, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } } });
        return JSON.parse(response.text || "[]");
    });
};

async function _generateImageEdit(image: File, prompt: string, context: string, mask?: File, model: string = 'gemini-2.5-flash-image'): Promise<string> {
    return withRetry(async () => {
        const ai = getAiClient();
        const parts: Part[] = [await fileToGenerativePart(image)];
        if (mask) parts.push(await fileToGenerativePart(mask));
        parts.push({ text: prompt });
        const response = await ai.models.generateContent({ model, contents: { parts }, config: { safetySettings } });
        return handleApiResponse(response, context);
    });
}
