/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality, Type, HarmBlockThreshold, HarmCategory, Content, Part } from "@google/genai";
import { processImageWithWorker } from "../utils/helpers";

export class ApiMultimodalError extends Error {
    constructor(message: string, public originalError?: any) {
        super(message);
        this.name = 'ApiMultimodalError';
        if (message.includes('IMAGE_OUTPUT_NOT_SUPPORTED') || message.includes('Modality IMAGE')) {
            this.message = 'IMAGE_OUTPUT_NOT_SUPPORTED';
        }
    }
}

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

// Helper function for retrying async operations with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries === 0) throw error;

        // Log retry attempt
        console.warn(`API call failed. Retrying in ${delay}ms... (${retries} attempts left). Error: ${error.message}`);

        // Wait for the specified delay
        await new Promise(resolve => setTimeout(resolve, delay));

        // Recursive call with decremented retries and increased delay
        return withRetry(fn, retries - 1, delay * 2);
    }
}

// Consolidated Helper: Converts a File to the inlineData format required by GoogleGenAI
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
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

    const mimeType = mimeMatch[1];
    const data = arr[1];
    return { inlineData: { mimeType, data } };
};

// Retrieve the user's personal API key from local settings; never bundle it at build time.
export const getApiKey = (): string => {
    const storedKey = typeof window !== 'undefined'
        ? window.localStorage.getItem('luminescent_api_key')?.trim()
        : '';
    if (!storedKey) {
        throw new Error("API_KEY_REQUIRED: Add your personal Gemini API key in Settings.");
    }
    return storedKey;
};

// Deprecated: Aliased to new helper to prevent breakage if called elsewhere, 
// though internal usage should be migrated.
const fileToPart = fileToGenerativePart;

const handleApiResponse = (
    response: GenerateContentResponse,
    context: string // e.g., "edit", "filter", "adjustment"
): string => {
    // 1. Check for prompt blocking first
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }

    // 2. Try to find the image part
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        console.log(`Received image data (${mimeType}) for ${context}`);
        return `data:${mimeType};base64,${data}`;
    }

    // 3. If no image, check for other reasons
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation for ${context} stopped unexpectedly. Reason: ${finishReason}. This often relates to safety filters.`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }

    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image for the ${context}. ` +
        (textFeedback
            ? `The model responded with text: "${textFeedback}"`
            : "This can happen due to safety filters or if the request is too complex. Please try rephrasing your prompt to be more direct.");

    console.error(`Model response did not contain an image part for ${context}.`, { response });
    throw new Error(errorMessage);
};

// Internal helper for generic image editing calls with smart model mapping
const _generateImageEdit = async (
    parts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[],
    context: string,
    modelName: string = 'gemini-2.0-flash',
    additionalConfig: any = {}
): Promise<string> => {
    return withRetry(async () => {
        const apiKey = getApiKey();
        // Use v1beta for advanced multimodal features like image output
        const genAI = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

        // Map non-standard or versioned models to valid ones available in the environment
        const imageCapableModels = [
            'gemini-3.1-flash-image-preview', 
            'gemini-3.1-pro-preview', 
            'gemini-3-pro-image-preview',
            'gemini-2.5-flash-image',
            'gemini-2.0-flash',
            'imagen-3.0-generate-002',
            'veo-2.0-generate-001'
        ];
        let actualModelName = modelName;
        const lowerName = modelName.toLowerCase();

        // Precise mapping for current v1beta endpoints
        if (lowerName.includes('imagen-3') || lowerName.includes('imagen')) {
            actualModelName = 'imagen-3.0-generate-002';
        } else if (lowerName.includes('veo-2') || lowerName.includes('veo')) {
            actualModelName = 'veo-2.0-generate-001';
        } else if (lowerName.includes('3.1-flash-image')) {
            actualModelName = 'imagen-3.0-generate-002';
        } else if (lowerName.includes('3.1-pro') || lowerName.includes('3-pro')) {
            actualModelName = 'imagen-3.0-generate-002';
        } else if (lowerName.includes('2.5-flash') || lowerName.includes('2.0-flash')) {
            actualModelName = 'imagen-3.0-generate-002';
        } else if (lowerName.includes('2.5-pro')) {
            actualModelName = 'imagen-3.0-generate-002';
        } else if (lowerName.includes('1.5-pro')) {
            actualModelName = 'imagen-3.0-generate-002';
        } else if (lowerName.includes('1.5-flash')) {
            actualModelName = 'imagen-3.0-generate-002';
        }

        // Check if the current model is actually capable of image output
        const isImageModel = imageCapableModels.includes(actualModelName);
        if (!isImageModel) {
            console.warn(`Model ${actualModelName} does not support image output. Falling back to IMAGE_OUTPUT_NOT_SUPPORTED logic.`);
            throw new Error(`IMAGE_OUTPUT_NOT_SUPPORTED: The model "${actualModelName}" does not support image generation. Please switch to an "Image" capable model (like Gemini 3.1 Flash Image) in AI Settings.`);
        }

        console.log(`Sending image edit/generation request for ${context} using ${actualModelName} (v1beta)...`);

        const config: any = {
            ...additionalConfig
        };

        try {
            const result = await genAI.models.generateContent({
                model: actualModelName,
                contents: [{ role: 'user', parts: parts as any }],
                config: {
                    responseModalities: ["IMAGE"] as any,
                    safetySettings: safetySettings as any,
                    ...config
                },
            });

            console.log(`Received response from model for ${context}.`, result);
            return handleApiResponse(result as any, context);
        } catch (err: any) {
            console.error(`API Error in _generateImageEdit for ${context}:`, err);
            
            // Helpful errors for humans
            const msg = err.message || "";

            // Intelligent Fallback: If 404 or Quota Error, try a different model
            if ((msg.includes('not found') || msg.includes('404') || msg.includes('429') || msg.includes('quota')) && actualModelName !== 'gemini-3-pro-image-preview') {
                console.info(`[Fallback] Model ${actualModelName} failed (${msg.includes('429') ? 'Quota' : '404'}). Trying fallback model gemini-3-pro-image-preview...`);
                return _generateImageEdit(parts, context, 'gemini-3-pro-image-preview', additionalConfig);
            }

            if (msg.includes('not found') || msg.includes('404')) {
                throw new Error(`MODEL_NOT_FOUND: The model "${actualModelName}" was not found or is restricted. Please check your AI Studio settings or try a different model.`);
            }
            // Be more specific: only throw IMAGE_OUTPUT_NOT_SUPPORTED if the error specifically mentions modality
            if (msg.includes('modality')) {
                throw new Error(`IMAGE_OUTPUT_NOT_SUPPORTED: The model "${actualModelName}" could not output an image for this request. Please ensure you are using an "Image" capable model or a v1beta endpoint.`);
            }
            // Pass through quota or other errors as they are
            throw err;
        }
    });
};


