
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { chatWithGemini, analyzeVideo, transcribeAudio, generateSpeech, generateSmartReplies } from '../services/geminiService';
import { useLiveSession } from '../hooks/useLiveSession';
import { ChatIcon, MicrophoneOnIcon, MicrophoneOffIcon, UploadIcon, VideoIcon, MapIcon, SpeakerLoudIcon, RobotIcon, SparkleIcon, TrashIcon } from './icons';
import Spinner from './Spinner';
import { dataURLtoFile } from '../utils/helpers';

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    image?: string;
    grounding?: any;
    isThinking?: boolean;
}

const ChatView: React.FC = () => {
    const { t } = useLanguage();
    const [messages, setMessages] = React.useState<Message[]>([{
        id: 'welcome',
        role: 'model',
        text: 'Hello! I am your AI assistant. You can chat with me, ask me to analyze videos or audio, or switch to Live Voice mode for a conversation. How can I help you today?'
    }]);
    const [inputValue, setInputValue] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isVoiceMode, setIsVoiceMode] = React.useState(false);
    const [useReasoning, setUseReasoning] = React.useState(false);
    const [attachedFile, setAttachedFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [smartReplies, setSmartReplies] = React.useState<string[]>([]);
    
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    // Persist AudioContext for TTS to avoid running out of contexts (browser limit is usually 6)
    const ttsAudioContextRef = React.useRef<AudioContext | null>(null);
    
    const { connect, disconnect, isConnected, isSpeaking, volume, error: liveError } = useLiveSession();

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup TTS context on unmount
    React.useEffect(() => {
        return () => {
            if (ttsAudioContextRef.current) {
                ttsAudioContextRef.current.close();
            }
        };
    }, []);

    // Toggle Voice Mode
    const toggleVoiceMode = () => {
        if (isVoiceMode) {
            disconnect();
            setIsVoiceMode(false);
        } else {
            setIsVoiceMode(true);
            connect();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSendMessage = async (textOverride?: string) => {
        const text = textOverride || inputValue;
        if ((!text.trim() && !attachedFile) || isLoading) return;

        setSmartReplies([]); // Clear suggestions
        
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: text,
            image: previewUrl && attachedFile?.type.startsWith('image/') ? previewUrl : undefined
        };
        
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        // Optimistic cleanup
        const currentFile = attachedFile;
        setAttachedFile(null);
        setPreviewUrl(null);

        try {
            let responseText = '';
            let groundingMetadata = undefined;

            if (currentFile?.type.startsWith('video/')) {
                responseText = await analyzeVideo(currentFile, userMsg.text || "Describe this video.");
            } else if (currentFile?.type.startsWith('audio/')) {
                responseText = await transcribeAudio(currentFile);
            } else {
                // Text or Image Chat
                const result = await chatWithGemini(
                    messages.map(m => ({ role: m.role, text: m.text })),
                    userMsg.text,
                    currentFile || undefined,
                    useReasoning
                );
                responseText = result.text;
                groundingMetadata = result.groundingMetadata;
            }

            const modelMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                grounding: groundingMetadata
            };
            setMessages(prev => [...prev, modelMsg]);

            // Generate Smart Replies
            const replies = await generateSmartReplies([...messages, userMsg, modelMsg]);
            setSmartReplies(replies);

        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: 'model',
                text: "I encountered an error processing your request. Please try again."
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClearChat = () => {
        setMessages([{
            id: 'welcome',
            role: 'model',
            text: 'Hello! I am your AI assistant. You can chat with me, ask me to analyze videos or audio, or switch to Live Voice mode for a conversation. How can I help you today?'
        }]);
        setSmartReplies([]);
    };

    const handleTTS = async (text: string) => {
        try {
            const audioBuffer = await generateSpeech(text);
            
            // Initialize context lazily if needed
            if (!ttsAudioContextRef.current) {
                ttsAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            
            const ctx = ttsAudioContextRef.current;
            
            // Resume context if suspended (browser autoplay policy)
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            const buffer = await ctx.decodeAudioData(audioBuffer);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start();
        } catch (e) {
            console.error("TTS Failed", e);
        }
    };

    // Simple Markdown Renderer
    const renderText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={index} className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm font-mono text-red-500 dark:text-red-300">{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    return (
        <div className="flex flex-col w-full h-[calc(100vh-100px)] max-w-5xl mx-auto p-4 gap-4 animate-fade-in">
            {/* Header / Mode Switch */}
            <div className="flex items-center justify-between bg-white/50 dark:bg-gray-900/50 p-4 rounded-2xl backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isVoiceMode ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-blue-100 text-blue-500'}`}>
                        {isVoiceMode ? <MicrophoneOnIcon className="w-6 h-6" /> : <ChatIcon className="w-6 h-6" />}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 dark:text-gray-200">{isVoiceMode ? 'Live Voice Mode' : 'AI Assistant'}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{isVoiceMode ? 'Gemini Live (Real-time)' : 'Gemini 3 Pro & Flash'}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {!isVoiceMode && (
                        <>
                            <button 
                                onClick={handleClearChat}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                                title={t('clearChat', 'Clear Chat')}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setUseReasoning(!useReasoning)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-2 ${useReasoning ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}
                            >
                                <SparkleIcon className="w-3 h-3" /> Thinking {useReasoning ? 'ON' : 'OFF'}
                            </button>
                        </>
                    )}
                    <button
                        onClick={toggleVoiceMode}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${isVoiceMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-theme-gradient text-white hover:shadow-lg'}`}
                    >
                        {isVoiceMode ? 'End Live Session' : 'Start Live Voice'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow relative overflow-hidden rounded-3xl glass-panel border border-white/20 dark:border-white/10 shadow-2xl bg-white/40 dark:bg-black/40">
                {isVoiceMode ? (
                    // Voice Mode UI
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8 text-center">
                        {liveError ? (
                            <div className="text-red-500 font-bold">{liveError}</div>
                        ) : (
                            <>
                                <div className="relative flex items-center justify-center">
                                    {/* Audio Visualizer */}
                                    <div className="flex gap-1 items-center h-32">
                                        {[...Array(5)].map((_, i) => (
                                             <div 
                                                key={i} 
                                                className="w-4 bg-theme-gradient rounded-full transition-all duration-75 ease-in-out"
                                                style={{ 
                                                    height: `${Math.max(10, volume * 300 * (Math.random() + 0.5))}px`,
                                                    opacity: isSpeaking || isConnected ? 1 : 0.3
                                                }}
                                             />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white animate-pulse">
                                        {isConnected ? (isSpeaking ? "Speaking..." : "Listening...") : "Connecting..."}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">Speak naturally. Tap 'End Live Session' to return to chat.</p>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    // Text Chat UI
                    <div className="absolute inset-0 flex flex-col">
                        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-theme-accent/10 border border-theme-accent text-theme-accent' : 'bg-theme-gradient text-white shadow-md'}`}>
                                        {msg.role === 'user' ? <div className="w-2 h-2 bg-theme-accent rounded-full" /> : <RobotIcon className="w-5 h-5" />}
                                    </div>
                                    
                                    <div className={`max-w-[85%] space-y-2`}>
                                        <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 rounded-tr-none border border-theme-accent/20' : 'bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700'}`}>
                                            {msg.image && <img src={msg.image} alt="Attachment" className="max-h-64 rounded-lg mb-3 object-cover shadow-sm" />}
                                            <div className="prose dark:prose-invert text-sm leading-relaxed whitespace-pre-wrap">
                                                {renderText(msg.text)}
                                            </div>
                                        </div>
                                        
                                        {msg.role === 'model' && (
                                            <div className="flex flex-col gap-2 pl-2">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleTTS(msg.text)} className="p-1.5 text-gray-500 hover:text-theme-accent transition-colors" title="Read Aloud">
                                                        <SpeakerLoudIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                
                                                {/* Grounding Chips */}
                                                {msg.grounding?.groundingChunks && (
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {msg.grounding.groundingChunks.map((chunk: any, idx: number) => {
                                                            if (chunk.web?.uri) {
                                                                return (
                                                                    <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800">
                                                                        <SparkleIcon className="w-3 h-3" /> 
                                                                        <span className="truncate max-w-[150px]">{chunk.web.title || "Source"}</span>
                                                                    </a>
                                                                )
                                                            }
                                                            if (chunk.maps) {
                                                                return (
                                                                    <button key={idx} className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800 cursor-default">
                                                                        <MapIcon className="w-3 h-3" /> 
                                                                        <span>{chunk.maps.title || "Map Location"}</span>
                                                                    </button>
                                                                )
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Smart Replies */}
                        {smartReplies.length > 0 && !isLoading && (
                            <div className="px-6 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                                {smartReplies.map((reply, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSendMessage(reply)}
                                        className="flex-shrink-0 px-4 py-2 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow-sm transition-all active:scale-95 whitespace-nowrap"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-white/60 dark:bg-black/60 border-t border-gray-200 dark:border-gray-700 backdrop-blur-md">
                            {previewUrl && (
                                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 dark:bg-white/5 rounded-lg w-fit border border-gray-200 dark:border-white/10">
                                    <img src={previewUrl} alt="Preview" className="w-8 h-8 rounded object-cover" />
                                    <span className="text-xs font-bold text-gray-500 uppercase">{attachedFile?.type.split('/')[0]} attached</span>
                                    <button onClick={() => { setAttachedFile(null); setPreviewUrl(null); }} className="text-red-500 hover:text-red-700 ml-2 text-lg leading-none">&times;</button>
                                </div>
                            )}
                            
                            <div className="flex items-end gap-2">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-theme-accent hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                                    title="Upload Image, Video or Audio"
                                >
                                    <UploadIcon className="w-6 h-6" />
                                </button>
                                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,video/*,audio/*" />
                                
                                <div className="flex-grow relative">
                                    <textarea 
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                                        placeholder="Message Gemini..."
                                        className="w-full bg-gray-100 dark:bg-white/10 border-transparent focus:border-theme-accent focus:ring-0 rounded-xl p-3 pr-12 resize-none h-12 max-h-32 custom-scrollbar text-gray-800 dark:text-gray-100 shadow-inner"
                                        disabled={isLoading}
                                    />
                                    <button 
                                        onClick={() => handleSendMessage()}
                                        disabled={!inputValue.trim() && !attachedFile || isLoading}
                                        className="absolute right-2 bottom-2 p-1.5 bg-theme-gradient text-white rounded-lg transition-transform active:scale-90 disabled:opacity-50 disabled:scale-100 shadow-sm"
                                    >
                                        {isLoading ? <Spinner /> : <ChatIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                    Gemini can make mistakes. Double check important information.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(ChatView);
