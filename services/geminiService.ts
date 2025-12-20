
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
 * Crucial: Always create a new instance of the AI client.
 * This ensures we pick up any API keys selected via the window.aistudio bridge 
 * which automatically updates process.env.API_KEY.
 */
const getAiClient = () => {
    // If the user has selected their own key via AI Studio dialog, it will be in process.env.API_KEY
    if (!process.env.API_KEY) {
        throw new Error("API_KEY_NOT_FOUND: Please click the Login button in the header to select your Google API Key.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Converts a File object to a Generative AI Part object containing base64 data.
 */
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

/**
 * Parses the Gemini API response to extract the generated image data URL.
 * Throws errors if the request was blocked or no image was returned.
 */
const handleApiResponse = (response: GenerateContentResponse, context: string): string => {
    if (response.promptFeedback?.blockReason) {
        throw new Error(`Request blocked: ${response.promptFeedback.blockReason}. ${response.promptFeedback.blockReasonMessage || ''}`);
    }

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        throw new Error(`Generation stopped: ${finishReason}`);
    }
    
    const textFeedback = response.text?.trim();
    throw new Error(`No image returned for ${context}. Model output: ${textFeedback || 'None'}`);
};

/**
 * Executes an async operation with exponential backoff retry logic.
 * Handles specific API errors like 429 (Too Many Requests) and 403 (Permission Denied).
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        // Requested entity not found: Reset key selection state as per guidelines
        if (error.message?.includes("Requested entity was not found")) {
            if (typeof (window as any).aistudio !== 'undefined' && (window as any).aistudio.openSelectKey) {
                 await (window as any).aistudio.openSelectKey();
                 // Immediately retry with the new key provided by the user
                 return withRetry(fn, retries, delay); 
            }
        }

        // Handle Permission Denied explicitly
        if (error.status === 403 || error.message?.includes('403') || error.message?.includes('PERMISSION_DENIED')) {
             throw new Error("Access Denied: Your Google project might not have billing enabled for Gemini AI Pro models.");
        }

        // Retry on rate limits (429) or server errors (5xx)
        if (retries > 0 && (error.status === 429 || error.status >= 500 || error.message?.includes('429'))) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        
        throw error;
    }
}

// --- Exported Service Functions ---

/**
 * Uses Gemini Flash to rewrite a user's simple prompt into a more descriptive and artistic one.
 */
export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Enhance this image generation prompt to be more descriptive, artistic, and detailed, but keep it concise (under 50 words): "${originalPrompt}"`,
        });
        return response.text?.trim() || originalPrompt;
    });
};

/**
 * Generates images from text using Gemini 2.5 Flash Image or Gemini 3 Pro Image.
 */
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
            const ai = getAiClient(); // Key check happens here
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
            return handleApiResponse(response, 'image generation');
        });
    });

    return await Promise.all(promises);
};

/**
 * Generates a video using Veo 3.1.
 */
export const generateVideo = async (prompt: string, image?: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const model = 'veo-3.1-fast-generate-preview';
        
        let operation;
        if (image) {
            const imagePart = await fileToGenerativePart(image);
            if (!imagePart.inlineData) throw new Error("Failed to process image for video");
            
            operation = await ai.models.generateVideos({
                model,
                prompt,
                image: {
                    imageBytes: imagePart.inlineData.data,
                    mimeType: imagePart.inlineData.mimeType as any
                },
                config: { aspectRatio: '16:9' } 
            });
        } else {
            operation = await ai.models.generateVideos({
                model,
                prompt,
                config: { aspectRatio: '16:9' }
            });
        }

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        if (operation.error) throw new Error(operation.error.message);
        
        return operation.response?.generatedVideos?.[0]?.video?.uri || '';
    });
};

// --- Editing Tools ---

export const generateInpaintedImage = async (image: File, mask: File, prompt: string) => {
    return _generateImageEdit(image, `Inpaint/Replace the masked area: ${prompt}`, 'inpainting', mask);
};

export const generateRetouchImage = async (image: File, mask: File, prompt: string) => {
    return _generateImageEdit(image, `Retouch the masked area: ${prompt}`, 'retouch', mask);
};

export const generateSelectiveAdjustment = async (image: File, mask: File, prompt: string) => {
    return _generateImageEdit(image, `Apply this adjustment ONLY to the masked area: ${prompt}`, 'selective adjust', mask);
};

export const generateFilteredImage = async (image: File, filterPrompt: string) => {
    return _generateImageEdit(image, `Apply this filter/style to the image: ${filterPrompt}`, 'filter');
};

export const generateLuckyFilterImage = async (image: File) => {
    let specificPrompt = "Apply a creative, artistic, and visually stunning filter.";
    try {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    imagePart,
                    { text: "Analyze this image and suggest a single, specific, creative artistic filter style to transform it. Return ONLY the instruction text." }
                ]
            }
        });
        if (response.text) specificPrompt = response.text.trim();
    } catch (e) { console.warn(e); }

    return _generateImageEdit(image, specificPrompt, 'lucky filter');
};

export const generateAdjustedImage = async (image: File, adjustmentPrompt: string) => {
    return _generateImageEdit(image, `Adjust the image: ${adjustmentPrompt}`, 'adjustment');
};

export const generateExpandedImage = async (image: File, expansionPrompt: string) => {
    return _generateImageEdit(image, `Fill in the transparent areas to seamlessly expand the scene. ${expansionPrompt}`, 'expand');
};

export const generateUpscaledImage = async (image: File, scale: number) => {
    return _generateImageEdit(image, `Upscale this image by ${scale}x.`, 'upscale', undefined, 'gemini-3-pro-image-preview');
};

export const generateEnhancedImage = async (image: File, intensity: string) => {
    return _generateImageEdit(image, `Enhance the quality of this image (${intensity} intensity).`, 'enhance');
};

export const generateRestoredImage = async (image: File, prompt: string) => {
    return _generateImageEdit(image, `Restore this photo. ${prompt}`, 'restore');
};

export const generateRemovedBackgroundImage = async (image: File) => {
    return _generateImageEdit(image, "Remove the background.", 'remove bg');
};

export const generateReplacedBackgroundImage = async (image: File, prompt: string) => {
    return _generateImageEdit(image, `Replace the background with: ${prompt}`, 'replace bg');
};

export const generateProductBackgroundImage = async (image: File, name: string, customPrompt?: string) => {
    const p = customPrompt || `${name} setting`;
    return _generateImageEdit(image, `Place this product in a professional ${p}.`, 'product bg');
};

export const generateProductShadowImage = async (image: File) => {
    return _generateImageEdit(image, "Add a realistic shadow to ground the object.", 'product shadow');
};

export const generateAddedProductImage = async (image: File, mask: File, prompt: string) => {
    return _generateImageEdit(image, `Add ${prompt} into the masked area.`, 'add product', mask);
};

export const generateCardImage = async (image: File, cardPrompt: string) => {
    return _generateImageEdit(image, cardPrompt, 'cardify', undefined, 'gemini-3-pro-image-preview');
};

export const generateSketchImage = async (image: File, prompt: string) => {
    return _generateImageEdit(image, `Turn this sketch into a photorealistic image: ${prompt}`, 'sketch to image');
};

export const generateFocusImage = async (image: File, intensity: string) => {
    return _generateImageEdit(image, `Apply a ${intensity} depth of field (bokeh) effect.`, 'focus');
};

export const generateMergedImage = async (base: File, overlay: File, prompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const parts = [
            await fileToGenerativePart(base),
            await fileToGenerativePart(overlay),
            { text: `Merge these two images. ${prompt}` }
        ];
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts }
        });
        return handleApiResponse(response, 'merge');
    });
};

export const generateColorPalette = async (image: File): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    imagePart, 
                    { text: "Extract the 5 most dominant hex colors. Return ONLY JSON array." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const applyColorPalette = async (image: File, palette: string[], selectedColor: string) => {
    return _generateImageEdit(image, `Recolor the image using: ${palette.join(', ')}. Emphasize ${selectedColor}.`, 'apply palette');
};

export const generateRecoloredImage = async (image: File, source: string, target: string, tolerance: number) => {
    return _generateImageEdit(image, `Replace color ${source} with ${target} (tolerance ${tolerance}).`, 'recolor');
};

export const generateStyledImage = async (image: File, styleImage: File) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const parts = [
            await fileToGenerativePart(image),
            await fileToGenerativePart(styleImage),
            { text: "Apply style of second to first." }
        ];
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts }
        });
        return handleApiResponse(response, 'style transfer');
    });
};

export const generateCaptions = async (image: File): Promise<{captions: string[], sources: any[]}> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: {
                parts: [imagePart, { text: "Generate 3 creative captions." }]
            },
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        
        const lines = response.text?.split('\n').filter(l => l.trim().length > 0) || [];
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        return { captions: lines.slice(0, 3), sources };
    });
};

export const generateImageVariations = async (image: File, creativity: string): Promise<string[] | null> => {
    const prompt = `Generate 4 creative variations. Creativity: ${creativity}.`;
    const promises = Array(4).fill(null).map(async () => {
        return withRetry(async () => {
            const ai = getAiClient();
            const imagePart = await fileToGenerativePart(image);
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, { text: prompt }] }
            });
            return handleApiResponse(response, 'variation');
        });
    });
    return Promise.all(promises);
};

export const generatePromptSuggestions = async (image: File, context: 'add' | 'replace'): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const text = context === 'add' ? "Suggest 5 objects. Return JSON array." : "Suggest 5 modifications. Return JSON array.";
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
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
            contents: {
                parts: [imagePart, { text: `Generate ${type}. Return JSON {text, color}.` }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { text: { type: Type.STRING }, color: { type: Type.STRING } }
                }
            }
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
            contents: {
                parts: [imagePart, { text: `Detect "${label}". Return JSON array of {ymin, xmin, ymax, xmax}.` }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { ymin: { type: Type.NUMBER }, xmin: { type: Type.NUMBER }, ymax: { type: Type.NUMBER }, xmax: { type: Type.NUMBER } }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateSegmentationMask = async (image: File, label: string): Promise<string | null> => {
    return _generateImageEdit(image, `Mask for "${label}".`, 'mask');
};

export const generateExpansionSuggestions = async (image: File): Promise<Array<{ direction: 'top' | 'bottom' | 'left' | 'right', prompt: string }>> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: "Expansion ideas. Return JSON array {direction, prompt}." }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { direction: { type: Type.STRING }, prompt: { type: Type.STRING } }
                    }
                }
            }
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
            contents: {
                parts: [imagePart, { text: "Suggest adjustments. Return JSON." }]
            },
            config: { responseMimeType: "application/json" }
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
            contents: {
                parts: [imagePart, { text: "Unique adjustment prompt." }]
            }
        });
        return response.text || "Make it pop!";
    });
};

export const generateCardDetails = async (image: File, cardType: string): Promise<any> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: `Details for ${cardType} card. Return JSON.` }]
            },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
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
                    { text: "Inspect image. Return JSON {subject, style, composition, lighting, colors, prompt}." }
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
                        prompt: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

// --- Chat & Analysis ---

export async function* chatWithGeminiStream(
    history: { role: string, text: string }[], 
    message: string, 
    file?: File,
    useReasoning: boolean = false
) {
    const ai = getAiClient();
    const model = useReasoning ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    const chatHistory: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text } as Part]
    }));

    const chat = ai.chats.create({
        model: model,
        history: chatHistory
    });

    const parts: Part[] = [{ text: message }];
    if (file) {
        parts.unshift(await fileToGenerativePart(file));
    }

    const result = await chat.sendMessageStream({ message: parts });
    for await (const chunk of result) {
        yield { 
            text: chunk.text, 
            groundingMetadata: chunk.candidates?.[0]?.groundingMetadata 
        };
    }
}

export const analyzeVideo = async (videoFile: File, prompt: string): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const filePart = await fileToGenerativePart(videoFile);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [filePart, { text: prompt }] }
        });
        return response.text || "";
    });
};

export const transcribeAudio = async (audioFile: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const filePart = await fileToGenerativePart(audioFile);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [filePart, { text: "Transcribe." }] }
        });
        return response.text || "";
    });
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                }
            }
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        return bytes.buffer;
    });
};

export const generateSmartReplies = async (history: any[]): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Suggest 3 relevant replies based on context. Return JSON array.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateMemeSuggestions = async (image: File): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: "Generate 5 meme captions. Return JSON array." }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

async function _generateImageEdit(
    image: File, 
    prompt: string, 
    context: string,
    mask?: File,
    model: string = 'gemini-2.5-flash-image'
): Promise<string> {
    return withRetry(async () => {
        const ai = getAiClient();
        const parts: Part[] = [await fileToGenerativePart(image)];
        if (mask) parts.push(await fileToGenerativePart(mask));
        parts.push({ text: prompt });
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts },
            config: { safetySettings }
        });
        return handleApiResponse(response, context);
    });
}