/**
 * Generates an inpainted image using a mask and an optional prompt.
 */
export const generateFocusImage = async (
    originalImage: File,
    intensity: 'subtle' | 'medium' | 'strong',
    modelName?: string
): Promise<string> => {
    if (!originalImage) return '';
    const imgPart = await fileToGenerativePart(originalImage);
    const prompt = `Adjust focus intensity to ${intensity}. Blur background smoothly.`;
    return _generateImageEdit([imgPart, { text: prompt }], 'focus', modelName);
};

export const generateInpaintedImage = async (
    originalImage: File,
    maskImage: File,
    userPrompt: string,
    modelName?: string
): Promise<string> => {
    console.log('Starting generative inpainting with prompt:', userPrompt);
    const originalImagePart = await fileToGenerativePart(originalImage);
    const maskImagePart = await fileToGenerativePart(maskImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, localized edit on the provided image based on a mask and user's request.
The user has provided an image and a mask. The black area of the mask indicates the region to be modified.

User Request: "${userPrompt || 'Realistically remove the object in the masked area and fill it in with the surrounding background.'}"

Editing Guidelines:
- The edit must be realistic and blend seamlessly with the surrounding area.
- The area outside the mask must remain identical to the original image.
- If the user prompt is empty, your task is object removal. Fill the masked area by realistically extending the surrounding textures and lighting.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final edited image. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart, maskImagePart], 'inpainting', modelName);
};

/**
 * Adds a new object to an image based on a mask and prompt.
 */
export const generateAddedProductImage = async (
    originalImage: File,
    maskImage: File,
    userPrompt: string,
    modelName?: string
): Promise<string> => {
    console.log('Starting add product with prompt:', userPrompt);
    const originalImagePart = await fileToGenerativePart(originalImage);
    const maskImagePart = await fileToGenerativePart(maskImage);
    const prompt = `You are an expert photo editor AI. Your task is to seamlessly add a new object to the provided image based on a mask and a user's request.
The user has provided an image and a mask. The black area of the mask indicates the region where the new object should be placed.

User Request: "${userPrompt}"

Editing Guidelines:
- The new object must be realistic and blend seamlessly with the surrounding area, matching the lighting, shadows, perspective, and style of the original photo.
- The area outside the mask must remain identical to the original image.

Output: Return ONLY the final edited image. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart, maskImagePart], 'add product', modelName);
};


/**
 * Applies a selective adjustment or filter to a masked area of an image.
 */
export const generateSelectiveAdjustment = async (
    originalImage: File,
    maskImage: File,
    userPrompt: string,
    modelName?: string
): Promise<string> => {
    console.log('Starting selective adjustment with prompt:', userPrompt);
    const originalImagePart = await fileToGenerativePart(originalImage);
    const maskImagePart = await fileToGenerativePart(maskImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a localized visual adjustment or apply a stylistic filter to a specific part of an image.

The user has provided an image and a mask. The black area of the mask indicates the region to be modified.

User Request: "${userPrompt}"

Editing Guidelines:
- You must apply the requested visual change ONLY to the masked area.
- DO NOT alter the underlying content, objects, or textures within the masked area. For example, if the user asks to "make the car red", you change the car's color to red but you do not replace the car with a different model.
- The area outside the mask must remain IDENTICAL to the original image.
- The transition between the edited and unedited areas must be seamless and natural.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final edited image. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart, maskImagePart], 'selective adjustment', modelName);
};

/**
 * Applies a specific retouching operation to a masked area of an image.
 */
export const generateRetouchImage = async (
    originalImage: File,
    maskImage: File,
    userPrompt: string,
    modelName?: string
): Promise<string> => {
    console.log('Starting AI retouch with prompt:', userPrompt);
    const originalImagePart = await fileToGenerativePart(originalImage);
    const maskImagePart = await fileToGenerativePart(maskImage);
    const prompt = `You are a world-class AI portrait retouching artist. Your task is to perform subtle, professional-grade edits on a specific part of an image.

The user has provided an image and a mask. The black area of the mask indicates the region to be modified.

User Request: "${userPrompt}"

Retouching Guidelines:
- Realism is paramount. Edits must be subtle and preserve natural textures (e.g., skin pores, hair strands). Avoid an "airbrushed" or artificial look.
- Apply the requested visual change ONLY to the masked area.
- DO NOT alter the underlying content, objects, or core features. For example, if smoothing skin, do not change the shape of the nose or eyes.
- The area outside the mask must remain IDENTICAL to the original image.
- The transition between the edited and unedited areas must be seamless.

Common Task Interpretations:
- "Remove Blemishes": Naturally remove pimples, scars, or temporary skin imperfections, blending with surrounding skin texture.
- "Smooth Skin": Subtly reduce the appearance of wrinkles and uneven texture while keeping it looking real.
- "Whiten Teeth": Naturally brighten teeth, avoiding an overly white, opaque look.
- "Change Hair/Eye Color": Realistically change the hue of the hair or eyes in the masked area, respecting existing highlights and shadows.
- "Add Makeup": Apply makeup (e.g., lipstick, eyeshadow) realistically, following the contours of the face.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final retouched image. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart, maskImagePart], 'retouching', modelName);
};


/**
 * Generates an image with a filter applied using generative AI.
 */
