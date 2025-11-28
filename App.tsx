
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import * as React from 'react';
import { Tooltip } from 'react-tooltip';
import * as geminiService from './services/geminiService';
import { dataURLtoFile, processImageWithWorker } from './utils/helpers';
import Header from './components/Header';
import Spinner from './components/Spinner';
import HistoryPanel from './components/HistoryPanel';
import Footer from './components/Footer';
import { UploadIcon } from './components/icons';
import StartScreen from './components/StartScreen';
import NebulaBackground from './components/NebulaBackground';
import CircuitBackground from './components/CircuitBackground';
import GridBackground from './components/GridBackground';
import MatrixBackground from './components/MatrixBackground';
import WikiModal from './components/WikiModal';
import ShortcutsModal from './components/ShortcutsModal';
import DownloadModal from './components/DownloadModal';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import { useBackground } from './contexts/BackgroundContext';
import EditorView from './components/EditorView';
import GeneratorView from './components/GeneratorView';
import VideoView from './components/VideoView';
import GalleryView from './components/GalleryView';
import ChatView from './components/ChatView';
import Toolbar from './components/Toolbar';
import { type Tab, AddToHistoryOptions } from './types';
import { useHistoryState } from './hooks/useHistoryState';
import { EditorProvider } from './contexts/EditorContext';

// Helper to check for paid API key for advanced models
const ensurePaidKey = async () => {
    if (typeof (window as any).aistudio !== 'undefined' && (window as any).aistudio.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            try {
                await (window as any).aistudio.openSelectKey();
                // Race condition handling: Assume success if dialog opens and user likely completes it
                return true; 
            } catch (e) {
                console.error("Failed to open key selection dialog", e);
                return false;
            }
        }
        return true;
    }
    return true; // Assume environment variable is set if not in the specific hosting environment
};

