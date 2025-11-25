/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality, Type, HarmBlockThreshold, HarmCategory, Content, Part } from "@google/genai";

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

// Helper function to convert a File object to a Gemini API Part
const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
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

// Helper function to convert a File object to a base64 string and mime type
const fileToBase64 = async (file: File): Promise<{ imageBytes: string; mimeType: string; }> => {
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
    const imageBytes = arr[1];
    return { imageBytes, mimeType };
};


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
        const errorMessage = `Image generation for ${context} stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
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

// Internal helper for generic image editing calls
const _generateImageEdit = async (
    parts: ( { text: string } | { inlineData: { mimeType: string; data: string; } } )[],
    context: string
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    console.log(`Sending edit request for ${context}...`);
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            // Per guidelines for gemini-2.5-flash-image: 
            // - Must be an array with a single Modality.IMAGE element.
            // - Do not add other configs.
            responseModalities: [Modality.IMAGE],
        },
    });
    console.log(`Received response from model for ${context}.`, response);
    return handleApiResponse(response, context);
};


/**
 * Generates an inpainted image using a mask and an optional prompt.
 */
export const generateInpaintedImage = async (
    originalImage: File,
    maskImage: File,
    userPrompt: string,
): Promise<string> => {
    console.log('Starting generative inpainting with prompt:', userPrompt);
    const originalImagePart = await fileToPart(originalImage);
    const maskImagePart = await fileToPart(maskImage);
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

    return _generateImageEdit([originalImagePart, textPart, maskImagePart], 'inpainting');
};

/**
 * Adds a new object to an image based on a mask and prompt.
 */
export const generateAddedProductImage = async (
    originalImage: File,
    maskImage: File,
    userPrompt: string,
): Promise<string> => {
    console.log('Starting add product with prompt:', userPrompt);
    const originalImagePart = await fileToPart(originalImage);
    const maskImagePart = await fileToPart(maskImage);
    const prompt = `You are an expert photo editor AI. Your task is to seamlessly add a new object to the provided image based on a mask and a user's request.
The user has provided an image and a mask. The black area of the mask indicates the region where the new object should be placed.

User Request: "${userPrompt}"

Editing Guidelines:
- The new object must be realistic and blend seamlessly with the surrounding area, matching the lighting, shadows, perspective, and style of the original photo.
- The area outside the mask must remain identical to the original image.

Output: Return ONLY the final edited image. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart, maskImagePart], 'add product');
};


/**
 * Applies a selective adjustment or filter to a masked area of an image.
 */
export const generateSelectiveAdjustment = async (
    originalImage: File,
    maskImage: File,
    userPrompt: string,
): Promise<string> => {
    console.log('Starting selective adjustment with prompt:', userPrompt);
    const originalImagePart = await fileToPart(originalImage);
    const maskImagePart = await fileToPart(maskImage);
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

    return _generateImageEdit([originalImagePart, textPart, maskImagePart], 'selective adjustment');
};

/**
 * Applies a specific retouching operation to a masked area of an image.
 */
export const generateRetouchImage = async (
    originalImage: File,
    maskImage: File,
    userPrompt: string,
): Promise<string> => {
    console.log('Starting AI retouch with prompt:', userPrompt);
    const originalImagePart = await fileToPart(originalImage);
    const maskImagePart = await fileToPart(maskImage);
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

    return _generateImageEdit([originalImagePart, textPart, maskImagePart], 'retouching');
};


/**
 * Generates an image with a filter applied using generative AI.
 */
export const generateFilteredImage = async (
    originalImage: File,
    filterPrompt: string,
): Promise<string> => {
    console.log(`Starting filter generation: ${filterPrompt}`);
    const originalImagePart = await fileToPart(originalImage);
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

    return _generateImageEdit([originalImagePart, textPart], 'filter');
};

/**
 * Generates an image with a global adjustment applied using generative AI.
 */
export const generateAdjustedImage = async (
    originalImage: File,
    adjustmentPrompt: string,
): Promise<string> => {
    console.log(`Starting global adjustment generation: ${adjustmentPrompt}`);
    const originalImagePart = await fileToPart(originalImage);
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

    return _generateImageEdit([originalImagePart, textPart], 'adjustment');
};