export const generateFilteredImage = async (
    originalImage: File,
    filterPrompt: string,
    modelName?: string
): Promise<string> => {
    console.log(`Starting filter generation: ${filterPrompt}`);
    const originalImagePart = await fileToGenerativePart(originalImage);
    const prompt = `You are an expert photo editor AI with a deep understanding of artistic styles. Your task is to apply a stylistic filter to the entire provided image. The goal is to transform the image's aesthetic while perfectly preserving its original content, composition, and details.

**Crucial Rule:** You are editing the *existing* image, not creating a new one. The final output must be clearly recognizable as the original photo, just viewed through a new artistic lens.

**User's Filter Request:** "${filterPrompt}"

**Instructions:**
1.  **Preserve Content & Solidity:** All original subjects, objects, people, and their features must remain unchanged in form, position, and solidity. Do not add, remove, or replace any elements. Subjects should remain fully opaque and not become transparent or ghost-like.
2.  **Maintain Composition:** The layout and arrangement of elements in the image must be identical to the original.
3.  **Apply Style:** Transform the image's colors, lighting, textures, and overall mood to match the requested style. For example, if the request is "watercolor," the final image should look like the original photo was painted with watercolors, but the subjects should not be transparent.

Safety & Ethics Policy:
- Filters may subtly shift colors, but you MUST ensure they do not alter a person's fundamental race or ethnicity.
- YOU MUST REFUSE any request that explicitly asks to change a person's race (e.g., 'apply a filter to make me look Chinese').

Output: Return ONLY the final, stylistically transformed image. Do not return any text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart], 'filter', modelName);
};

/**
 * Generates an image with a global adjustment applied using generative AI.
 */
export const generateAdjustedImage = async (
    originalImage: File,
    adjustmentPrompt: string,
    modelName?: string
): Promise<string> => {
    console.log(`Starting global adjustment generation: ${adjustmentPrompt}`);
    const originalImagePart = await fileToGenerativePart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, global adjustment to the entire image based on the user's request.
User Request: "${adjustmentPrompt}"

Editing Guidelines:
- The adjustment must be applied across the entire image.
- The result must be photorealistic.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final adjusted image. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart], 'adjustment', modelName);
};

/**
 * Expands an image by filling in transparent areas using generative AI.
 */
export const generateExpandedImage = async (
    imageToExpand: File,
    expansionPrompt: string,
    modelName?: string
): Promise<string> => {
    console.log(`Starting generative expand with prompt: ${expansionPrompt || 'none'}`);
    const imagePart = await fileToGenerativePart(imageToExpand);
    const prompt = `You are an expert photo editor AI performing a generative fill or "outpainting" task.
The provided image has transparent areas. Your task is to inpaint these transparent areas, seamlessly and realistically extending the content from the non-transparent part of the image.

Guidelines:
- The original, non-transparent part of the image MUST remain completely unchanged.
- The filled-in area must contextually match the original image in terms of lighting, texture, style, and content.
- The result must be photorealistic and the boundary between the original and new content should be invisible.
${expansionPrompt ? `\nUser's Guidance for the new area: "${expansionPrompt}"` : ''}

Output: Return ONLY the final expanded image. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([imagePart, textPart], 'expansion', modelName);
};

/**
 * Upscales an image using generative AI (Gemini 3 Pro for high resolution).
 */
export const generateUpscaledImage = async (
    originalImage: File,
    scale: number,
    modelName?: string
): Promise<string> => {
    console.log(`Starting AI upscale to ${scale}x`);

    // We use Gemini 3 Pro Image because it supports explicit resolution output ('2K', '4K').
    // Flash Image doesn't support 'imageSize' config reliably.

    let targetSize: '1K' | '2K' | '4K' = '4K'; // Default to max for best result
    if (scale <= 2) targetSize = '2K';
    if (scale >= 4) targetSize = '4K';

    const originalImagePart = await fileToGenerativePart(originalImage);
    const prompt = `Task: High-Fidelity Image Upscaling.
Instructions: The user has provided an image. Re-generate this image at a much higher resolution (${targetSize} quality).
Crucially, you must preserve the exact content, composition, colors, and identity of the original image. Do not hallucinate new objects or change the scene.
Focus on enhancing fine details, sharpening edges, and removing artifacts (like JPEG compression or noise) to make it look like a pristine, high-resolution photograph.
Output: Return ONLY the final upscaled image. Do not return text.`;
    const textPart = { text: prompt };
    // We prefer the provided modelName, otherwise fallback to pro for upscaling
    return _generateImageEdit([originalImagePart, textPart], 'upscale', modelName || 'gemini-3-pro-preview', {
        imageConfig: { imageSize: targetSize }
    });
};

/**
 * Enhances an image's quality and details using generative AI.
 */
export const generateEnhancedImage = async (
    originalImage: File,
    intensity: 'subtle' | 'medium' | 'strong',
    modelName?: string
): Promise<string> => {
    console.log(`Starting AI enhancement (${intensity})...`);
    const originalImagePart = await fileToGenerativePart(originalImage);

    let prompt = "Task: Enhance Image Quality.\n";
    if (intensity === 'subtle') {
        prompt += "Apply subtle improvements to clarity and lighting. Reduce noise slightly. Keep the look very natural.";
    } else if (intensity === 'medium') {
        prompt += "Enhance overall details, sharpness, and lighting. Balance colors and contrast for a professional photograph look.";
    } else {
        prompt += "Strongly enhance details, texture, and clarity. Make the image pop with high definition sharpness and vibrant (but realistic) lighting.";
    }
    prompt += "\nOutput: Return ONLY the final enhanced image. Do not change the content or composition.";

    const textPart = { text: prompt };
    return _generateImageEdit([originalImagePart, textPart], 'enhance', modelName);
};

/**
 * Removes the background from an image using a mask-based approach for true transparency.
 */
export const generateRemovedBackgroundImage = async (
    originalImage: File,
    modelName?: string
): Promise<string> => {
    console.log('Starting AI background removal (Mask Composition)...');

    // 1. Generate the Mask
    const originalImagePart = await fileToGenerativePart(originalImage);
    const maskPrompt = `Task: Generate a precise Binary Segmentation Mask.
Instructions:
- Identify the main subject(s) of the image.
- Create a high-contrast mask where the SUBJECT is pure WHITE (RGB 255,255,255).
- The BACKGROUND must be pure BLACK (RGB 0,0,0).
- Ensure sharp, accurate edges around hair, fur, and clothing.
- Do not change the composition. The mask must align perfectly with the original image.
Output: Return ONLY the mask image.`;

    // We use the image model to generate the mask
    const maskBase64 = await _generateImageEdit([originalImagePart, { text: maskPrompt }], 'bg-removal-mask', modelName);

    // 2. Composite the Mask + Original Image in the browser to get Transparency
    return new Promise((resolve, reject) => {
        const img = new Image();
        const mask = new Image();

        let imgLoaded = false;
        let maskLoaded = false;

        const processComposition = () => {
            if (!imgLoaded || !maskLoaded) return;

            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            // Draw mask to a temp canvas to read its pixels
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
            const maskCtx = maskCanvas.getContext('2d');
            if (!maskCtx) { reject(new Error("No mask context")); return; }

            maskCtx.drawImage(mask, 0, 0, canvas.width, canvas.height);
            const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height).data;

            // Apply mask to alpha channel
            // Mask is White (Subject) / Black (Bg). 
            // We want transparency where mask is black.
            for (let i = 0; i < data.length; i += 4) {
                // Use the red channel of the mask as brightness (since it's B&W)
                const maskVal = maskData[i];
                // Simple threshold or soft edge? 
                // Let's use the value directly for smooth anti-aliased edges if the model outputs grayscale edges.
                data[i + 3] = maskVal;
            }

            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };

        img.onload = () => { imgLoaded = true; processComposition(); };
        img.onerror = () => reject(new Error("Failed to load original image for composition"));
        img.src = URL.createObjectURL(originalImage);

        mask.onload = () => { maskLoaded = true; processComposition(); };
        mask.onerror = () => reject(new Error("Failed to load mask image for composition"));
        mask.src = maskBase64;
    });
};

/**
 * Replaces the background of an image using a text prompt.
 */
