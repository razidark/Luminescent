
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
                 // After key selection, we must assume the new key is available and retry once.
                 return await fn(); 
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
            contents: `Enhance this image generation prompt for higher quality and artistic detail: "${originalPrompt}". Return only the enhanced text.`,
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

export const generateInpaintedImage = async (image: File, mask: File, prompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const maskPart = await fileToGenerativePart(mask);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [
                    imagePart, 
                    maskPart, 
                    { text: `Modify the area indicated by the mask. ${prompt ? `Follow this instruction: ${prompt}` : 'Remove any objects or imperfections in this area and fill it seamlessly based on the surrounding scene.'}` }
                ]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'inpainting');
    });
};

export const generateRetouchImage = async (image: File, mask: File, prompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const maskPart = await fileToGenerativePart(mask);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [
                    imagePart, 
                    maskPart, 
                    { text: `Perform a professional retouching on the selected area: ${prompt}` }
                ]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'retouch');
    });
};

export const generateSelectiveAdjustment = async (image: File, mask: File, prompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const maskPart = await fileToGenerativePart(mask);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [
                    imagePart, 
                    maskPart, 
                    { text: `Apply this selective adjustment to the masked area: ${prompt}` }
                ]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'selective adjust');
    });
};

// FIX: Added missing exported functions required by AdjustmentPanel, CardifyPanel, and EditorContext

export const generateAutoAdjustments = async (image: File) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    imagePart,
                    { text: "Analyze this image and suggest professional photo adjustments. Return JSON with values from -100 to 100 for: brightness, contrast, saturation, highlights, shadows, vibrance, temperature, sharpness." }
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
                        sharpness: { type: Type.NUMBER }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const generateLuckyAdjustment = async (image: File) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    imagePart,
                    { text: "Suggest a single, creative, and highly impactful 'feeling lucky' AI adjustment for this photo. Describe it in one clear sentence that can be used as a prompt for an image editing AI." }
                ]
            }
        });
        return response.text?.trim() || "Enhance the colors and lighting for a professional look.";
    });
};

export const generateCardDetails = async (image: File, cardType: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: {
                parts: [
                    imagePart,
                    { text: `Create creative trading card details for this image as a ${cardType} card. Return a JSON object with appropriate fields (name, description, hp, atk, def, etc.).` }
                ]
            },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const generateFilteredImage = async (image: File, filterPrompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: `Apply this artistic filter to the image: ${filterPrompt}.` }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'filter');
    });
};

export const generateLuckyFilterImage = async (image: File) => {
    const luckyPrompt = await generateLuckyAdjustment(image);
    return generateFilteredImage(image, luckyPrompt);
};

export const generateAdjustedImage = async (image: File, adjustmentPrompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: `Apply these professional photo adjustments: ${adjustmentPrompt}.` }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'adjustment');
    });
};

export const generateExpandedImage = async (image: File, expansionPrompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: `Expand the canvas of this image. Fill new areas seamlessly based on: ${expansionPrompt || 'surrounding content'}.` }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'expansion');
    });
};

export const generateUpscaledImage = async (image: File, scale: number) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: {
                parts: [imagePart, { text: `Upscale and enhance this image ${scale}x while preserving original content perfectly.` }]
            },
            config: { 
                imageConfig: { imageSize: scale >= 4 ? "4K" : "2K" },
                safetySettings 
            }
        });
        return handleApiResponse(response, 'upscale');
    });
};

export const generateEnhancedImage = async (image: File, intensity: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: `Professionally enhance this image with ${intensity} intensity.` }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'enhance');
    });
};

export const generateRestoredImage = async (image: File, restorationPrompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: `Restore this old photo: ${restorationPrompt}.` }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'restoration');
    });
};

export const generateRemovedBackgroundImage = async (image: File) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: "Remove the background from this image, leaving only the main subject." }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'background removal');
    });
};

export const generateReplacedBackgroundImage = async (image: File, backgroundPrompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: `Replace the background with: ${backgroundPrompt}.` }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'background replacement');
    });
};

export const generateProductBackgroundImage = async (image: File, name: string, customPrompt?: string) => {
    const prompt = customPrompt || `a professional studio product shot with a ${name} theme.`;
    return generateReplacedBackgroundImage(image, prompt);
};

export const generateProductShadowImage = async (image: File) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: "Add a realistic contact shadow underneath the subject." }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'shadow');
    });
};

export const generateAddedProductImage = async (image: File, mask: File, productPrompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const maskPart = await fileToGenerativePart(mask);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, maskPart, { text: `Add this object to the masked area: ${productPrompt}.` }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'add object');
    });
};

export const generateCardImage = async (image: File, cardPrompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: {
                parts: [imagePart, { text: cardPrompt }]
            },
            config: { 
                imageConfig: { aspectRatio: "3:4" },
                safetySettings 
            }
        });
        return handleApiResponse(response, 'cardify');
    });
};

export const generateMemeSuggestions = async (image: File): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: {
                parts: [imagePart, { text: "Generate 5 funny meme captions for this image. Return a JSON array of strings." }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
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
            contents: {
                parts: [imagePart, { text: "Extract a 5-color hex palette from this image. Return a JSON array of strings." }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const applyColorPalette = async (image: File, palette: string[], selectedColor: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: `Color grade this image using this palette: ${palette.join(', ')}, highlighting ${selectedColor}.` }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'palette');
    });
};

