
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';
import { HistoryItem, SerializableHistoryItem, AddToHistoryOptions } from '../types';
import { processImageWithWorker } from '../utils/helpers';
import { saveSession, getSession, clearSession } from '../utils/db';

export const useHistoryState = (t: (key: string, fallback?: string) => string) => {
    const [history, setHistory] = React.useState<HistoryItem[]>([]);
    const [historyIndex, setHistoryIndex] = React.useState<number>(-1);
    const [isHistoryInitialized, setIsHistoryInitialized] = React.useState<boolean>(false);
    
    // Load session from IndexedDB on initial mount
    React.useEffect(() => {
        let isMounted = true;
        
        // Fix for "Local storage full": aggressively clear the old key if it exists
        try {
            if (localStorage.getItem('gemini_app_history')) {
                console.log("Clearing legacy local storage history to free up quota.");
                localStorage.removeItem('gemini_app_history');
            }
        } catch (e) {
            console.warn("Could not clear local storage:", e);
        }

        const load = async () => {
            try {
                const savedSession = await getSession();
                if (savedSession) {
                    const { history: serializedHistory, historyIndex: savedIndex } = savedSession;
                    
                    const newHistory: HistoryItem[] = serializedHistory.map((item: SerializableHistoryItem) => {
                        // item.file is now expected to be a Blob from IndexedDB
                        const mimeType = item.file.type || (item.hasTransparentBackground ? 'image/png' : 'image/jpeg');
                        const extension = mimeType.split('/')[1] || 'png';
                        const file = new File([item.file], `restored-image-${Date.now()}.${extension}`, { type: mimeType });
                        return {
                            ...item,
                            file, // Reconstructed File object
                            thumbnailUrl: URL.createObjectURL(file),
                        };
                    });
                    
                    if (isMounted && newHistory.length > 0) {
                        setHistory(newHistory);
                        setHistoryIndex(savedIndex);
                    }
                }
            } catch (err) {
                console.error("Failed to load session from IndexedDB:", err);
                await clearSession();
            } finally {
                if (isMounted) {
                    setIsHistoryInitialized(true);
                }
            }
        };

        load();
        
        return () => { 
            isMounted = false;
        };
    }, []);

    // Save session to IndexedDB whenever history changes
    React.useEffect(() => {
        if (!isHistoryInitialized) return;

        const save = async () => {
            if (history.length > 0) {
                try {
                    const compressedHistory = await Promise.all(
                        history.map(async (item) => {
                            const mimeType = item.hasTransparentBackground ? 'image/png' : 'image/jpeg';
                            // processImageWithWorker now returns a Blob for 'COMPRESS' task
                            const compressedBlob = await processImageWithWorker('COMPRESS', { file: item.file, mimeType: mimeType });
                            return { ...item, file: compressedBlob, thumbnailUrl: '' };
                        })
                    );
                    const sessionData = { history: compressedHistory, historyIndex };
                    await saveSession(sessionData);
                } catch (err) {
                    console.error("Failed to save session:", err);
                }
            } else {
                await clearSession();
            }
        };

        save();
    }, [history, historyIndex, isHistoryInitialized]);
    
    const addImageToHistory = React.useCallback((newImageFile: File, options: AddToHistoryOptions) => {
        setHistory(prevHistory => {
            const currentItem = prevHistory[historyIndex];
            const currentHasTransparentBg = currentItem?.hasTransparentBackground ?? false;

            const newHistoryItem: HistoryItem = {
                file: newImageFile,
                thumbnailUrl: URL.createObjectURL(newImageFile),
                action: options.action,
                actionKey: options.actionKey,
                actionParams: options.actionParams,
                hasTransparentBackground: options.hasTransparentBackground ?? currentHasTransparentBg
            };

            const newHistory = [...prevHistory.slice(0, historyIndex + 1), newHistoryItem];
            
            // Cleanup old object URLs
            const replacedHistory = prevHistory.slice(historyIndex + 1);
            replacedHistory.forEach(item => URL.revokeObjectURL(item.thumbnailUrl));
            
            return newHistory;
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    const setInitialHistory = React.useCallback((file: File, options?: Omit<AddToHistoryOptions, 'hasTransparentBackground'>) => {
        // Clean up any existing history object URLs before replacing
        history.forEach(item => URL.revokeObjectURL(item.thumbnailUrl));
        
        const initialItem: HistoryItem = {
            file,
            hasTransparentBackground: false,
            action: options?.action || t('originalImage', 'Original Image'),
            actionKey: options?.actionKey || 'originalImage',
            actionParams: options?.actionParams,
            thumbnailUrl: URL.createObjectURL(file),
        };
        setHistory([initialItem]);
        setHistoryIndex(0);
    }, [history, t]);

    const undo = React.useCallback(() => {
        setHistoryIndex(prev => Math.max(0, prev - 1));
    }, []);
    
    const redo = React.useCallback(() => {
        setHistoryIndex(prev => Math.min(history.length - 1, prev + 1));
    }, [history.length]);

    const jumpToState = React.useCallback((index: number) => {
        if (index >= 0 && index < history.length) {
            setHistoryIndex(index);
        }
    }, [history.length]);

    const resetHistoryPosition = React.useCallback(() => {
        if (history.length > 0) {
            setHistoryIndex(0);
        }
    }, [history.length]);

    const resetHistory = React.useCallback(() => {
        // Clean up any existing history object URLs before replacing
        history.forEach(item => URL.revokeObjectURL(item.thumbnailUrl));
        setHistory([]);
        setHistoryIndex(-1);
        // The useEffect will catch the empty array and call clearSession()
    }, [history]);

    return {
        history,
        historyIndex,
        isHistoryInitialized,
        addImageToHistory,
        setInitialHistory,
        undo,
        redo,
        jumpToState,
        resetHistoryPosition,
        resetHistory,
        currentImage: history[historyIndex]?.file ?? null,
        hasTransparentBackground: history[historyIndex]?.hasTransparentBackground ?? false,
    };
};