export const generateReplacedBackgroundImage = async (
    subjectImage: File,
    backgroundPrompt: string,
    modelName?: string
): Promise<string> => {
    console.log(`Starting generative background replacement with prompt: ${backgroundPrompt}`);
    const subjectImagePart = await fileToGenerativePart(subjectImage);
    const prompt = `You are an expert photo editor AI. Your task is to generate a new background for the provided subject image and composite them together.
The user has provided an image of a subject with a transparent background.
User Request for new background: "${backgroundPrompt}"

Guidelines:
- Generate a photorealistic background based on the user's request.
- The generated background must match the subject in terms of lighting, perspective, and style to create a seamless composite.
- The provided subject image MUST be placed on top of the new background without any modifications to the subject itself.
- The final image should be a complete scene, not just the subject with a new background.

Output: Return ONLY the final composited image. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([subjectImagePart, textPart], 'background replacement', modelName);
};

const getActualImageModel = (modelName?: string, quality?: 'standard' | 'pro'): string => {
    if (!modelName) {
        return quality === 'pro' ? 'imagen-3.0-generate-002' : 'imagen-3.0-generate-002';
    }
    const lowerName = modelName.toLowerCase();
    const imageCapableModels = [
        'gemini-3.1-flash-image-preview',
        'gemini-3.1-pro-preview',
        'gemini-3-pro-image-preview',
        'gemini-2.5-flash-image',
        'imagen-3.0-generate-002',
        'veo-2.0-generate-001'
    ];
    
    // Map non-multimodal/text models to image capable models
    if (lowerName.includes('imagen-3') || lowerName.includes('imagen')) {
        return 'imagen-3.0-generate-002';
    }
    if (lowerName.includes('veo-2') || lowerName.includes('veo')) {
        return 'veo-2.0-generate-001';
    }
    if (lowerName === 'gemini-2.0-flash' || lowerName.includes('2.5-flash') || lowerName.includes('2.0-flash')) {
        return 'imagen-3.0-generate-002';
    }
    if (lowerName === 'gemini-1.5-pro' || lowerName.includes('1.5-pro') || lowerName.includes('2.5-pro')) {
        return 'imagen-3.0-generate-002';
    }
    if (lowerName.includes('1.5-flash')) {
        return 'imagen-3.0-generate-002';
    }
    
    // Check if the current model is actually in our list of image models
    if (imageCapableModels.includes(modelName)) {
        return modelName;
    }
    
    return 'imagen-3.0-generate-002'; // Default fallback
};

const getActualTextModel = (modelName?: string): string => {
    if (!modelName) {
        return 'gemini-2.5-flash';
    }
    const lowerName = modelName.toLowerCase();
    
    // Map legacy/unavailable models to supported ones
    if (lowerName.includes('1.5-flash') || lowerName.includes('2.0-flash') || lowerName.includes('2.5-flash')) {
        return 'gemini-2.5-flash';
    }
    if (lowerName.includes('1.5-pro') || lowerName.includes('2.5-pro') || lowerName.includes('pro')) {
        return 'gemini-2.5-pro';
    }
    
    return modelName;
};

export const generateImages = async (
    prompt: string,
    numImages: number,
    aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16',
    quality: 'standard' | 'pro' = 'standard',
    imageSize: '1K' | '2K' | '4K' = '1K',
    modelName?: string
): Promise<string[]> => {
    const apiKey = getApiKey();
    const genAI = new GoogleGenAI({ apiKey });
    const resolvedModelName = getActualImageModel(modelName, quality);
    console.log(`Starting batch image generation with prompt: ${prompt} (${resolvedModelName})`);

    const generateOne = async (): Promise<string> => {
        return withRetry(async () => {
            const apiKey = getApiKey();
            const genAI = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
            let config: any = {};

            if (quality === 'pro') {
                config.imageConfig = {
                    aspectRatio: aspectRatio,
                    imageSize: imageSize
                };
            } else {
                config.imageConfig = {
                    aspectRatio: aspectRatio
                };
            }

            try {
                const result = await genAI.models.generateContent({
                    model: resolvedModelName,
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: {
                        responseModalities: ["IMAGE"] as any,
                        ...config,
                        safetySettings: safetySettings as any,
                    },
                });

                return handleApiResponse(result as any, 'image generation');
            } catch (err: any) {
                console.error('Gemini generate image error:', err);
                const msg = err.message || String(err);
                if (msg.includes("Modality IMAGE is not supported") || msg.includes("not support image output")) {
                    throw new ApiMultimodalError("IMAGE_OUTPUT_NOT_SUPPORTED", err);
                }
                throw err;
            }
        });
    };

    const promises = Array(numImages).fill(null).map(() => generateOne());
    const results = await Promise.allSettled(promises);
    const successfulImages: string[] = [];
    const errors: any[] = [];

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            successfulImages.push(result.value);
        } else {
            errors.push(result.reason);
        }
    });

    if (successfulImages.length === 0 && errors.length > 0) {
        throw errors[0];
    }

    return successfulImages;
};

export const generateVideo = async (
    prompt: string,
    image?: File,
    modelName?: string
): Promise<string> => {
    return withRetry(async () => {
        console.log(`Starting video generation with prompt: ${prompt}`);
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

        try {
            const resolvedModelName = getActualImageModel(modelName, 'standard');
            const contents = image ? [{ role: 'user', parts: [await fileToGenerativePart(image) as any, { text: prompt }] }] : [{ role: 'user', parts: [{ text: prompt }] }];
            
            const result = await genAI.models.generateContent({
                model: resolvedModelName,
                contents: contents as any,
                config: {
                    responseModalities: ["IMAGE"] as any, // Currently generating a cinematic preview
                    safetySettings: safetySettings as any,
                },
            });

            // Return first image as a "video preview" for now
            return handleApiResponse(result as any, 'video generation');
        } catch (err: any) {
            console.error('Gemini generate video error:', err);
            const msg = err.message || String(err);
            if (msg.includes("Modality IMAGE is not supported") || msg.includes("not support image output")) {
                throw new ApiMultimodalError("IMAGE_OUTPUT_NOT_SUPPORTED", err);
            }
            throw err;
        }
    }, 3, 2000);
};

export const generateRestoredImage = async (
    originalImage: File,
    restorePrompt: string,
    modelName?: string
): Promise<string> => {
    console.log(`Starting AI photo restoration with prompt: ${restorePrompt}`);
    const originalImagePart = await fileToGenerativePart(originalImage);
    const prompt = `Task: AI Photo Restoration.
The user wants to restore an old or damaged photo. Apply the following fixes: "${restorePrompt}".
The goal is a natural, realistic restoration. Preserve the original character of the photo. Do not over-process.
Output: Return ONLY the final restored image. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart], 'restoration', modelName);
};