/**
 * Expands an image by filling in transparent areas using generative AI.
 */
export const generateExpandedImage = async (
    imageToExpand: File,
    expansionPrompt: string,
): Promise<string> => {
    console.log(`Starting generative expand with prompt: ${expansionPrompt || 'none'}`);
    const imagePart = await fileToPart(imageToExpand);
    const prompt = `You are an expert photo editor AI performing a generative fill or "outpainting" task.
The provided image has transparent areas. Your task is to inpaint these transparent areas, seamlessly and realistically extending the content from the non-transparent part of the image.

Guidelines:
- The original, non-transparent part of the image MUST remain completely unchanged.
- The filled-in area must contextually match the original image in terms of lighting, texture, style, and content.
- The result must be photorealistic and the boundary between the original and new content should be invisible.
${expansionPrompt ? `\nUser's Guidance for the new area: "${expansionPrompt}"` : ''}

Output: Return ONLY the final expanded image. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([imagePart, textPart], 'expansion');
};

/**
 * Upscales an image using generative AI.
 */
export const generateUpscaledImage = async (
    originalImage: File,
    scale: number,
): Promise<string> => {
    console.log(`Starting AI upscale to ${scale}x`);

    const dimensions = await new Promise<{ width: number, height: number }>((resolve, reject) => {
        const objectUrl = URL.createObjectURL(originalImage);
        const image = new Image();
        image.onload = () => {
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
            URL.revokeObjectURL(objectUrl);
        };
        image.onerror = () => {
            reject(new Error('Could not read image dimensions.'));
            URL.revokeObjectURL(objectUrl);
        };
        image.src = objectUrl;
    });

    const newWidth = dimensions.width * scale;
    const newHeight = dimensions.height * scale;
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Task: AI Photo Upscaling.
Instructions: Increase the resolution of the provided image by a factor of ${scale}. The final output must be a high-quality, photorealistic image with the exact dimensions: ${newWidth} pixels wide by ${newHeight} pixels high.
Your primary goal is to enhance and add realistic detail. Focus on improving natural textures like skin, fabric, wood grain, and fine lines. The result should look as if it were captured with a higher-resolution camera.
Do not alter the content, composition, or colors of the original image.
Output: Return ONLY the final upscaled image. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart], 'upscale');
};

/**
 * Removes the background from an image using generative AI.
 */
export const generateRemovedBackgroundImage = async (
    originalImage: File,
): Promise<string> => {
    console.log('Starting AI background removal');
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to remove the background from the provided image.
The main subject should be perfectly preserved with clean edges. The background should be made transparent.
Output: Return ONLY the final image with a transparent background. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart], 'background removal');
};

/**
 * Replaces the background of an image using a text prompt.
 */
export const generateReplacedBackgroundImage = async (
    subjectImage: File,
    backgroundPrompt: string,
): Promise<string> => {
    console.log(`Starting generative background replacement with prompt: ${backgroundPrompt}`);
    const subjectImagePart = await fileToPart(subjectImage);
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
    
    return _generateImageEdit([subjectImagePart, textPart], 'background replacement');
};

