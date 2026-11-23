/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { UndoIcon, RedoIcon, EyeIcon, FitToScreenIcon, CenterIcon, SaveIcon, DownloadIcon, ResetIcon, CopyIcon, CheckCircleIcon, ZoomInIcon, ZoomOutIcon } from './icons';

interface EditorHeaderProps {
    historyIndex: number;
    historyLength: number;
    isCompareViewActive: boolean;
    isSaveMenuOpen: boolean;
    isSaveSuccess: boolean;
    isCopySuccess: boolean;
    isSavingToCreations: boolean;
    handleUndo: () => void;
    handleRedo: () => void;
    handleReset: () => void;
    handleDownload: () => void;
    handleSaveToCreations: () => void;
    handleCopyToClipboard: () => void;
    handleFitToScreen: () => void;
    handleResetZoomPan: () => void;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    setIsCompareViewActive: (val: boolean) => void;
    setIsPeeking: (val: boolean) => void;
    setIsSaveMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    saveButtonRef: React.RefObject<HTMLDivElement | null>;
    t: (key: string) => string;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
    historyIndex,
    historyLength,
    isCompareViewActive,
    isSaveMenuOpen,
    isSaveSuccess,
    isCopySuccess,
    isSavingToCreations,
    handleUndo,
    handleRedo,
    handleReset,
    handleDownload,
    handleSaveToCreations,
    handleCopyToClipboard,
    handleFitToScreen,
    handleResetZoomPan,
    handleZoomIn,
    handleZoomOut,
    setIsCompareViewActive,
    setIsPeeking,
    setIsSaveMenuOpen,
    saveButtonRef,
    t,
}) => {
    return (
        <header className="flex items-center justify-between p-3 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/60 z-20">
            {/* Left Controls: History Undo/Redo & Compare */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="p-2 rounded-lg bg-gray-900/60 hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-gray-900/60 transition text-gray-200"
                    title={t('undo')}
                >
                    <UndoIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={handleRedo}
                    disabled={historyIndex >= historyLength - 1}
                    className="p-2 rounded-lg bg-gray-900/60 hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-gray-900/60 transition text-gray-200"
                    title={t('redo')}
                >
                    <RedoIcon className="w-5 h-5" />
                </button>

                <div className="h-5 w-px bg-gray-800 mx-1" />

                <button
                    onClick={() => setIsCompareViewActive(!isCompareViewActive)}
                    disabled={historyIndex === 0}
                    className={`p-2 rounded-lg transition ${
                        isCompareViewActive ? 'bg-indigo-600 text-white' : 'bg-gray-900/60 text-gray-300 hover:bg-gray-800'
                    } disabled:opacity-30`}
                    title={t('compareSlider')}
                >
                    <EyeIcon className="w-5 h-5" />
                </button>

                <button
                    onMouseDown={() => setIsPeeking(true)}
                    onMouseUp={() => setIsPeeking(false)}
                    onMouseLeave={() => setIsPeeking(false)}
                    disabled={historyIndex === 0}
                    className="p-2 rounded-lg bg-gray-900/60 hover:bg-gray-800 disabled:opacity-30 transition text-gray-300 active:bg-indigo-600"
                    title={t('peekOriginal')}
                >
                    <ResetIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Center Controls: View / Zoom */}
            <div className="flex items-center space-x-1.5 bg-gray-900/80 px-2 py-1 rounded-xl border border-gray-800/50">
                <button onClick={handleZoomOut} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-300 transition" title={t('zoomOut')}>
                    <ZoomOutIcon className="w-4 h-4" />
                </button>
                <button onClick={handleFitToScreen} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-300 transition" title={t('fitToScreen')}>
                    <FitToScreenIcon className="w-4 h-4" />
                </button>
                <button onClick={handleResetZoomPan} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-300 transition" title={t('resetZoom')}>
                    <CenterIcon className="w-4 h-4" />
                </button>
                <button onClick={handleZoomIn} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-300 transition" title={t('zoomIn')}>
                    <ZoomInIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Right Actions: Save / Export */}
            <div className="flex items-center space-x-2 relative" ref={saveButtonRef}>
                <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 text-sm font-medium transition"
                >
                    {isCopySuccess ? <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
                    <span>{isCopySuccess ? t('copied') : t('copy')}</span>
                </button>

                <button
                    onClick={handleDownload}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span>{t('export')}</span>
                </button>
            </div>
        </header>
    );
};

export default EditorHeader;
