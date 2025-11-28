
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { type TextOptions, type MemeOptions } from '../types';

// Helper to convert a data URL string to a File object
export const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

// Helper to convert a File object to a data URL string
export const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

type WorkerTask = 'COMPRESS' | 'CROP' | 'TEXT' | 'MEMEIFY' | 'CONVERT';
type WorkerPayload = {
    file?: File;
    image?: File;
    crop?: { x: number; y: number; width: number; height: number; };
    imageElement?: { naturalWidth: number, naturalHeight: number, width: number, height: number };
    textOptions?: TextOptions;
    memeOptions?: MemeOptions;
    mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
    quality?: number;
    filename?: string;
};

// --- START INLINED WORKER CODE ---
const workerCode = `
const handleCompression = async (file, mimeType = 'image/jpeg') => {
    const imageBitmap = await createImageBitmap(file);
    const maxSize = 1280; // Increased slightly for better quality on reload
    const quality = 0.85;
    let { width, height } = imageBitmap;

    if (width > height) {
        if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
        }
    } else {
        if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
        }
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get OffscreenCanvas context');
    
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    const blobOptions = { type: mimeType };
    if (mimeType === 'image/jpeg') {
        blobOptions.quality = quality;
    }

    return await canvas.convertToBlob(blobOptions);
};

const handleCrop = async (imageFile, crop, imageElement) => {
    const imageBitmap = await createImageBitmap(imageFile);
    const canvas = new OffscreenCanvas(crop.width, crop.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get OffscreenCanvas context for cropping.');

    const scaleX = imageElement.naturalWidth / imageElement.width;
    const scaleY = imageElement.naturalHeight / imageElement.height;

    ctx.drawImage(
      imageBitmap,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );
    
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    return new File([blob], 'cropped-' + Date.now() + '.png', { type: 'image/png' });
};

const handleText = async (imageFile, options) => {
    const imageBitmap = await createImageBitmap(imageFile);
    const { width, height } = imageBitmap;
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get OffscreenCanvas context for text.');

    ctx.drawImage(imageBitmap, 0, 0);

    const fontSize = width * (options.size / 1000);
    ctx.font = (options.isItalic ? 'italic ' : '') + (options.isBold ? 'bold ' : '') + fontSize + 'px ' + options.fontFamily;
    ctx.fillStyle = options.color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    if (options.shadow) {
        ctx.shadowColor = options.shadow.color;
        ctx.shadowBlur = options.shadow.blur;
        ctx.shadowOffsetX = options.shadow.offsetX;
        ctx.shadowOffsetY = options.shadow.offsetY;
    }
    
    if (options.stroke) {
        ctx.strokeStyle = options.stroke.color;
        ctx.lineWidth = options.stroke.width;
    }

    const padding = fontSize * 0.5;
    let x = width / 2;
    let y = height / 2;

    if (options.position.includes('left')) { ctx.textAlign = 'left'; x = padding; }
    if (options.position.includes('right')) { ctx.textAlign = 'right'; x = width - padding; }
    if (options.position.includes('top')) { ctx.textBaseline = 'top'; y = padding; }
    if (options.position.includes('bottom')) { ctx.textBaseline = 'bottom'; y = height - padding; }
    
    if (options.stroke && options.stroke.width > 0) {
        ctx.strokeText(options.text, x, y);
    }
    ctx.fillText(options.text, x, y);

    const blob = await canvas.convertToBlob({ type: 'image/png' });
    return new File([blob], 'text-added-' + Date.now() + '.png', { type: 'image/png' });
};

const handleMemeify = async (imageFile, options) => {
    const imageBitmap = await createImageBitmap(imageFile);
    const { width, height } = imageBitmap;
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get OffscreenCanvas context for meme.');

    ctx.drawImage(imageBitmap, 0, 0);

    const fontSize = Math.max(20, Math.floor(width / 12));
    const fontFamily = 'Impact, Arial Black, sans-serif';
    ctx.font = 'bold ' + fontSize + 'px ' + fontFamily;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = Math.max(1, fontSize / 20);
    ctx.textAlign = 'center';
    
    const padding = fontSize * 0.25;

    // Helper function to draw wrapped text
    const drawText = (text, x, y, isTop) => {
        const lines = [];
        let currentLine = '';
        const words = text.toUpperCase().split(' ');

        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > width - padding * 2 && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        if (isTop) {
            ctx.textBaseline = 'top';
            let currentY = y;
            for (const line of lines) {
                ctx.strokeText(line, x, currentY);
                ctx.fillText(line, x, currentY);
                currentY += fontSize;
            }
        } else {
            ctx.textBaseline = 'bottom';
            let currentY = y;
            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i];
                ctx.strokeText(line, x, currentY);
                ctx.fillText(line, x, currentY);
                currentY -= fontSize;
            }
        }
    };

    if (options.topText) {
        drawText(options.topText, width / 2, padding, true);
    }
    if (options.bottomText) {
        drawText(options.bottomText, width / 2, height - padding, false);
    }

    const blob = await canvas.convertToBlob({ type: 'image/png' });
    return new File([blob], 'meme-' + Date.now() + '.png', { type: 'image/png' });
};

const handleConvert = async (file, options) => {
    const imageBitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get OffscreenCanvas context for conversion.');
    
    ctx.drawImage(imageBitmap, 0, 0);
    
    const blob = await canvas.convertToBlob({
        type: options.mimeType,
        quality: options.quality
    });
    
    return new File([blob], options.filename, { type: options.mimeType });
};

self.onmessage = async (event) => {
    const { task, payload } = event.data;

    try {
        let result;
        switch (task) {
            case 'COMPRESS':
                result = await handleCompression(payload.file, payload.mimeType);
                break;
            case 'CROP':
                result = await handleCrop(payload.image, payload.crop, payload.imageElement);
                break;
            case 'TEXT':
                result = await handleText(payload.image, payload.textOptions);
                break;
            case 'MEMEIFY':
                result = await handleMemeify(payload.image, payload.memeOptions);
                break;
            case 'CONVERT':
                result = await handleConvert(payload.file, payload);
                break;
            default:
                throw new Error('Unknown worker task: ' + task);
        }
        self.postMessage({ success: true, data: result });
    } catch (error) {
        self.postMessage({ success: false, error: error instanceof Error ? error.message : 'Unknown worker error' });
    }
};
`;
// --- END INLINED WORKER CODE ---


// Generic helper to process images using a dedicated web worker, preventing UI blocking.
export const processImageWithWorker = (
    task: WorkerTask, 
    payload: WorkerPayload
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(workerBlob);
        const worker = new Worker(workerUrl);

        const cleanup = () => {
            URL.revokeObjectURL(workerUrl);
            worker.terminate();
        };

        worker.onmessage = (event: MessageEvent<{ success: boolean; data?: any; error?: string }>) => {
            if (event.data.success) {
                if (task === 'COMPRESS') {
                    // Return the Blob directly for IndexedDB storage
                    resolve(event.data.data as Blob);
                    cleanup();
                } else {
                    // Other tasks return a new File object
                    resolve(event.data.data);
                    cleanup();
                }
            } else {
                console.error(`Worker task ${task} failed:`, event.data.error);
                reject(new Error(event.data.error));
                cleanup();
            }
        };

        worker.onerror = (error) => {
            const errorMessage = error.message || `An unknown error occurred in the image worker for task ${task}.`;
            console.error(`An error occurred in the image processing worker for task ${task}: ${errorMessage}`, error);
            reject(new Error(errorMessage));
            cleanup();
        };

        worker.postMessage({ task, payload });
    });
};