export const generateImages = async (
    prompt: string,
    numImages: number,
    aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16'
): Promise<string[]> => {
    console.log(`Starting image generation with prompt: ${prompt} (gemini-2.5-flash-image)`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    // Since gemini-2.5-flash-image generates one image per request and doesn't support 
    // the 'numberOfImages' config in the same way as Imagen, we will fire multiple requests in parallel.
    // We adhere to the system prompt instruction to use gemini-2.5-flash-image by default.
    
    const generateOne = async (): Promise<string> => {
        // We augment the prompt with the aspect ratio since config support varies for Flash
        const ratioPrompt = aspectRatio ? ` Aspect ratio: ${aspectRatio}.` : '';
        const fullPrompt = `${prompt}${ratioPrompt}`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: fullPrompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        return handleApiResponse(response, 'image generation');
    };

    const promises = Array(numImages).fill(null).map(() => generateOne());
    const results = await Promise.all(promises);
    return results;
};

export const generateVideo = async (
    prompt: string,
    image?: File,
): Promise<string> => {
    console.log(`Starting video generation with prompt: ${prompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    let operation;
    if (image) {
        const { imageBytes, mimeType } = await fileToBase64(image);
        operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: { imageBytes, mimeType },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
    } else {
        operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
    }
    
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    // After the operation is done, check for an error property.
    // @ts-ignore - The error property is not explicitly typed but can exist on failure
    if (operation.error) {
        // @ts-ignore
        const errorMessage = operation.error.message || 'Video generation operation failed with an unknown error.';
        console.error('Video generation operation failed:', operation.error);
        throw new Error(errorMessage);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        console.error('Video generation finished but returned no video link. Response:', operation.response);
        throw new Error('Video generation failed or did not return a download link. This might be due to safety filters or an issue with the prompt.');
    }
    
    return downloadLink;
};

export const generateRestoredImage = async (
    originalImage: File,
    restorePrompt: string,
): Promise<string> => {
    console.log(`Starting AI photo restoration with prompt: ${restorePrompt}`);
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Task: AI Photo Restoration.
The user wants to restore an old or damaged photo. Apply the following fixes: "${restorePrompt}".
The goal is a natural, realistic restoration. Preserve the original character of the photo. Do not over-process.
Output: Return ONLY the final restored image. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart], 'restoration');
};

export const generateProductBackgroundImage = async (
    subjectImage: File,
    backgroundName: string,
    customPrompt?: string,
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
    return generateReplacedBackgroundImage(subjectImage, backgroundPrompt);
};

export const generateProductShadowImage = async (
    originalImage: File,
): Promise<string> => {
    console.log('Starting AI shadow generation');
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Task: Add a realistic shadow.
The provided image contains a subject on a plain background. Add a soft, natural drop shadow on the floor beneath the subject to make it look grounded. The shadow should match the implied lighting of the subject.
Output: Return ONLY the final image with the shadow added. Do not return text.`;
    const textPart = { text: prompt };

    return _generateImageEdit([originalImagePart, textPart], 'shadow generation');
};

export const generateCardImage = async (
    originalImage: File,
    cardPrompt: string,
): Promise<string> => {
    console.log(`Starting Cardify generation.`);
    const originalImagePart = await fileToPart(originalImage);
    const textPart = { text: cardPrompt };

    return _generateImageEdit([originalImagePart, textPart], 'cardify');
};

export const generateLuckyFilterImage = async (
    originalImage: File
): Promise<string> => {
    console.log('Starting lucky filter generation with Gemini 3 Pro...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const originalImagePart = await fileToPart(originalImage);
    
    // 1. Get a creative prompt using Gemini 3 Pro
    const suggestionPrompt = `You are an expert photo editor AI. Analyze the provided image and suggest a single, highly creative, and specific artistic filter prompt that would look amazing on it. Be bold! Examples: "A futuristic cyberpunk city aesthetic with neon rain", "A vintage 1920s charcoal sketch style", "A dreamy Studio Ghibli anime landscape style". Return ONLY the prompt text.`;
    const suggestionResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [originalImagePart, { text: suggestionPrompt }] },
        config: { safetySettings }
    });
    const luckyPrompt = suggestionResponse.text ? suggestionResponse.text.trim() : "A creative artistic filter";
    console.log(`Lucky prompt suggested: ${luckyPrompt}`);

    // 2. Apply the filter using the image editing model
    const editPrompt = `Apply this artistic style to the image: "${luckyPrompt}". The final output must be clearly recognizable as the original photo but transformed into this style.`;
    const textPart = { text: editPrompt };
    
    return _generateImageEdit([originalImagePart, textPart], 'lucky filter');
};

export const generateMemeSuggestions = async (
    originalImage: File,
): Promise<string[]> => {
    console.log('Generating meme suggestions with Gemini 3 Pro...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Analyze this image and generate 3-5 short, witty, and genuinely funny meme captions for it. Think about relatable situations, pop culture references, or absurd humor that would fit the image. The captions should be in the style of popular internet memes.`;
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Use Gemini 3 for better humor and reasoning
        contents: { parts: [originalImagePart, textPart] },
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
            },
            safetySettings,
        },
    });

    const jsonText = response.text ? response.text.trim() : '';
    if (jsonText) {
        try {
            const result = JSON.parse(jsonText);
            return result.suggestions || [];
        } catch (e) {
            console.error("Failed to parse meme suggestions JSON:", e);
            // Fallback: try to parse from raw text
            return jsonText.split('\n').map(s => s.trim().replace(/^-/,'').trim()).filter(Boolean);
        }
    }
    return [];
};

