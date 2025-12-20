
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

/**
 * Initializes a new instance of the GoogleGenAI client.
 * As per guidelines, we create a new instance right before making an API call 
 * to ensure it uses the most up-to-date API key (especially from the key selection dialog).
 */
const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "null") {
        throw new Error("API_KEY_REQUIRED: Please connect your account or set your API key in the environment.");
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

/**
 * Executes an AI operation with automatic retry logic and handles key selection bridge errors.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        // Handle "Requested entity was not found" or "API_KEY_REQUIRED" by prompting for key selection via the bridge.
        if (error.message?.includes("Requested entity was not found") || error.message?.includes("API_KEY_REQUIRED")) {
            if (typeof (window as any).aistudio !== 'undefined' && (window as any).aistudio.openSelectKey) {
                 await (window as any).aistudio.openSelectKey();
                 // After key selection, attempt a single retry.
                 return withRetry(fn, 1, delay); 
            }
        }

        // Retry on network errors or transient backend failures.
        if (retries > 0 && (error.status === 429 || error.status >= 500)) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        
        throw error;
    }
}

// FIX: Added _generateImageEdit helper to handle various image editing tasks.
const _generateImageEdit = async (image: File, prompt: string, task: string, mask?: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const parts: Part[] = [imagePart];
        
        if (mask) {
            const maskPart = await fileToGenerativePart(mask);
            parts.push(maskPart);
            parts.push({ text: `Task: ${task}. Use the provided mask to identify the area to modify. ${prompt ? `Description of change: ${prompt}` : 'Perform the edit seamlessly.'}` });
        } else {
            parts.push({ text: `Task: ${task}. Prompt: ${prompt}` });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: { parts },
            config: { safetySettings }
        });
        
        return handleApiResponse(response, task);
    });
};

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

// FIX: Completed truncated functions and added all missing AI service exports.

export const generateFilteredImage = async (image: File, filterPrompt: string) => _generateImageEdit(image, filterPrompt, 'filter');

export const generateLuckyFilterImage = async (image: File) => {
    return _generateImageEdit(image, "Apply a random, creative, and aesthetically pleasing professional photo filter that complements the content of the image.", "lucky filter");
};

export const generateAdjustedImage = async (image: File, adjustmentPrompt: string) => _generateImageEdit(image, adjustmentPrompt, 'adjustment');

export const generateExpandedImage = async (image: File, prompt: string) => _generateImageEdit(image, prompt, 'outpainting');

export const generateUpscaledImage = async (image: File, scale: number) => _generateImageEdit(image, `Upscale this image by ${scale}x and enhance details.`, 'upscale');

export const generateEnhancedImage = async (image: File, intensity: string) => _generateImageEdit(image, `Apply ${intensity} detail and clarity enhancement.`, 'enhance');

export const generateRestoredImage = async (image: File, prompt: string) => _generateImageEdit(image, prompt, 'restoration');

export const generateRemovedBackgroundImage = async (image: File) => _generateImageEdit(image, "Remove the background completely and leave only the main subject on a transparent background.", 'background removal');

export const generateReplacedBackgroundImage = async (image: File, prompt: string) => _generateImageEdit(image, prompt, 'background replacement');

export const generateProductBackgroundImage = async (image: File, name: string, customPrompt?: string) => {
    const prompt = customPrompt || `Place this product on a professional ${name} background in a studio lighting setup.`;
    return _generateImageEdit(image, prompt, 'product background');
};

export const generateProductShadowImage = async (image: File) => _generateImageEdit(image, "Add a realistic, soft contact shadow underneath the product to ground it in the scene.", 'product shadow');

export const generateAddedProductImage = async (image: File, mask: File, prompt: string) => _generateImageEdit(image, prompt, 'add object', mask);

export const generateCardImage = async (image: File, cardPrompt: string) => _generateImageEdit(image, cardPrompt, 'cardify');

export const generateAutoAdjustments = async (image: File): Promise<any> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    imagePart,
                    { text: "Suggest professional adjustments for brightness, contrast, saturation, highlights, shadows, vibrance, temperature, and sharpness. Return a JSON object with values between -100 and 100." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        brightness: { type: Type.NUMBER },
                        contrast: { type: Type.NUMBER },
                        saturation: { type: Type.NUMBER },
                        highlights: { type: Type.NUMBER },
                        shadows: { type: Type.NUMBER },
                        vibrance: { type: Type.NUMBER },
                        temperature: { type: Type.NUMBER },
                        sharpness: { type: Type.NUMBER },
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const generateLuckyAdjustment = async (image: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: "Suggest a creative photo adjustment in one sentence." }] }
        });
        return response.text?.trim() || "Enhance the image.";
    });
};

export const generateCardDetails = async (image: File, cardType: string): Promise<any> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: `Generate creative details for a ${cardType} trading card based on this image. Return a JSON object with relevant fields.` }] },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const generateMemeSuggestions = async (image: File): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: "Suggest 5 funny meme captions for this image. Return a JSON array of strings." }] },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateColorPalette = async (image: File): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: "Extract 5 dominant hex colors from this image. Return a JSON array of strings." }] },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const applyColorPalette = async (image: File, palette: string[], selectedColor: string) => _generateImageEdit(image, `Recolor the image using this palette: ${palette.join(', ')}. Emphasize ${selectedColor}.`, 'apply palette');

export const generateRecoloredImage = async (image: File, source: string, target: string, tolerance: number) => _generateImageEdit(image, `Change the color ${source} to ${target} with a tolerance of ${tolerance}%.`, 'recolor');

export const generateStyledImage = async (image: File, styleImage: File) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const stylePart = await fileToGenerativePart(styleImage);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: { parts: [imagePart, stylePart, { text: "Apply the artistic style of the second image to the first image." }] }
        });
        return handleApiResponse(response, 'style transfer');
    });
};

export const generateCaptions = async (image: File): Promise<{ captions: string[], sources: any[] }> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: "Generate 3 descriptive captions for this image. Use Google Search to find relevant context if possible." }] },
            config: { tools: [{ googleSearch: {} }] }
        });
        return {
            captions: [response.text || ""],
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
        };
    });
};

export const generateImageVariations = async (image: File, creativity: string): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: { parts: [imagePart, { text: `Generate 3 creative variations of this image with ${creativity} changes.` }] }
        });
        const result = handleApiResponse(response, 'variations');
        return [result]; // Simplified for now as handleApiResponse returns one
    });
};

export const generatePromptSuggestions = async (image: File, context: string): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: `Suggest 3 prompts for ${context === 'add' ? 'adding an object to' : 'replacing an area of'} this image. Return a JSON array.` }] },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateCreativeText = async (image: File, type: string): Promise<{ text: string, color: string }> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: `Generate a creative ${type} for this image and a suggested hex color for the text. Return JSON.` }] },
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        color: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{"text": "", "color": "#FFFFFF"}');
    });
};

export const detectObjects = async (image: File, label: string): Promise<any[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: { parts: [imagePart, { text: `Detect [${label}] and return bounding boxes in JSON array.` }] },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateSegmentationMask = async (image: File, label: string): Promise<string | null> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: { parts: [imagePart, { text: `Generate a segmentation mask for: ${label}` }] }
        });
        return handleApiResponse(response, 'mask');
    });
};

export const generateExpansionSuggestions = async (image: File): Promise<any[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text: "Suggest 4 directions and prompts for expanding this image. Return JSON array." }] },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateSketchImage = async (image: File, prompt: string) => _generateImageEdit(image, prompt, 'sketch-to-image');

export const generateFocusImage = async (image: File, intensity: string) => _generateImageEdit(image, `Apply a ${intensity} bokeh focus effect to the background.`, 'focus');

export const generateMergedImage = async (image1: File, image2: File, prompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const part1 = await fileToGenerativePart(image1);
        const part2 = await fileToGenerativePart(image2);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: { parts: [part1, part2, { text: prompt }] }
        });
        return handleApiResponse(response, 'merge');
    });
};

export async function* chatWithGeminiStream(history: any[], message: string, file?: File, reasoning?: boolean) {
    const ai = getAiClient();
    const parts: Part[] = [];
    if (file) parts.push(await fileToGenerativePart(file));
    parts.push({ text: message });

    const contents: Content[] = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
    contents.push({ role: 'user', parts });

    const stream = await ai.models.generateContentStream({
        model: reasoning ? "gemini-3-pro-preview" : "gemini-3-flash-preview",
        contents,
        config: { 
            tools: [{ googleSearch: {} }],
            thinkingConfig: reasoning ? { thinkingBudget: 32768 } : undefined
        }
    });

    for await (const chunk of stream) {
        yield { 
            text: chunk.text, 
            groundingMetadata: chunk.candidates?.[0]?.groundingMetadata 
        };
    }
}

export const analyzeVideo = async (video: File, prompt: string): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const videoPart = await fileToGenerativePart(video);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [videoPart, { text: prompt }] }
        });
        return response.text || "";
    });
};

export const transcribeAudio = async (audio: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const audioPart = await fileToGenerativePart(audio);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [audioPart, { text: "Transcribe this audio." }] }
        });
        return response.text || "";
    });
};

export const generateSpeech = async (text: string): Promise<Uint8Array> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
            }
        });
        const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64) throw new Error("No speech returned");
        
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        return bytes;
    });
};

export const generateSmartReplies = async (messages: any[]): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const historyText = messages.map(m => `${m.role}: ${m.text}`).join('\n');
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Suggest 3 short replies to this history:\n${historyText}`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};