export const generateProductBackgroundImage = async (
    subjectImage: File,
    backgroundName: string,
    customPrompt?: string,
    modelName?: string
): Promise<string> => {
    let backgroundPrompt = '';
    switch (backgroundName) {
        case 'Studio White':
            backgroundPrompt = 'a clean, seamless white studio background with a soft, subtle floor shadow.';
            break;
        case 'Marble':
            backgroundPrompt = 'a luxurious white and grey marble surface, with soft studio lighting.';
            break;
        case 'Wood':
            backgroundPrompt = 'a rustic wooden tabletop with a shallow depth of field.';
            break;
        case 'Gradient':
            backgroundPrompt = 'a subtle, elegant gradient background that complements the product colors.';
            break;
        case 'Outdoor':
            backgroundPrompt = 'a natural outdoor setting, like a mossy rock or a sandy beach, with beautiful natural light.';
            break;
        default: // Custom
            backgroundPrompt = customPrompt || 'a simple, clean background.';
            break;
    }
    return generateReplacedBackgroundImage(subjectImage, backgroundPrompt, modelName);
};

export const generateProductShadowImage = async (
    originalImage: File,
    modelName?: string
): Promise<string> => {
    console.log('Starting AI shadow generation');
    const originalImagePart = await fileToGenerativePart(originalImage);
    const prompt = `Task: Add a realistic shadow.
The provided image contains a subject on a plain background. Add a soft, natural drop shadow on the floor beneath the subject to make it look grounded. The shadow should match the implied lighting of the subject.
Output: Return ONLY the final image with the shadow added. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart], 'shadow generation', modelName);
};

export const generateCardImage = async (
    originalImage: File,
    cardPrompt: string,
    modelName?: string
): Promise<string> => {
    console.log(`Starting Cardify generation.`);
    const originalImagePart = await fileToGenerativePart(originalImage);
    const textPart = { text: cardPrompt };

    return _generateImageEdit([originalImagePart, textPart], 'cardify', modelName);
};

export const generateLuckyFilterImage = async (
    originalImage: File,
    modelName?: string
): Promise<string> => {
    return withRetry(async () => {
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const originalImagePart = await fileToGenerativePart(originalImage);

        // 1. Get a creative prompt using Gemini 1.5 Pro
        const suggestionPrompt = `You are an expert photo editor AI. Analyze the provided image and suggest a single, highly creative, and specific artistic filter prompt that would look amazing on it. Be bold! Examples: "A futuristic cyberpunk city aesthetic with neon rain", "A vintage 1920s charcoal sketch style", "A dreamy Studio Ghibli anime landscape style". Return ONLY the prompt text.`;

        const suggestionResult = await genAI.models.generateContent({
            model: getActualTextModel('gemini-1.5-pro'),
            contents: [{ role: 'user', parts: [originalImagePart, { text: suggestionPrompt }] }],
        });
        const luckyPrompt = suggestionResult.text ? suggestionResult.text.trim() : "A creative artistic filter";
        console.log(`Lucky prompt suggested: ${luckyPrompt}`);

        // 2. Apply the filter using the image editing model
        const editPrompt = `Apply this artistic style to the image: "${luckyPrompt}". The final output must be clearly recognizable as the original photo but transformed into this style.`;
        const textPart = { text: editPrompt };

        return _generateImageEdit([originalImagePart, textPart], 'lucky filter', modelName);
    });
};


export const generateCardDetails = async (
    image: File,
    cardType: string,
): Promise<any> => {
    return withRetry(async () => {
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const imagePart = await fileToGenerativePart(image);
        const textPart = { text: `Extract details for a ${cardType} from this image.` }; // Placeholder prompt

        const response = await genAI.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [{ role: 'user', parts: [imagePart, textPart] }],
            config: {
                responseMimeType: "application/json",
                // A generic schema since the fields change based on card type
                responseSchema: { type: Type.OBJECT, properties: {} },
            },
        });

        const jsonText = response.text ? response.text.trim() : '';
        if (jsonText) {
            try {
                return JSON.parse(jsonText);
            } catch (e) {
                console.error("Failed to parse card details JSON:", e);
                throw new Error("AI failed to return valid card details.");
            }
        }
        throw new Error("AI did not return any card details.");
    });
};

export const generateColorPalette = async (
    image: File
): Promise<string[]> => {
    return withRetry(async () => {
        console.log('Generating color palette...');
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const imagePart = await fileToGenerativePart(image);
        const prompt = `Analyze the provided image and extract a harmonious color palette of 5-7 distinct colors. Return the colors as an array of hex codes.`;
        const textPart = { text: prompt };

        const result = await genAI.models.generateContent({
            model: getActualTextModel('gemini-1.5-flash'),
            contents: [{ role: 'user', parts: [imagePart, textPart] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        palette: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                    },
                },
                safetySettings: safetySettings as any,
            },
        });

        const jsonText = result.text ? result.text.trim() : '';
        if (jsonText) {
            try {
                const parsedResult = JSON.parse(jsonText);
                return parsedResult.palette || [];
            } catch (e) {
                console.error("Failed to parse color palette JSON:", e);
                throw new Error("AI failed to return a valid color palette.");
            }
        }
        throw new Error("AI did not return a color palette.");
    });
};

export const applyColorPalette = async (
    image: File,
    palette: string[],
    selectedColor: string,
    modelName?: string
): Promise<string> => {
    console.log('Applying color palette...');
    const imagePart = await fileToGenerativePart(image);
    const prompt = `Recolor this image using the provided color palette: [${palette.join(', ')}]. The primary, most dominant color in the new image should be ${selectedColor}. The result should be artistic and harmonious, while preserving the original content and composition of the image.`;
    const textPart = { text: prompt };

    return _generateImageEdit([imagePart, textPart], 'apply color palette', modelName);
};

export const generateRecoloredImage = async (
    image: File,
    sourceColor: string,
    targetColor: string,
    tolerance: number,
    modelName?: string
): Promise<string> => {
    console.log(`Starting AI Recolor: from ${sourceColor} to ${targetColor} with tolerance ${tolerance}`);
    const imagePart = await fileToGenerativePart(image);
    const prompt = `You are an expert photo editor AI. Your task is to perform a precise, selective color replacement on the provided image.

Instructions:
1.  Identify all pixels in the image that are similar to the source color: **${sourceColor}**.
2.  The tolerance for color matching is **${tolerance}%**. A low tolerance means only very similar colors will be changed. A high tolerance will affect a wider range of related shades.
3.  Replace the identified pixels with the new target color: **${targetColor}**.
4.  **Crucially**, you must preserve all original textures, shadows, and highlights to ensure a photorealistic result. The edit should look natural, as if the object were originally the target color.
5.  Any part of the image that does not fall within the source color range and tolerance must remain completely unchanged.

Output: Return ONLY the final edited image. Do not return any text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([imagePart, textPart], 'recolor', modelName);
};