export const generateCardDetails = async (
    image: File,
    cardType: string,
): Promise<any> => {
    console.log(`Generating card details for type: ${cardType} with Gemini 3 Pro`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const imagePart = await fileToPart(image);
    const prompt = `Analyze the subject in this image and generate creative, thematic details for a ${cardType} trading card based on what you see. Fill in all relevant fields. Be imaginative!`;
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Use Gemini 3 for deeper creative writing
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            // A generic schema since the fields change based on card type
            responseSchema: { type: Type.OBJECT, properties: {} },
            safetySettings,
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
};

export const generateColorPalette = async (
    image: File
): Promise<string[]> => {
    console.log('Generating color palette...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const imagePart = await fileToPart(image);
    const prompt = "Analyze this image and extract a harmonious color palette of 5 dominant colors. Return them as an array of hex codes.";
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
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
            safetySettings,
        },
    });

    const jsonText = response.text ? response.text.trim() : '';
    if (jsonText) {
        try {
            const result = JSON.parse(jsonText);
            return result.palette || [];
        } catch (e) {
            console.error("Failed to parse color palette JSON:", e);
            throw new Error("AI failed to return a valid color palette.");
        }
    }
    throw new Error("AI did not return a color palette.");
};

export const applyColorPalette = async (
    image: File,
    palette: string[],
    selectedColor: string,
): Promise<string> => {
    console.log('Applying color palette...');
    const imagePart = await fileToPart(image);
    const prompt = `Recolor this image using the provided color palette: [${palette.join(', ')}]. The primary, most dominant color in the new image should be ${selectedColor}. The result should be artistic and harmonious, while preserving the original content and composition of the image.`;
    const textPart = { text: prompt };

    return _generateImageEdit([imagePart, textPart], 'apply color palette');
};

export const generateRecoloredImage = async (
    image: File,
    sourceColor: string,
    targetColor: string,
    tolerance: number,
): Promise<string> => {
    console.log(`Starting AI Recolor: from ${sourceColor} to ${targetColor} with tolerance ${tolerance}`);
    const imagePart = await fileToPart(image);
    const prompt = `You are an expert photo editor AI. Your task is to perform a precise, selective color replacement on the provided image.

Instructions:
1.  Identify all pixels in the image that are similar to the source color: **${sourceColor}**.
2.  The tolerance for color matching is **${tolerance}%**. A low tolerance means only very similar colors will be changed. A high tolerance will affect a wider range of related shades.
3.  Replace the identified pixels with the new target color: **${targetColor}**.
4.  **Crucially**, you must preserve all original textures, shadows, and highlights to ensure a photorealistic result. The edit should look natural, as if the object were originally the target color.
5.  Any part of the image that does not fall within the source color range and tolerance must remain completely unchanged.

Output: Return ONLY the final edited image. Do not return any text.`;
    const textPart = { text: prompt };
    
    return _generateImageEdit([imagePart, textPart], 'recolor');
};


export const generateStyledImage = async (
    contentImage: File,
    styleImage: File,
): Promise<string> => {
    console.log('Starting style transfer...');
    const contentImagePart = await fileToPart(contentImage);
    const styleImagePart = await fileToPart(styleImage);
    const prompt = `This is an artistic style transfer task. The first image is the content image, and the second is the style image. Apply the complete artistic style (colors, textures, brushstrokes, mood) of the style image to the content image. The final output must preserve the composition and recognizable objects of the content image, but completely transformed into the new style.`;
    const textPart = { text: prompt };

    return _generateImageEdit([contentImagePart, textPart, styleImagePart], 'style transfer');
};