const App: React.FC = () => {
  const { t } = useLanguage();
  const { mode } = useTheme();
  const { background } = useBackground();
  
  const {
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
    currentImage,
    hasTransparentBackground
  } = useHistoryState(t);

  const [activeTab, setActiveTab] = React.useState<Tab | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = React.useState<boolean>(false);
  const [isWikiOpen, setIsWikiOpen] = React.useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = React.useState<boolean>(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Download Modal State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = React.useState(false);
  const [pendingDownloadFile, setPendingDownloadFile] = React.useState<File | null>(null);
  const [isProcessingDownload, setIsProcessingDownload] = React.useState(false);

  // State for Generator and Video views (which aren't in the EditorContext)
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = React.useState<string[]>([]);
  const [generatedImagesPrompt, setGeneratedImagesPrompt] = React.useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = React.useState<string | null>(null);
  const [generatedVideoPrompt, setGeneratedVideoPrompt] = React.useState<string>('');
  const [loadingMessageIndex, setLoadingMessageIndex] = React.useState(0);
  const [isSavingToCreations, setIsSavingToCreations] = React.useState(false);
  const [isGlobalDragging, setIsGlobalDragging] = React.useState(false);
  const dragCounter = React.useRef(0);

  // Set default editor tab once history is loaded from session
  React.useEffect(() => {
    if (isHistoryInitialized && history.length > 0 && activeTab === null) {
        setActiveTab(null); // Start with no tab selected
    }
  }, [isHistoryInitialized, history, activeTab]);
  
  // Effect to manage cycling loading messages
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isGenerating && (activeTab === 'video' || activeTab === 'generate')) {
      const imageLoadingMessages = [
        t('imageLoadingMessage1'), t('imageLoadingMessage2'), t('imageLoadingMessage3'),
        t('imageLoadingMessage4'), t('imageLoadingMessage5'), t('imageLoadingMessage6'),
      ];
      const videoLoadingMessages = [
        t('videoLoadingMessage1'), t('videoLoadingMessage2'), t('videoLoadingMessage3'),
        t('videoLoadingMessage4'), t('videoLoadingMessage5'), t('videoLoadingMessage6'),
        t('videoLoadingMessage7'), t('videoLoadingMessage8'), t('videoLoadingMessage9'),
      ];

      const messages = activeTab === 'video' ? videoLoadingMessages : imageLoadingMessages;
      
      const updateMessage = (index: number) => {
        setLoadingMessage(messages[index % messages.length]);
      };
      
      updateMessage(loadingMessageIndex);

      interval = setInterval(() => {
        setLoadingMessageIndex(prev => {
            const nextIndex = prev + 1;
            updateMessage(nextIndex);
            return nextIndex;
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, activeTab, loadingMessageIndex, t]);

  
  const handleUploadAndNavigate = React.useCallback((file: File, targetTab: Tab, options?: Omit<AddToHistoryOptions, 'hasTransparentBackground'>) => {
    if (!file.type.startsWith('image/')) {
        setError(t('errorInvalidFile'));
        return;
    }
    if (generatedVideoUrl) URL.revokeObjectURL(generatedVideoUrl);
    
    setError(null);
    setGeneratedImages([]);
    setGeneratedVideoUrl(null);
    
    setInitialHistory(file, options);
    setActiveTab(targetTab);
  }, [generatedVideoUrl, setInitialHistory, t]);
  
  const handleApiError = React.useCallback((err: unknown) => {
    let message = err instanceof Error ? err.message : 'An unknown error occurred.';
    let userFriendlyMessage = ``;
    if (message.includes('blocked')) userFriendlyMessage += t('errorBlocked');
    else if (message.includes('stopped unexpectedly')) userFriendlyMessage += t('errorStopped');
    else if (message.includes('did not return an image')) userFriendlyMessage += t('errorNoImage');
    else userFriendlyMessage = message;
    setError(userFriendlyMessage);
    console.error(err);
  }, [t]);
  
  const handleGenerateImages = React.useCallback(async (genPrompt: string, numImages: number, aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16', quality: 'standard' | 'pro', imageSize: '1K' | '2K' | '4K') => {
    if (quality === 'pro') {
        await ensurePaidKey();
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    setGeneratedVideoUrl(null);
    setGeneratedImagesPrompt(genPrompt);
    setLoadingMessageIndex(0);
    try {
        const images = await geminiService.generateImages(genPrompt, numImages, aspectRatio, quality, imageSize);
        setGeneratedImages(images);
    } catch (err) {
        handleApiError(err);
    } finally {
        setIsGenerating(false);
    }
  }, [handleApiError]);
  
  const handleGenerateVideo = React.useCallback(async (genPrompt: string, image?: File) => {
    await ensurePaidKey();
    
    setIsGenerating(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setGeneratedVideoPrompt(genPrompt);
    setGeneratedImages([]);
    setLoadingMessageIndex(0);
    try {
        const downloadLink = await geminiService.generateVideo(genPrompt, image);
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await response.blob();
        const objectUrl = URL.createObjectURL(videoBlob);
        setGeneratedVideoUrl(objectUrl);
    } catch (err) {
        handleApiError(err);
    } finally {
        setIsGenerating(false);
    }
  }, [handleApiError]);

  const handleSelectGeneratedImageForEditing = React.useCallback((base64Image: string) => {
    const file = dataURLtoFile(base64Image, `generated-${Date.now()}.png`);
    const shortPrompt = generatedImagesPrompt.length > 50 ? generatedImagesPrompt.substring(0, 50) + '...' : generatedImagesPrompt;
    const options = {
        action: t('actionGenerated', `Generated: ${shortPrompt}`),
        actionKey: 'actionGenerated' as any, // Cast to any to satisfy the key type
        actionParams: { prompt: shortPrompt }
    };
    handleUploadAndNavigate(file, 'erase', options);
  }, [handleUploadAndNavigate, generatedImagesPrompt, t]);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadAndNavigate(file, 'erase');
    }
    if (e.target) {
      e.target.value = ''; // Reset for re-uploading the same file
    }
  };

  const handleUploadNew = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDownload = React.useCallback((file?: File) => {
      const fileToDownload = file || currentImage;
      if (!fileToDownload) return;
      
      if (fileToDownload.type.startsWith('video/')) {
          // Direct download for videos
          const url = URL.createObjectURL(fileToDownload);
          const link = document.createElement('a');
          link.href = url;
          // Append random number to video filename
          link.download = `luminescence-video-${Date.now()}-${Math.floor(Math.random() * 10000)}.mp4`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      } else {
          // Open modal for images
          setPendingDownloadFile(fileToDownload);
          setIsDownloadModalOpen(true);
      }
  }, [currentImage]);
  
  const handleDownloadConfirm = async (filename: string, format: 'png' | 'jpeg' | 'webp', quality: number) => {
      if (!pendingDownloadFile) return;
      setIsProcessingDownload(true);
      
      try {
          const mimeType = `image/${format}` as 'image/png' | 'image/jpeg' | 'image/webp';
          const finalFile = await processImageWithWorker('CONVERT', {
              file: pendingDownloadFile,
              mimeType: mimeType,
              quality: quality,
              filename: `${filename}.${format === 'jpeg' ? 'jpg' : format}`
          });
          
          const url = URL.createObjectURL(finalFile);
          const link = document.createElement('a');
          link.href = url;
          link.download = finalFile.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setIsDownloadModalOpen(false);
      } catch (e) {
          console.error("Export failed", e);
          setError("Failed to process download. Please try a different format.");
      } finally {
          setIsProcessingDownload(false);
          setPendingDownloadFile(null);
      }
  };
  
  const handleSaveToCreations = async (file?: File): Promise<boolean> => {
    const fileToSave = file || currentImage;
    if (!fileToSave) return false;
    
    setIsSavingToCreations(true);
    try {
      const { addCreation } = await import('./utils/db');
      await addCreation({
        type: 'image',
        blob: fileToSave,
        thumbnailBlob: fileToSave, // For images, thumb is the same
        createdAt: new Date(),
      });
      return true;
    } catch (dbError) {
      console.error("Failed to save creation:", dbError);
      setError(dbError instanceof Error ? dbError.message : 'Failed to save to creations gallery.');
      return false;
    } finally {
      setIsSavingToCreations(false);
    }
  };

  const handleGoHome = React.useCallback(() => {
    if (generatedVideoUrl) {
      URL.revokeObjectURL(generatedVideoUrl);
    }
    
    resetHistory();
    
    setActiveTab(null);
    setError(null);
    setGeneratedImages([]);
    setGeneratedImagesPrompt('');
    setGeneratedVideoUrl(null);
    setGeneratedVideoPrompt('');
    
  }, [generatedVideoUrl, resetHistory]);

  const handleRemix = React.useCallback((prompt: string) => {
      setGeneratedImagesPrompt(prompt);
      setGeneratedImages([]);
      setError(null);
      setActiveTab('generate');
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
        else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Global Drag and Drop Logic
  React.useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsGlobalDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setIsGlobalDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsGlobalDragging(false);
      dragCounter.current = 0;
      
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        handleUploadAndNavigate(file, 'erase');
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleUploadAndNavigate]);

  // Editor mode detection to maximize workspace
  const isEditorMode = !!currentImage && activeTab !== 'chat' && activeTab !== 'gallery' && activeTab !== 'video' && activeTab !== 'generate';

  const renderContent = () => {
    if (!isHistoryInitialized) {
        return (
            <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center h-[70vh]">
                <Spinner />
            </div>
        );
    }

    if (activeTab === 'chat') {
        return <ChatView onEditImage={(file) => handleUploadAndNavigate(file, 'erase')} />;
    }

    if (activeTab === 'generate') {
        return <GeneratorView 
            isLoading={isGenerating} 
            loadingMessage={loadingMessage} 
            generatedImages={generatedImages} 
            prompt={generatedImagesPrompt}
            error={error} 
            setError={setError} 
            onSelectForEditing={handleSelectGeneratedImageForEditing} 
            onDownload={handleDownload} 
            onGenerate={handleGenerateImages}
        />;
    }

    if (activeTab === 'video') {
        return <VideoView 
            isLoading={isGenerating}
            loadingMessage={loadingMessage}
            generatedVideoUrl={generatedVideoUrl}
            prompt={generatedVideoPrompt}
            error={error}
            setError={setError}
            onDownload={handleDownload}
            onGenerate={handleGenerateVideo}
        />;
    }

    if (activeTab === 'gallery') {
      return <GalleryView onEdit={handleUploadAndNavigate} setError={setError} onRemix={handleRemix} />;
    }

    if (currentImage) {
        return (
          <EditorProvider currentImage={currentImage} addImageToHistory={addImageToHistory}>
            <EditorView 
                history={history}
                historyIndex={historyIndex}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                hasTransparentBackground={hasTransparentBackground}
                isPanelCollapsed={isPanelCollapsed}
                isSavingToCreations={isSavingToCreations}
                handleUndo={undo}
                handleRedo={redo}
                handleReset={resetHistoryPosition}
                handleUploadNew={handleUploadNew}
                handleDownload={handleDownload}
                handleSaveToCreations={handleSaveToCreations}
                addImageToHistory={addImageToHistory}
            />
          </EditorProvider>
        );
    }
    
    return <StartScreen 
        onFileSelect={handleUploadAndNavigate} 
        onGenerateClick={() => {
            setGeneratedImages([]);
            setGeneratedVideoUrl(null);
            setError(null);
            setActiveTab('generate');
        }}
        onVideoClick={() => {
            setGeneratedImages([]);
            setGeneratedVideoUrl(null);
            setError(null);
            setActiveTab('video');
        }}
        onGalleryClick={() => {
            setError(null);
            setActiveTab('gallery');
        }}
    />;
  };
  
  const renderBackground = () => {
    if (mode !== 'dark') return null;

    switch(background) {
        case 'nebula': return <NebulaBackground />;
        case 'circuit': return <CircuitBackground />;
        case 'grid': return <GridBackground />;
        case 'matrix': return <MatrixBackground />;
        default: return null;
    }
  };

  return (
    // Updated: h-screen instead of min-h-screen to lock viewport
    <div className="relative isolate bg-transparent text-gray-900 dark:text-gray-100 h-screen flex flex-col overflow-hidden">
      {renderBackground()}
      <Header 
        onUploadClick={handleUploadNew} 
        onWikiClick={() => setIsWikiOpen(true)} 
        onGoHome={handleGoHome} 
        onChatClick={() => setActiveTab('chat')}
        onShortcutsClick={() => setIsShortcutsModalOpen(true)}
        onHistoryClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
        isHistoryAvailable={history.length > 0 && activeTab !== 'video' && activeTab !== 'gallery' && activeTab !== 'chat'}
      />
      <div className="flex flex-grow relative overflow-hidden min-h-0">
        {/* If in Editor Mode, we use p-4 to give a small "margin" around the card, but ensure it fits the screen height */}
        <main className={`relative z-10 flex items-start flex-grow w-full h-full transition-all duration-300 min-h-0 ${isEditorMode ? 'p-4 md:p-6 gap-4' : 'p-4 md:p-8 gap-6'}`}>
          <div className="flex-grow flex flex-col gap-0 w-full h-full min-h-0">
             {/* Always show toolbar if an image is loaded OR if we are in Chat mode */}
            {(currentImage || activeTab === 'chat') && (
                <div className="flex-shrink-0 mb-2">
                    <Toolbar 
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                </div>
            )}
            {/* Content Container: Removed h-full to let flex-grow handle resizing properly within parent */}
            <div className="flex-grow flex w-full overflow-hidden relative min-h-0">
                {renderContent()}
            </div>
          </div>
          {isHistoryPanelOpen && history.length > 0 && activeTab !== 'video' && activeTab !== 'gallery' && activeTab !== 'chat' && !isEditorMode && (
              <HistoryPanel 
                  history={history}
                  currentIndex={historyIndex}
                  onJump={jumpToState}
                  onDownload={handleDownload}
              />
          )}
        </main>
      </div>
      
      {/* Footer is typically hidden in full-screen editor mode to save space, or kept minimal */}
      {!isEditorMode && <Footer />}

       <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileSelected}
      />
      
      <WikiModal isOpen={isWikiOpen} onClose={() => setIsWikiOpen(false)} />
      <ShortcutsModal isOpen={isShortcutsModalOpen} onClose={() => setIsShortcutsModalOpen(false)} />
      <DownloadModal 
        isOpen={isDownloadModalOpen} 
        onClose={() => { setIsDownloadModalOpen(false); setPendingDownloadFile(null); }} 
        onConfirm={handleDownloadConfirm}
        isProcessing={isProcessingDownload}
      />
      <Tooltip id="app-tooltip" className="app-tooltip" />
      
      {isGlobalDragging && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="border-4 border-dashed border-theme-accent rounded-3xl p-12 flex flex-col items-center justify-center gap-6 bg-white/10 shadow-2xl pointer-events-none transform scale-110 transition-transform">
                <div className="p-6 bg-theme-accent/20 rounded-full animate-bounce">
                    <UploadIcon className="w-16 h-16 text-theme-accent" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">{t('dropToUpload')}</h2>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