export const generateStyledImage = async (
    contentImage: File,
    styleImage: File,
    modelName?: string
): Promise<string> => {
    console.log('Starting style transfer...');
    const contentImagePart = await fileToGenerativePart(contentImage);
    const styleImagePart = await fileToGenerativePart(styleImage);
    const prompt = `This is an artistic style transfer task. The first image is the content image, and the second is the style image. Apply the complete artistic style (colors, textures, brushstrokes, mood) of the style image to the content image. The final output must preserve the composition and recognizable objects of the content image, but completely transformed into the new style.`;
    const textPart = { text: prompt };

    return _generateImageEdit([contentImagePart, textPart, styleImagePart], 'style transfer', modelName);
};

export const generateCaptions = async (
    image: File,
): Promise<{ captions: string[], sources: { uri: string, title: string }[] }> => {
    return withRetry(async () => {
        console.log(`Generating 3-5 captions with search grounding...`);
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const imagePart = await fileToGenerativePart(image);
        const prompt = `Generate 3-5 creative and descriptive captions for this image.`;
        const textPart = { text: prompt };

        const result = await genAI.models.generateContent({
            model: getActualTextModel('gemini-1.5-flash'),
            contents: [{ role: 'user', parts: [imagePart, textPart] }],
            config: {
                tools: [{ googleSearch: {} } as any],
            }
        });

        const text = result.text || '';
        const captions = text
            .split('\n')
            .map(s => s.replace(/^[*\-–—\d.]+\s*/, '').trim())
            .filter(Boolean);

        const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web)
            .filter((web: any) => web && web.uri) || [];

        return { captions, sources };
    });
};

export const generateCreativeText = async (
    image: File,
    type: 'quote' | 'caption' | 'pun' | 'marketing'
): Promise<{ text: string, color: string }> => {
    return withRetry(async () => {
        console.log(`Generating creative text (${type}) with Flash...`);
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const imagePart = await fileToGenerativePart(image);

        const prompt = `You are a social media expert and graphic designer. Analyze the provided image.
        
    Task 1: Generate a SINGLE, short, engaging ${type} suitable for a text overlay on this photo.
    - It should be catchy, relevant to the visual content, and short (under 10 words).
    - Do not use hashtags.
    - Do not add quotes around the text.

    Task 2: Suggest a hex color code for the text that would contrast well with the image (ensure readability).

    Return the result as a JSON object: { "text": "your text here", "color": "#RRGGBB" }`;

        const textPart = { text: prompt };

        const result = await genAI.models.generateContent({
            model: getActualTextModel('gemini-1.5-flash'),
            contents: [{ role: 'user', parts: [imagePart, textPart] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        color: { type: Type.STRING },
                    },
                },
                safetySettings,
            },
        });

        const response = result;
        const jsonText = response.text ? response.text.trim() : '';
        if (jsonText) {
            try {
                return JSON.parse(jsonText);
            } catch (e) {
                console.error("Failed to parse creative text JSON:", e);
                return { text: "Hello World", color: "#FFFFFF" };
            }
        }
        return { text: "Hello World", color: "#FFFFFF" };
    });
};

export const generateVariations = async (
    image: File,
    numVariations: number = 3,
    modelName?: string
): Promise<string[]> => {
    return withRetry(async () => {
        const resolvedModelName = getActualImageModel(modelName, 'standard');
        console.log(`Generating ${numVariations} variations with ${resolvedModelName}...`);
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const imagePart = await fileToGenerativePart(image);
        const prompt = `Analyze the provided image and generate ${numVariations} visually interesting and high-quality variations. Each variation should offer a different artistic interpretation while remaining recognizable as related to the original content. Ensure the variations are photorealistic and polished.`;
        const textPart = { text: prompt };

        const result = await genAI.models.generateContent({
            model: resolvedModelName,
            contents: [{ role: 'user', parts: [imagePart, textPart] }],
            config: {
                candidateCount: numVariations,
                responseModalities: ["IMAGE"] as any,
            },
        });

        const response = result;

        const imageParts = result.candidates?.[0]?.content?.parts?.filter(part => part.inlineData);

        if (imageParts && imageParts.length > 0) {
            return imageParts.map(part => `data:${part.inlineData!.mimeType};base64,${part.inlineData!.data}`);
        }

        throw new Error('The AI model did not return any image variations.');
    });
};

export const generateExpansionSuggestions = async (
    image: File
): Promise<Array<{ direction: 'top' | 'bottom' | 'left' | 'right', prompt: string }>> => {
    return withRetry(async () => {
        console.log('Generating expansion suggestions with Flash...');
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const imagePart = await fileToGenerativePart(image);

        const prompt = `Analyze the provided image and suggest 2-3 logical and creative ways to generatively expand it. For each suggestion, provide a 'direction' ('top', 'bottom', 'left', 'right') and a 'prompt' (e.g., 'extend with more blue sky'). Focus on natural, coherent extensions. Return a JSON array of objects.
        
        Return the suggestions as a JSON array of objects, where each object has "direction" and "prompt" fields. Only return the JSON.`;

        const textPart = { text: prompt };

        const result = await genAI.models.generateContent({
            model: getActualTextModel('gemini-1.5-flash'),
            contents: [{ role: 'user', parts: [imagePart, textPart] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            direction: { type: Type.STRING },
                            prompt: { type: Type.STRING },
                        },
                    },
                },
                safetySettings: safetySettings as any,
            },
        });

        const jsonText = result.text ? result.text.trim() : '';
        if (jsonText) {
            try {
                const result = JSON.parse(jsonText);
                // Basic validation for the expected structure
                if (Array.isArray(result) && result.every(item => typeof item === 'object' && item.direction && item.prompt)) {
                    return result;
                }
                console.error("Generated JSON is not in the expected format:", result);
                return [];
            } catch (e) {
                console.error("Failed to parse expansion suggestions JSON:", e);
                return [];
            }
        }
        return [];
    });
};


export const generatePromptSuggestions = async (
    image: File,
    context: 'add' | 'replace'
): Promise<string[]> => {
    return withRetry(async () => {
        console.log(`Generating prompt suggestions for context: ${context} with Flash`);
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });

        const imagePart = await fileToGenerativePart(image);
        let prompt = `Analyze the provided image. You are a creative assistant. Your goal is to suggest ideas for photo editing.`;
        if (context === 'add') {
            prompt += ` Provide 3 creative suggestions for objects or elements that could be added to this image.`;
        } else {
            prompt += ` Provide 3 creative suggestions for objects or areas in this image that could be realistically replaced or transformed.`;
        }
        prompt += ` Suggestions should be short, descriptive, and range from subtle to dramatic. Return them as a JSON object with a single key "suggestions" which is an array of strings.`;

        const textPart = { text: prompt };

        const result = await genAI.models.generateContent({
            model: getActualTextModel('gemini-1.5-flash'),
            contents: [{ role: 'user', parts: [imagePart, textPart] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                    },
                    safetySettings: safetySettings as any,
                },
            },
        });

        const response = result;
        const jsonText = response.text ? response.text.trim() : '';
        if (jsonText) {
            try {
                const result = JSON.parse(jsonText);
                return result.suggestions || [];
            } catch (e) {
                console.error("Failed to parse prompt suggestions JSON:", e);
                return [];
            }
        }
        return [];
    });
};