export const generateCaptions = async (
    image: File,
): Promise<{ captions: string[], sources: { uri: string, title: string }[] }> => {
    console.log('Generating captions with search grounding...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const imagePart = await fileToPart(image);
    const prompt = `Analyze this image and generate 3 distinct, descriptive captions for social media. Use Google Search to ground your response with relevant information if the image contains landmarks, famous people, or specific objects.`;
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const text = response.text || '';
    const captions = text
        .split('\n')
        .map(s => s.replace(/^[*\-–—\d.]+\s*/, '').trim())
        .filter(Boolean);

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri) || [];

    return { captions, sources };
};

export const generateCreativeText = async (
    image: File,
    type: 'quote' | 'caption' | 'pun'
): Promise<{ text: string, color: string }> => {
    console.log(`Generating creative text (${type}) with Flash...`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const imagePart = await fileToPart(image);
    
    const prompt = `You are a social media expert and graphic designer. Analyze the provided image.
    
Task 1: Generate a SINGLE, short, engaging ${type} suitable for a text overlay on this photo.
- It should be catchy, relevant to the visual content, and short (under 10 words).
- Do not use hashtags.
- Do not add quotes around the text.

Task 2: Suggest a hex color code for the text that would contrast well with the image (ensure readability).

Return the result as a JSON object: { "text": "your text here", "color": "#RRGGBB" }`;

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
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
};

export const generateImageVariations = async (
    image: File,
    creativity: 'low' | 'medium' | 'high'
): Promise<string[]> => {
    console.log(`Generating image variations with ${creativity} creativity...`);
    const imagePart = await fileToPart(image);
    const prompt = `Generate 3 creative variations of the provided image.
Creativity Level: ${creativity}.
- Low: Make subtle changes to style, lighting, or background details.
- Medium: Re-imagine the scene with a different artistic style or setting, but keep the main subject recognizable.
- High: Take the core concept of the image and create a completely new, imaginative interpretation.
The output must be 3 distinct images. Do not return text.`;
    const textPart = { text: prompt };

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            // Per guidelines: 
            // - Must be an array with a single Modality.IMAGE element.
            // - Do not add other configs.
            responseModalities: [Modality.IMAGE],
        },
    });
    
    const imageParts = response.candidates?.[0]?.content?.parts?.filter(part => part.inlineData);

    if (imageParts && imageParts.length > 0) {
        return imageParts.map(part => `data:${part.inlineData!.mimeType};base64,${part.inlineData!.data}`);
    }

    throw new Error('The AI model did not return any image variations.');
};

export const generateExpansionSuggestions = async (
    image: File
): Promise<Array<{ direction: 'top' | 'bottom' | 'left' | 'right', prompt: string }>> => {
    console.log('Generating expansion suggestions with Flash...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const imagePart = await fileToPart(image);

    const prompt = `Analyze the provided image and suggest 2-3 logical and creative ways to generatively expand it. For each suggestion, provide a 'direction' ('top', 'bottom', 'left', 'right') and a 'prompt' (e.g., 'extend with more blue sky'). Focus on natural, coherent extensions. Return a JSON array of objects.

Example JSON format:
[
  { "direction": "top", "prompt": "more blue sky with fluffy clouds" },
  { "direction": "bottom", "prompt": "a calm, clear lake reflecting the scene" },
  { "direction": "left", "prompt": "a continuation of the forest into the distance" }
]`;

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
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
                    required: ['direction', 'prompt']
                },
            },
            safetySettings,
        },
    });

    const jsonText = response.text ? response.text.trim() : '';
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
};


export const generatePromptSuggestions = async (
    image: File,
    context: 'add' | 'replace'
): Promise<string[]> => {
    console.log(`Generating prompt suggestions for context: ${context} with Flash Lite`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    const imagePart = await fileToPart(image);
    let prompt = `Analyze the provided image. You are a creative assistant. Your goal is to suggest ideas for photo editing.`;

    if (context === 'add') {
        prompt += ` The user wants to add an object to the scene. Suggest 3-4 creative but contextually appropriate objects they could add. Keep the suggestions short and descriptive (e.g., "a small potted succulent", "a vintage camera", "a steaming mug of coffee").`;
    } else { // 'replace'
        prompt += ` The user wants to replace an object in the scene. Suggest 3-4 creative ideas for what to replace an object with, based on the image's context. Keep the suggestions short and descriptive (e.g., "a bouquet of wildflowers", "a crystal sculpture", "a miniature T-Rex").`;
    }
    
    prompt += ` Return the suggestions as a JSON object with a single key "suggestions" which is an array of strings.`;

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest', // Low latency
        contents: { parts: [imagePart, textPart] },
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
            },
            safetySettings,
        },
    });

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
};

