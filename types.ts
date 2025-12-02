
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type Tab = 'generate' | 'video' | 'erase' | 'retouch' | 'text' | 'adjust' | 'filters' | 'crop' | 'expand' | 'upscale' | 'restore' | 'background' | 'product' | 'cardify' | 'memeify' | 'gallery' | 'add-product' | 'color' | 'style-transfer' | 'captions' | 'variations' | 'chat' | 'gif' | 'enhance' | 'sketch' | 'focus' | 'merge';

export interface HistoryItem {
    action: string;
    actionKey: string;
    actionParams?: Record<string, string | number>;
    file: File;
    thumbnailUrl: string;
    hasTransparentBackground: boolean;
}

export interface SerializableHistoryItem {
    action: string;
    actionKey: string;
    actionParams?: Record<string, string | number>;
    file: Blob; // Changed from string (Base64) to Blob for efficient binary storage
    thumbnailUrl: string; // placeholder
    hasTransparentBackground: boolean;
}

// For the useHistoryState hook
export interface AddToHistoryOptions {
    action: string;
    actionKey: string;
    actionParams?: Record<string, string | number>;
    hasTransparentBackground?: boolean;
}

// For the TextPanel and image worker
export type Position = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface TextOptions {
    text: string;
    fontFamily: string;
    size: number;
    color: string;
    isBold: boolean;
    isItalic: boolean;
    position: Position;
    stroke?: {
        color: string;
        width: number;
    };
    shadow?: {
        color: string;
        blur: number;
        offsetX: number;
        offsetY: number;
    };
}

export interface MemeOptions {
    topText: string;
    bottomText: string;
}

// For the Gallery / My Creations
export type CreationType = 'image' | 'video';

export interface Creation {
    id?: number;
    type: CreationType;
    blob: Blob;
    thumbnailBlob: Blob;
    prompt?: string;
    createdAt: Date;
}