export const generateAutoAdjustments = async (
    image: File
): Promise<Record<string, number>> => {
    return withRetry(async () => {
        console.log('Generating auto adjustments...');
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const imagePart = await fileToGenerativePart(image);
        const prompt = `Analyze the provided image and suggest optimal auto-adjustments for common photo editing parameters. Return the values as a JSON object. Each value should be a number representing the adjustment amount (e.g., -100 to 100, or 0 to 1 for some parameters).`;
        const textPart = { text: prompt };

        const result = await genAI.models.generateContent({
            model: getActualTextModel('gemini-1.5-flash'),
            contents: [{ role: 'user', parts: [imagePart, textPart] }],
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
                        exposure: { type: Type.NUMBER },
                        temp: { type: Type.NUMBER },
                        tint: { type: Type.NUMBER },
                        clarity: { type: Type.NUMBER },
                        vibrance: { type: Type.NUMBER },
                    },
                    safetySettings: safetySettings as any,
                },
            },
        });

        const response = result;
        const jsonText = response.text ? response.text.trim() : '';
        if (jsonText) {
            try {
                const parsedResult = JSON.parse(jsonText);
                return parsedResult;
            } catch (e) {
                console.error("Failed to parse auto-adjustments JSON:", e);
                throw new Error("AI failed to return valid adjustment data.");
            }
        }
        throw new Error("AI did not return any adjustment data.");
    });
};

export const generateLuckyAdjustment = async (
    image: File
): Promise<string> => {
    return withRetry(async () => {
        console.log('Generating lucky adjustment with Gemini 1.5 Pro...');
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const imagePart = await fileToGenerativePart(image);
        const prompt = `You are a creative and professional photographer AI. Analyze the provided image and suggest a single, creative, and stylistic adjustment prompt. The prompt should be a descriptive instruction that could be given to a photo editor.
    
    Examples:
    - "Make the sunset colors more dramatic and warm."
    - "Apply a moody, high-contrast black and white look."
    - "Give the photo a vintage, faded film aesthetic."
    - "Brighten the shadows and make the colors pop."
    
    Do not add any conversational text, explanations, or quotes. Only return the single prompt string as plain text.`;
        const textPart = { text: prompt };

        const result = await genAI.models.generateContent({
            model: getActualTextModel('gemini-1.5-pro'),
            contents: [{ role: 'user', parts: [imagePart, textPart] }],
            config: {
                safetySettings: safetySettings as any,
            }
        });

        const luckyPrompt = result.text ? result.text.trim() : '';
        if (!luckyPrompt) {
            throw new Error("The AI did not return a lucky adjustment suggestion.");
        }
        return luckyPrompt;
    });
}

export const enhancePrompt = async (
    originalPrompt: string
): Promise<string> => {
    if (!originalPrompt.trim()) return '';
    return withRetry(async () => {
        console.log(`Enhancing prompt: ${originalPrompt}`);
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const prompt = `You are a professional prompt engineer for generative AI art.
    The user has provided a basic prompt: "${originalPrompt}".
    Your task is to rewrite and expand this prompt to generate a significantly higher quality, more detailed, and artistic result.
    Add relevant details about lighting, style, texture, composition, and camera settings (e.g., "8k", "cinematic lighting", "photorealistic", "highly detailed").
    Keep the core intent of the original prompt but make it "pro".
    Return ONLY the enhanced prompt text.`;
        const textPart = { text: prompt };

        const result = await genAI.models.generateContent({
            model: getActualTextModel('gemini-1.5-flash'),
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        return result.text ? result.text.trim() : originalPrompt;
    });
};

export const generateSmartReplies = async (
    history: ChatMessage[]
): Promise<string[]> => {
    return withRetry(async () => {
        console.log('Generating smart replies with Flash...');
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });

        // Provide the last few messages for context (keep it lightweight)
        const recentHistory = history.slice(-5).map(msg => `${msg.role}: ${msg.text}`).join('\n');

        const prompt = `You are a helpful AI assistant. Based on the following conversation history, suggest 3 short, relevant, and natural follow-up responses or questions that the USER might want to say next.
        
    Conversation History:
    ${recentHistory}
 
    Return the 3 suggestions as a JSON object with a single key "replies" which is an array of strings. Keep them concise (under 10 words).`;

        const result = await genAI.models.generateContent({
            model: getActualTextModel('gemini-1.5-flash'),
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        replies: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                    },
                    safetySettings: safetySettings as any,
                },
            },
        });

        const response = result;
        const jsonText = response.text ? response.text.trim() : '';
        if (jsonText) {
            try {
                const result = JSON.parse(jsonText);
                return result.replies || [];
            } catch (e) {
                console.error("Failed to parse smart replies JSON:", e);
                return [];
            }
        }
        return [];
    });
};

export const detectObjects = async (
    image: File,
    label: string,
    modelName?: string
): Promise<{ ymin: number, xmin: number, ymax: number, xmax: number }[]> => {
    return withRetry(async () => {
        console.log(`Detecting objects: ${label}`);
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const imagePart = await fileToGenerativePart(image);
        const prompt = `Detect the bounding boxes for objects matching the description: "${label}". 
    Return the result as a JSON object with a single key "boxes" which is an array of objects.
    Each object must have 'ymin', 'xmin', 'yax', 'xmax' as integers on a scale of 0 to 1000.
    If no objects are found, return an empty array.`;

        const textPart = { text: prompt };

        const result = await genAI.models.generateContent({
            model: getActualTextModel(modelName || 'gemini-1.5-flash'),
            contents: [{ role: 'user', parts: [imagePart, textPart] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        boxes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    ymin: { type: Type.NUMBER },
                                    xmin: { type: Type.NUMBER },
                                    ymax: { type: Type.NUMBER },
                                    xmax: { type: Type.NUMBER },
                                },
                            },
                        },
                    },
                    safetySettings: safetySettings as any,
                },
            },
        });

        const response = result;
        const jsonText = response.text ? response.text.trim() : '';
        if (jsonText) {
            try {
                const result = JSON.parse(jsonText);
                return result.boxes || [];
            } catch (e) {
                console.error("Failed to parse detection JSON:", e);
                return [];
            }
        }
        return [];
    });
};