export const generateAutoAdjustments = async (
    image: File
): Promise<Record<string, number>> => {
    console.log('Generating auto adjustments...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const imagePart = await fileToPart(image);
    const prompt = `You are a professional photo editor. Analyze the provided image and determine the optimal adjustments to enhance its quality. Provide adjustments for brightness, contrast, saturation, highlights, shadows, vibrance, temperature, and sharpness. Return the values as a JSON object, where each value is a number between -100 and 100. For example: {"brightness": 10, "contrast": 5, "saturation": -5, ...}. Only return the JSON object.`;
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
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
                },
            },
            safetySettings,
        },
    });

    const jsonText = response.text ? response.text.trim() : '';
    if (jsonText) {
        try {
            const result = JSON.parse(jsonText);
            return result;
        } catch (e) {
            console.error("Failed to parse auto-adjustments JSON:", e);
            throw new Error("AI failed to return valid adjustment data.");
        }
    }
    throw new Error("AI did not return any adjustment data.");
};

export const generateLuckyAdjustment = async (
    image: File
): Promise<string> => {
    console.log('Generating lucky adjustment with Gemini 3 Pro...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const imagePart = await fileToPart(image);
    const prompt = `You are a creative and professional photographer AI. Analyze the provided image and suggest a single, creative, and stylistic adjustment prompt. The prompt should be a descriptive instruction that could be given to a photo editor.

Examples of good prompts:
- "Give the image a warm, golden-hour glow with soft, hazy light and slightly muted colors."
- "Apply a cool, cinematic blue tint with high contrast shadows and sharpened details."
- "Transform it into a dreamy, ethereal photo with a soft-focus effect and pastel color grading."
- "Make it look like a vintage film photo from the 1970s with faded colors and a subtle grain."

Do not add any conversational text, explanations, or quotes. Only return the single prompt string as plain text.`;
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
            safetySettings,
        },
    });

    const luckyPrompt = response.text ? response.text.trim() : '';
    if (!luckyPrompt) {
        throw new Error("The AI did not return a lucky adjustment suggestion.");
    }
    return luckyPrompt;
}

export const enhancePrompt = async (
    originalPrompt: string
): Promise<string> => {
    if (!originalPrompt.trim()) return '';
    console.log(`Enhancing prompt: ${originalPrompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const prompt = `You are a professional prompt engineer for generative AI art.
The user has provided a basic prompt: "${originalPrompt}".
Your task is to rewrite and expand this prompt to generate a significantly higher quality, more detailed, and artistic result.
Add relevant details about lighting, style, texture, composition, and camera settings (e.g., "8k", "cinematic lighting", "photorealistic", "highly detailed").
Keep the core intent of the original prompt but make it "pro".
Return ONLY the enhanced prompt text.`;
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest', // Flash Lite is perfect for low-latency text expansion
        contents: { parts: [textPart] },
        config: { safetySettings }
    });

    return response.text ? response.text.trim() : originalPrompt;
};

export const generateSmartReplies = async (
    history: ChatMessage[]
): Promise<string[]> => {
    console.log('Generating smart replies with Flash Lite...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    // Provide the last few messages for context (keep it lightweight)
    const recentHistory = history.slice(-5).map(msg => `${msg.role}: ${msg.text}`).join('\n');
    
    const prompt = `You are a helpful AI assistant. Based on the following conversation history, suggest 3 short, relevant, and natural follow-up responses or questions that the USER might want to say next.
    
Conversation History:
${recentHistory}

Return the 3 suggestions as a JSON object with a single key "replies" which is an array of strings. Keep them concise (under 10 words).`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: { parts: [{ text: prompt }] },
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
            },
            safetySettings,
        },
    });

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
};

export const detectObjects = async (
    image: File,
    label: string
): Promise<{ ymin: number, xmin: number, ymax: number, xmax: number }[]> => {
    console.log(`Detecting objects: ${label}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const imagePart = await fileToPart(image);
    const prompt = `Detect the bounding boxes for objects matching the description: "${label}". 
Return the result as a JSON object with a single key "boxes" which is an array of objects.
Each object must have 'ymin', 'xmin', 'ymax', 'xmax' as integers on a scale of 0 to 1000.
If no objects are found, return an empty array.`;

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
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
            },
            safetySettings,
        },
    });

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
};


