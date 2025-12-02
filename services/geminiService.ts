
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

// Ensure we always get a fresh client instance to pick up any environment changes (e.g. from key selector)
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        // Handle Permission Denied explicitly
        // This usually happens when accessing restricted models (Veo, Imagen) without a proper billing project
        if (error.status === 403 || error.message?.includes('403') || error.message?.includes('PERMISSION_DENIED')) {
             throw new Error("Access Denied (403): The API key provided does not have permission to access this model. Please check your API key settings, ensure billing is enabled for paid models (like Veo/Imagen), or verify the key has access to the Generative Language API.");
        }

        // Retry on rate limits (429) or server errors (5xx)
        if (retries > 0 && (error.status === 429 || error.status >= 500 || error.message?.includes('429'))) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        
        throw error;
    }
}

// --- Core Editing Logic ---

/**
 * Helper function for basic image-to-image editing tasks using Gemini models.
 * @param image - The source image file.
 * @param prompt - The instruction for the edit.
 * @param context - A label for error logging (e.g., 'inpainting').
 * @param mask - Optional mask file for targeted editing.
 * @param model - The specific Gemini model to use (defaults to 'gemini-2.5-flash-image').
 */
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
        if (mask) {
            parts.push(await fileToGenerativePart(mask));
        }
        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts },
            config: { safetySettings }
        });

        return handleApiResponse(response, context);
    });
}

// --- Exported Service Functions ---

/**
 * Uses Gemini Flash to rewrite a user's simple prompt into a more descriptive and artistic one.
 * @param originalPrompt - The user's input prompt.
 * @returns A refined, more detailed prompt string.
 */