export const generateSegmentationMask = async (
    image: File,
    label: string,
    modelName?: string
): Promise<string> => {
    console.log(`Generating segmentation mask for: ${label}`);
    const imagePart = await fileToGenerativePart(image);

    const prompt = `Create a high-contrast binary mask image for the object: "${label}".
    Instructions:
    - The object ("${label}") must be pure WHITE.
    - The background and everything else must be pure BLACK.
    - Ensure clear, precise edges.
    - The output should be a solid silhouette of the object.
    
    Output: Return ONLY the mask image.`;

    const textPart = { text: prompt };

    // We use the image model to generate the mask visually
    return _generateImageEdit([imagePart, textPart], 'segmentation mask', modelName);
};

export const generateSketchImage = async (
    compositedImage: File,
    prompt: string,
    modelName?: string
): Promise<string> => {
    console.log('Starting Sketch-to-Image generation:', prompt);
    const imagePart = await fileToGenerativePart(compositedImage);

    const fullPrompt = `You are an expert digital artist.
User Task: "Transform the rough sketch on this image into a realistic, high-quality artwork."
User Prompt: "${prompt}"

Instructions:
- The provided image contains a rough, colored sketch overlaid on a base image (or a blank canvas).
- Your goal is to interpret the sketch lines and colors as a guide for the structure and composition of the final image.
- The final output should be photorealistic (unless the prompt specifies a different style) and high resolution.
- Blend the sketched elements seamlessly into the scene if there is a background.
- Maintain the overall composition defined by the sketch.

Output: Return ONLY the final generated image. Do not return text.`;

    const textPart = { text: fullPrompt };
    return _generateImageEdit([imagePart, textPart], 'sketch-to-image', modelName);
};


// --- NEW: Chat & Multimodal Features ---

export const analyzeVideo = async (
    videoFile: File,
    prompt: string
): Promise<string> => {
    return withRetry(async () => {
        console.log('Analyzing video with Gemini 1.5 Pro...');
        if (videoFile.size > 20 * 1024 * 1024) {
            throw new Error("Video file is too large for client-side analysis. Please upload a clip under 20MB.");
        }

        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const { inlineData } = await fileToGenerativePart(videoFile);

        const result = await genAI.models.generateContent({
            model: getActualTextModel('gemini-1.5-pro'),
            contents: [{ role: 'user', parts: [inlineData as any, { text: prompt }] }],
        });

        return result.text ? result.text.trim() : "I couldn't analyze the video.";
    });
};

export const transcribeAudio = async (
    audioFile: File
): Promise<string> => {
    return withRetry(async () => {
        console.log('Transcribing audio with Gemini 1.5 Flash...');
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        const { inlineData } = await fileToGenerativePart(audioFile);

        const result = await genAI.models.generateContent({
            model: getActualTextModel('gemini-1.5-flash'),
            contents: [{ role: 'user', parts: [inlineData as any, { text: "Transcribe this audio file accurately." }] }],
        });

        return result.text ? result.text.trim() : "Transcription failed.";
    });
};

export const generateSpeech = async (
    text: string,
    voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Puck'
): Promise<ArrayBuffer> => {
    return withRetry(async () => {
        console.log('Generating speech (TTS)...');
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

        const result = await genAI.models.generateContent({
            model: 'gemini-3.1-flash-tts-preview',
            contents: [{ role: 'user', parts: [{ text: `Generate a short speech audio for the following text: "${text}".` }] }],
            config: {
                responseModalities: ["AUDIO"] as any,
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        });

        const base64Audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio returned");

        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    });
};

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    image?: string; // base64
    groundingMetadata?: any;
}

export const chatWithGemini = async (
    history: ChatMessage[],
    newMessage: string,
    image?: File,
    useReasoning: boolean = false,
    useGrounding: boolean = true
): Promise<ChatMessage> => {
    return withRetry(async () => {
        const apiKey = getApiKey();
        const genAI = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
        const modelName = getActualTextModel(useReasoning ? 'gemini-1.5-pro' : 'gemini-1.5-flash');

        const contents: Content[] = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const currentParts: Part[] = [{ text: newMessage }];
        if (image) {
            const { inlineData } = await fileToGenerativePart(image);
            currentParts.unshift(inlineData as any);
        }

        const tools: any[] = [];
        if (useGrounding) {
            tools.push({ googleSearch: {} });
        }

        const result = await genAI.models.generateContent({
            model: modelName,
            contents: [...contents, { role: 'user', parts: currentParts }],
            config: {
                tools: tools as any,
            }
        });

        return {
            role: 'model',
            text: result.text || "I couldn't generate a response.",
            groundingMetadata: result.candidates?.[0]?.groundingMetadata
        };
    });
};

// New Streaming Chat Function
export const chatWithGeminiStream = async function* (
    history: ChatMessage[],
    newMessage: string,
    image?: File,
    useReasoning: boolean = false,
    useGrounding: boolean = true,
    manualModelName?: string
) {
    const apiKey = getApiKey();
    const genAI = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
    const modelName = getActualTextModel(manualModelName || (useReasoning ? 'gemini-1.5-pro' : 'gemini-1.5-flash'));

    const contents: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const currentParts: Part[] = [{ text: newMessage }];
    if (image) {
        const { inlineData } = await fileToGenerativePart(image);
        currentParts.unshift(inlineData as any);
    }

    const tools: any[] = [];
    if (useGrounding) {
        tools.push({ googleSearch: {} });
    }

    const resultStream = genAI.models.generateContentStream({
        model: modelName,
        contents: [...contents, { role: 'user', parts: currentParts }],
        config: {
            systemInstruction: "You are Luminescent AI, a creative and helpful assistant. Be concise. If you need to present comparisons or structured data, please use Markdown tables.",
            tools: tools as any,
        }
    });

    for await (const chunk of await resultStream) {
        yield {
            text: (chunk as any).text?.() ?? '',
            groundingMetadata: (chunk as any).candidates?.[0]?.groundingMetadata
        };
    }
};

/**
 * Utility to verify if the current API key and connection are functional.
 * Performs a lightweight text-only request to minimize token usage.
 */
export const checkConnection = async (apiKeyOverride?: string): Promise<{ success: boolean; message: string }> => {
    try {
        const apiKey = apiKeyOverride || getApiKey();
        const genAI = new GoogleGenAI({ apiKey });
        
        // Use a basic text model for the connection check
        const result = await genAI.models.generateContent({
            model: getActualTextModel("gemini-1.5-flash"),
            contents: [{ role: 'user', parts: [{ text: "Hello, respond with 'OK'." }] }]
        });
        
        const text = result.text || '';
        
        if (text.includes('OK') || text.length > 0) {
            return { success: true, message: "Connection successful! Your API key is valid and the service is reachable." };
        }
        throw new Error("Received an unexpected response format from the API.");
    } catch (error: any) {
        console.error("Connection Check Failed:", error);
        return { 
            success: false, 
            message: error.message || "Failed to connect to Gemini API. Please check your internet connection and API key." 
        };
    }
};