// --- NEW: Chat & Multimodal Features ---

export const analyzeVideo = async (
    videoFile: File,
    prompt: string
): Promise<string> => {
    console.log('Analyzing video with Gemini 3 Pro...');
    // Note: Video analysis requires uploading to File API first or using base64 for short clips.
    // Since full video file upload via File API is complex to implement purely client-side without a backend proxy for upload tokens,
    // we will use base64 for short clips (< 20MB) or warn user.
    // For robust implementation, we'd need the File API upload flow.
    // Here we assume short clip base64 for "fast preview" style analysis.
    
    if (videoFile.size > 20 * 1024 * 1024) {
        throw new Error("Video file is too large for client-side analysis. Please upload a clip under 20MB.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const { imageBytes, mimeType } = await fileToBase64(videoFile);
    
    const videoPart = {
        inlineData: {
            mimeType: mimeType,
            data: imageBytes
        }
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [videoPart, { text: prompt }] },
        config: { safetySettings }
    });

    return response.text ? response.text.trim() : "I couldn't analyze the video.";
};

export const transcribeAudio = async (
    audioFile: File
): Promise<string> => {
    console.log('Transcribing audio with Flash Lite...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const { imageBytes, mimeType } = await fileToBase64(audioFile);

    const audioPart = {
        inlineData: {
            mimeType: mimeType, // e.g., audio/mp3
            data: imageBytes
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: { parts: [audioPart, { text: "Transcribe this audio file. Output only the text." }] },
        config: { safetySettings }
    });

    return response.text ? response.text.trim() : "Transcription failed.";
};

export const generateSpeech = async (
    text: string,
    voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Puck'
): Promise<ArrayBuffer> => {
    console.log('Generating speech (TTS)...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: { parts: [{ text }] },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio returned");

    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    // Construct history for API
    const contents: Content[] = await Promise.all(history.map(async msg => {
        const parts: Part[] = [{ text: msg.text }];
        if (msg.image) {
            // Reconstruct inline data if we stored base64
            // For simple chat history we might skip sending old images to save tokens, 
            // but for "context" we ideally keep them. 
            // Simplified: Only sending text history, current image.
        }
        return { role: msg.role, parts };
    }));

    const currentParts: Part[] = [{ text: newMessage }];
    let base64Image = undefined;
    
    if (image) {
        const { imageBytes, mimeType } = await fileToBase64(image);
        base64Image = `data:${mimeType};base64,${imageBytes}`;
        currentParts.unshift({
            inlineData: {
                mimeType,
                data: imageBytes
            }
        });
    }

    const model = useReasoning ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
    const tools = [];
    
    if (useGrounding) {
        tools.push({ googleSearch: {} });
        tools.push({ googleMaps: {} });
    }

    const config: any = { safetySettings, tools };
    
    if (useReasoning) {
        config.thinkingConfig = { thinkingBudget: 1024 }; // Enable thinking
    }

    // Note: ChatSession from SDK manages history, but for stateless functional style we can use generateContent with full context
    // or create a transient ChatSession. Using generateContent for single-turn + context control is often simpler for custom UIs.
    // However, for proper multi-turn with tools, ChatSession is better.
    
    // Let's use the chat helper but we need to initialize it with history.
    const chat = ai.chats.create({
        model,
        history: contents,
        config
    });

    const result = await chat.sendMessage({ message: currentParts });
    
    return {
        role: 'model',
        text: result.text || "I couldn't generate a response.",
        groundingMetadata: result.candidates?.[0]?.groundingMetadata
    };
};