export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Enhance this image generation prompt to be more descriptive, artistic, and detailed, but keep it concise (under 50 words): "${originalPrompt}"`,
        });
        return response.text?.trim() || originalPrompt;
    });
};

/**
 * Generates images from text using Gemini 2.5 Flash Image or Gemini 3 Pro Image.
 * @param prompt - The text description.
 * @param numImages - Number of images to generate (sequential requests).
 * @param aspectRatio - The desired aspect ratio (e.g., '16:9').
 * @param quality - 'pro' uses `gemini-3-pro-image-preview` (high res), 'standard' uses `gemini-2.5-flash-image` (faster).
 * @param imageSize - Resolution setting for the Pro model ('1K', '2K', '4K').
 * @returns Array of base64 data URLs.
 */
export const generateImages = async (
    prompt: string, 
    numImages: number, 
    aspectRatio: string, 
    quality: 'standard' | 'pro', 
    imageSize: string
): Promise<string[]> => {
    const ai = getAiClient();
    const model = quality === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    // Note: The SDK currently returns one candidate per request for image models in many cases.
    // We loop to generate multiple images if needed.
    const promises = Array(numImages).fill(null).map(async () => {
        return withRetry(async () => {
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
 * @param prompt - Text description of the video.
 * @param image - Optional starting image for image-to-video animation.
 * @returns A signed URL to the generated MP4 video.
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
                config: { aspectRatio: '16:9' } // Default for Veo
            });
        } else {
            operation = await ai.models.generateVideos({
                model,
                prompt,
                config: { aspectRatio: '16:9' }
            });
        }

        // Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        if (operation.error) throw new Error(operation.error.message);
        
        return operation.response?.generatedVideos?.[0]?.video?.uri || '';
    });
};

// --- Editing Tools ---

/**
 * Performs inpainting to replace a masked area with content described by the prompt.
 */
export const generateInpaintedImage = async (image: File, mask: File, prompt: string) => {
    return _generateImageEdit(image, `Inpaint/Replace the masked area: ${prompt}`, 'inpainting', mask);
};

/**
 * Retouches a masked area (e.g., skin smoothing) based on the prompt instructions.
 */
export const generateRetouchImage = async (image: File, mask: File, prompt: string) => {
    return _generateImageEdit(image, `Retouch the masked area: ${prompt}`, 'retouch', mask);
};

/**
 * Applies adjustments (e.g., brightness, color) only to the masked area.
 */
export const generateSelectiveAdjustment = async (image: File, mask: File, prompt: string) => {
    return _generateImageEdit(image, `Apply this adjustment ONLY to the masked area: ${prompt}`, 'selective adjust', mask);
};

/**
 * Applies a global artistic filter or style to the image.
 */
export const generateFilteredImage = async (image: File, filterPrompt: string) => {
    return _generateImageEdit(image, `Apply this filter/style to the image: ${filterPrompt}`, 'filter');
};

/**
 * Analyzes the image to suggest and apply a creative filter automatically.
 * Uses Gemini Flash for text reasoning followed by image generation.
 */
export const generateLuckyFilterImage = async (image: File) => {
    // FIX: Generate a specific creative prompt first to prevent the model from just returning text conversationally.
    let specificPrompt = "Apply a creative, artistic, and visually stunning filter.";
    
    try {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        // We use the flash model for fast text reasoning
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    imagePart,
                    { text: "Analyze this image and suggest a single, specific, creative artistic filter style to transform it (e.g., 'Apply a neon cyberpunk aesthetic', 'Turn it into a Van Gogh painting', 'Make it look like a 1920s film'). Return ONLY the instruction text for the edit." }
                ]
            }
        });
        if (response.text) {
            specificPrompt = response.text.trim();
        }
    } catch (e) {
        console.warn("Could not generate lucky prompt, using default.", e);
    }

    return _generateImageEdit(image, specificPrompt, 'lucky filter');
};

/**
 * Applies global adjustments like brightness, contrast, or HDR effects.
 */
export const generateAdjustedImage = async (image: File, adjustmentPrompt: string) => {
    return _generateImageEdit(image, `Adjust the image: ${adjustmentPrompt}`, 'adjustment');
};

/**
 * Performs generative outpainting/expansion on transparent areas of an image.
 */
export const generateExpandedImage = async (image: File, expansionPrompt: string) => {
    return _generateImageEdit(image, `Fill in the transparent areas to seamlessly expand the scene. ${expansionPrompt}`, 'expand');
};

/**
 * Upscales the image using Gemini 3 Pro Image Preview model for high detail.
 */
export const generateUpscaledImage = async (image: File, scale: number) => {
    return _generateImageEdit(image, `Upscale this image by ${scale}x, increasing resolution and detail while preserving the original content.`, 'upscale', undefined, 'gemini-3-pro-image-preview');
};

/**
 * Enhances image quality (sharpness, lighting) with varying intensity levels.
 */
export const generateEnhancedImage = async (image: File, intensity: string) => {
    return _generateImageEdit(image, `Enhance the quality of this image (${intensity} intensity). Improve sharpness, lighting, and details.`, 'enhance');
};

/**
 * Restores old or damaged photos based on specific instructions (scratches, colorization).
 */
export const generateRestoredImage = async (image: File, prompt: string) => {
    return _generateImageEdit(image, `Restore this photo. ${prompt}`, 'restore');
};

/**
 * Removes the background, leaving the subject on a transparent layer.
 */
export const generateRemovedBackgroundImage = async (image: File) => {
    return _generateImageEdit(image, "Remove the background, leaving only the main subject on a transparent background.", 'remove bg');
};

/**
 * Replaces the background with a new scene described by the prompt.
 */
export const generateReplacedBackgroundImage = async (image: File, prompt: string) => {
    return _generateImageEdit(image, `Replace the background with: ${prompt}`, 'replace bg');
};

/**
 * Generates a professional product photography background.
 */
export const generateProductBackgroundImage = async (image: File, name: string, customPrompt?: string) => {
    const p = customPrompt || `${name} setting`;
    return _generateImageEdit(image, `Place this product in a professional ${p}.`, 'product bg');
};

/**
 * Adds a realistic shadow to an isolated object.
 */
export const generateProductShadowImage = async (image: File) => {
    return _generateImageEdit(image, "Add a realistic shadow to ground the object.", 'product shadow');
};

/**
 * Adds a new object into a masked area, blending it with the scene.
 */
export const generateAddedProductImage = async (image: File, mask: File, prompt: string) => {
    return _generateImageEdit(image, `Add ${prompt} into the masked area, blending it seamlessly with the scene lighting and perspective.`, 'add product', mask);
};

/**
 * Renders the image onto a trading card template using Gemini 3 Pro for high-fidelity text.
 */
export const generateCardImage = async (image: File, cardPrompt: string) => {
    // Uses Pro model for high fidelity text rendering on cards
    return _generateImageEdit(image, cardPrompt, 'cardify', undefined, 'gemini-3-pro-image-preview');
};

/**
 * Converts a rough sketch into a photorealistic image based on a prompt.
 */
export const generateSketchImage = async (image: File, prompt: string) => {
    return _generateImageEdit(image, `Turn this sketch into a photorealistic image: ${prompt}`, 'sketch to image');
};

/**
 * Applies a depth-of-field (bokeh) effect to the image.
 */
export const generateFocusImage = async (image: File, intensity: string) => {
    return _generateImageEdit(image, `Apply a ${intensity} depth of field (bokeh) effect, blurring the background while keeping the subject sharp.`, 'focus');
};

/**
 * Merges two images together based on a text instruction.
 * @param base - The primary image.
 * @param overlay - The secondary image to merge.
 * @param prompt - Instructions on how to blend them.
 */
export const generateMergedImage = async (base: File, overlay: File, prompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const parts = [
            await fileToGenerativePart(base),
            await fileToGenerativePart(overlay),
            { text: `Merge these two images. ${prompt} Return the single merged image.` }
        ];
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts }
        });
        return handleApiResponse(response, 'merge');
    });
};

/**
 * Extracts a color palette from the image using the multimodal model.
 * Returns a JSON array of hex codes.
 */
export const generateColorPalette = async (image: File): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    imagePart, 
                    { text: "Extract the 5 most dominant and harmonious hex color codes from this image. Return ONLY a JSON array of strings." }
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

/**
 * Applies a color palette to the image using the AI model.
 */
export const applyColorPalette = async (image: File, palette: string[], selectedColor: string) => {
    return _generateImageEdit(image, `Recolor the image using this palette: ${palette.join(', ')}. Emphasize ${selectedColor}.`, 'apply palette');
};

/**
 * Replaces a specific source color with a target color within a tolerance range.
 */
export const generateRecoloredImage = async (image: File, source: string, target: string, tolerance: number) => {
    return _generateImageEdit(image, `Replace the color ${source} with ${target} (tolerance ${tolerance}).`, 'recolor');
};

/**
 * Applies the artistic style of one image to another (Style Transfer).
 */
export const generateStyledImage = async (image: File, styleImage: File) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const parts = [
            await fileToGenerativePart(image),
            await fileToGenerativePart(styleImage),
            { text: "Apply the artistic style of the second image to the first image. Return the stylized image." }
        ];
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts }
        });
        return handleApiResponse(response, 'style transfer');
    });
};

/**
 * Generates captions for an image using Gemini 3 Pro with Search Grounding enabled.
 */
export const generateCaptions = async (image: File): Promise<{captions: string[], sources: any[]}> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        // Use gemini-3-pro-preview for grounding
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: {
                parts: [imagePart, { text: "Generate 3 creative captions for this image." }]
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

/**
 * Generates creative variations of an image.
 */
export const generateImageVariations = async (image: File, creativity: string): Promise<string[] | null> => {
    // Generate 4 variations
    const prompt = `Generate 4 creative variations of this image. Creativity level: ${creativity}.`;
    
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

/**
 * Generates suggested prompts for adding objects or replacing content.
 */
export const generatePromptSuggestions = async (image: File, context: 'add' | 'replace'): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const text = context === 'add' 
            ? "Suggest 5 objects that would look natural added to this scene. Return JSON array of strings."
            : "Suggest 5 creative ways to replace or modify objects in this image. Return JSON array of strings.";
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text }] },
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

/**
 * Generates text overlays (quotes, puns) based on image content.
 */
export const generateCreativeText = async (image: File, type: 'quote' | 'caption' | 'pun'): Promise<{ text: string, color: string }> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [imagePart, { text: `Generate a creative ${type} for this image and suggest a contrasting hex color for the text. Return JSON: { "text": "...", "color": "#..." }` }]
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
        return JSON.parse(response.text || '{"text": "", "color": "#ffffff"}');
    });
};

/**
 * Detects objects in an image and returns bounding boxes.
 */
export const detectObjects = async (image: File, label: string): Promise<Array<{ ymin: number, xmin: number, ymax: number, xmax: number }>> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [imagePart, { text: `Detect bounding boxes for "${label}". Return a JSON array of objects with keys: ymin, xmin, ymax, xmax (values 0-1000).` }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            ymin: { type: Type.NUMBER },
                            xmin: { type: Type.NUMBER },
                            ymax: { type: Type.NUMBER },
                            xmax: { type: Type.NUMBER },
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

/**
 * Generates a segmentation mask visualization for a specific object label.
 */
export const generateSegmentationMask = async (image: File, label: string): Promise<string | null> => {
    // This asks the model to visualize the mask.
    return _generateImageEdit(image, `Generate a black and white segmentation mask for "${label}". White pixels = ${label}, Black = background.`, 'mask');
};

/**
 * Analyzes the image to suggest creative outpainting directions.
 */
export const generateExpansionSuggestions = async (image: File): Promise<Array<{ direction: 'top' | 'bottom' | 'left' | 'right', prompt: string }>> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [imagePart, { text: "Analyze the image and suggest 3 creative outpainting/expansion ideas with directions. Return JSON array of objects: { direction, prompt }." }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            direction: { type: Type.STRING, enum: ['top', 'bottom', 'left', 'right'] },
                            prompt: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

/**
 * Generates automatic adjustment values (brightness, contrast, etc.) for an image.
 */
export const generateAutoAdjustments = async (image: File): Promise<Record<string, number>> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [imagePart, { text: "Analyze this image and suggest adjustments values (-100 to 100) for brightness, contrast, saturation, etc. Return JSON." }]
            },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    });
};

/**
 * Suggests a unique creative prompt for adjustment ("Feeling Lucky").
 */
export const generateLuckyAdjustment = async (image: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [imagePart, { text: "Suggest a creative and unique adjustment prompt for this image." }]
            }
        });
        return response.text || "Make it pop!";
    });
};

/**
 * Analyzes an image to populate trading card details (stats, name, flavor text).
 */
export const generateCardDetails = async (image: File, cardType: string): Promise<any> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [imagePart, { text: `Analyze this image and generate details for a ${cardType} trading card. Return JSON keys suitable for that game.` }]
            },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    });
};

// --- Chat & Analysis ---

/**
 * Streams chat responses from Gemini.
 * @param history - Previous chat messages.
 * @param message - New user message.
 * @param file - Optional file attachment.
 * @param useReasoning - Whether to use `gemini-3-pro-preview` (true) or `gemini-2.5-flash` (false).
 */
export async function* chatWithGeminiStream(
    history: { role: string, text: string }[], 
    message: string, 
    file?: File,
    useReasoning: boolean = false
) {
    const ai = getAiClient();
    const model = useReasoning ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
    
    // Convert history to compatible format with explicit Part typing
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

/**
 * Analyzes a video file to describe its content.
 */
export const analyzeVideo = async (videoFile: File, prompt: string): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        
        if (videoFile.size > 20 * 1024 * 1024) throw new Error("Video too large for inline analysis.");
        
        const filePart = await fileToGenerativePart(videoFile);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [filePart, { text: prompt }] }
        });
        return response.text || "";
    });
};

/**
 * Transcribes an audio file.
 */
export const transcribeAudio = async (audioFile: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const filePart = await fileToGenerativePart(audioFile);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [filePart, { text: "Transcribe this audio." }] }
        });
        return response.text || "";
    });
};

/**
 * Generates spoken audio from text using `gemini-2.5-flash-preview-tts`.
 * @returns ArrayBuffer of the audio data.
 */
export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: { parts: [{ text }] },
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
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    });
};

/**
 * Generates smart reply suggestions for the chat context.
 */
export const generateSmartReplies = async (history: any[]): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const context = history.slice(-3).map(h => `${h.role}: ${h.text}`).join('\n');
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on this chat context, suggest 3 short, relevant replies for the user.\n${context}`,
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

/**
 * Generates meme captions for an image.
 */
export const generateMemeSuggestions = async (image: File): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [imagePart, { text: "Generate 5 funny meme captions for this image." }]
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