export const generateRecoloredImage = async (image: File, sourceColor: string, targetColor: string, tolerance: number) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: `Change the color ${sourceColor} to ${targetColor} with a tolerance of ${tolerance}.` }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'recolor');
    });
};

export const generateStyledImage = async (image: File, styleImage: File) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const stylePart = await fileToGenerativePart(styleImage);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, stylePart, { text: "Apply the artistic style of the second image to the first image." }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'style');
    });
};

export const generateCaptions = async (image: File): Promise<{ captions: string[], sources: any[] }> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: "Generate a detailed description and 3 creative captions for this image using Google Search. Return JSON with 'description', 'captions' (array)." }]
            },
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        captions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        const data = JSON.parse(response.text || "{}");
        return {
            captions: data.captions || [],
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
        };
    });
};

export const generateImageVariations = async (image: File, creativity: 'low' | 'medium' | 'high'): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: `Generate a variation of this image with ${creativity} creativity level.` }]
            },
            config: { safetySettings }
        });
        return [handleApiResponse(response, 'variation')];
    });
};

export const generatePromptSuggestions = async (image: File, context: 'add' | 'replace'): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: `Suggest 3 ideas for ${context === 'add' ? 'adding objects' : 'replacing elements'}. Return a JSON array of strings.` }]
            },
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
                parts: [imagePart, { text: `Generate a creative ${type} and a suitable contrasting text color. Return JSON with 'text' and 'color'.` }]
            },
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
        return JSON.parse(response.text || "{}");
    });
};

export const detectObjects = async (image: File, label: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: `Detect bounding boxes for "${label}" in normalized coordinates [ymin, xmin, ymax, xmax] (0-1000). Return a JSON array of objects with 'box_2d'.` }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            box_2d: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                        }
                    }
                }
            }
        });
        const items = JSON.parse(response.text || "[]");
        return items.map((i: any) => ({
            ymin: i.box_2d[0], xmin: i.box_2d[1], ymax: i.box_2d[2], xmax: i.box_2d[3]
        }));
    });
};

export const generateSegmentationMask = async (image: File, label: string): Promise<string | null> => {
    const boxes = await detectObjects(image, label);
    if (boxes.length === 0) return null;
    
    const img = await new Promise<HTMLImageElement>((resolve) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.src = URL.createObjectURL(image);
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    boxes.forEach(box => {
        ctx.fillRect((box.xmin / 1000) * canvas.width, (box.ymin / 1000) * canvas.height, ((box.xmax - box.xmin) / 1000) * canvas.width, ((box.ymax - box.ymin) / 1000) * canvas.height);
    });
    
    URL.revokeObjectURL(img.src);
    return canvas.toDataURL('image/png');
};

export const generateExpansionSuggestions = async (image: File): Promise<Array<{ direction: 'top' | 'bottom' | 'left' | 'right', prompt: string }>> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: "Suggest 4 directions and prompts for expanding this image. Return a JSON array of objects with 'direction' and 'prompt'." }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            direction: { type: Type.STRING },
                            prompt: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateSketchImage = async (compositedImage: File, prompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(compositedImage);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: `Render this sketch and base image together as: ${prompt}.` }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'sketch');
    });
};

export const generateFocusImage = async (image: File, intensity: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [imagePart, { text: `Add ${intensity} background bokeh blur.` }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'focus');
    });
};

export const generateMergedImage = async (image1: File, image2: File, mergePrompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const part1 = await fileToGenerativePart(image1);
        const part2 = await fileToGenerativePart(image2);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [part1, part2, { text: mergePrompt }]
            },
            config: { safetySettings }
        });
        return handleApiResponse(response, 'merge');
    });
};

export async function* chatWithGeminiStream(history: {role: string, text: string}[], message: string, file?: File, useReasoning?: boolean) {
    const ai = getAiClient();
    const model = useReasoning ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    const contents: any[] = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
    }));
    const currentParts: any[] = [];
    if (message) currentParts.push({ text: message });
    if (file) currentParts.push(await fileToGenerativePart(file));
    if (currentParts.length > 0) contents.push({ role: 'user', parts: currentParts });

    const response = await ai.models.generateContentStream({
        model,
        contents,
        config: { tools: [{ googleSearch: {} }], safetySettings }
    });

    for await (const chunk of response) {
        yield { text: chunk.text, groundingMetadata: chunk.candidates?.[0]?.groundingMetadata };
    }
}

export const analyzeVideo = async (videoFile: File, prompt: string): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const videoPart = await fileToGenerativePart(videoFile);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [videoPart, { text: prompt || "Describe this video." }] }
        });
        return response.text || "Analysis failed.";
    });
};

export const transcribeAudio = async (audioFile: File): Promise<string> => {
     return withRetry(async () => {
        const ai = getAiClient();
        const audioPart = await fileToGenerativePart(audioFile);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [audioPart, { text: "Transcribe this audio precisely." }] }
        });
        return response.text || "Transcription failed.";
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
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio.");
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        return bytes;
    });
};

export const generateSmartReplies = async (history: {role: string, text: string}[]): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
                { role: 'user', parts: [{ text: "Based on the chat, suggest 3 smart replies. Return JSON array." }] }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};
