
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { chatWithGeminiStream, analyzeVideo, transcribeAudio, generateSpeech, generateSmartReplies } from '../services/geminiService';
import { useLiveSession } from '../hooks/useLiveSession';
import { ChatIcon, MicrophoneOnIcon, MicrophoneOffIcon, UploadIcon, VideoIcon, MapIcon, SpeakerLoudIcon, RobotIcon, SparkleIcon, TrashIcon, EditIcon } from './icons';
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

interface ChatViewProps {
    onEditImage?: (file: File) => void;
}

// --- Markdown Renderer Component ---
const MarkdownRenderer: React.FC<{ text: string }> = React.memo(({ text }) => {
    const { t } = useLanguage();
    const elements: React.ReactNode[] = [];
    
    // Split by code blocks first: ```lang ... ```
    const parts = text.split(/```(\w*)\n([\s\S]*?)```/g);
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (i % 3 === 0) {
            // Regular text processing
            if (!part.trim()) continue;
            
            // Simple table detection (basic support for pipes |)
            // We look for blocks that look like tables
            const tableBlockRegex = /((?:\|.+?\|\n)+)/g;
            const textParts = part.split(tableBlockRegex);

            textParts.forEach((textPart, tpIdx) => {
                if (textPart.trim().startsWith('|') && textPart.includes('\n')) {
                    // Render Table
                    const rows = textPart.trim().split('\n').map(row => row.split('|').filter(c => c.trim() !== '').map(c => c.trim()));
                    if (rows.length > 1) {
                        const headers = rows[0];
                        const alignments = rows[1].map(cell => {
                            if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
                            if (cell.endsWith(':')) return 'right';
                            return 'left';
                        });
                        const bodyRows = rows.slice(2);

                        elements.push(
                            <div key={`table-${i}-${tpIdx}`} className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            {headers.map((h, hIdx) => (
                                                <th key={hIdx} scope="col" className="px-6 py-3">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bodyRows.map((row, rIdx) => (
                                            <tr key={rIdx} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                {row.map((cell, cIdx) => (
                                                    <td key={cIdx} className="px-6 py-4 text-gray-900 dark:text-white">{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                        return;
                    }
                }

                // Fallback to standard line processing if not a table
                const lines = textPart.split('\n');
                let currentList: React.ReactNode[] = [];
                let inList = false;

                lines.forEach((line, lineIdx) => {
                    const trimmed = line.trim();
                    const isListItem = trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed);
                    const isHeader = trimmed.startsWith('###');

                    if (inList && !isListItem) {
                        elements.push(<ul key={`list-${i}-${tpIdx}-${lineIdx}`} className="list-disc list-inside mb-2 pl-2">{currentList}</ul>);
                        currentList = [];
                        inList = false;
                    }

                    const processInline = (content: string) => {
                        return content.split(/(\*\*.*?\*\*|`.*?`)/g).map((span, j) => {
                            if (span.startsWith('**') && span.endsWith('**')) {
                                return <strong key={j} className="font-bold text-gray-900 dark:text-white">{span.slice(2, -2)}</strong>;
                            }
                            if (span.startsWith('`') && span.endsWith('`')) {
                                return <code key={j} className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm font-mono text-red-500 dark:text-red-300">{span.slice(1, -1)}</code>;
                            }
                            return span;
                        });
                    };

                    if (isListItem) {
                        inList = true;
                        const content = trimmed.replace(/^[-*]\s+|^\d+\.\s+/, '');
                        currentList.push(<li key={`li-${i}-${tpIdx}-${lineIdx}`}>{processInline(content)}</li>);
                    } else if (isHeader) {
                        const content = trimmed.replace(/^###\s+/, '');
                        elements.push(<h3 key={`h3-${i}-${tpIdx}-${lineIdx}`} className="text-lg font-bold mt-4 mb-2 text-gray-800 dark:text-gray-100">{processInline(content)}</h3>);
                    } else if (trimmed === '') {
                        elements.push(<br key={`br-${i}-${tpIdx}-${lineIdx}`} />);
                    } else {
                        elements.push(<p key={`p-${i}-${tpIdx}-${lineIdx}`} className="mb-2 leading-relaxed">{processInline(line)}</p>);
                    }
                });

                if (inList && currentList.length > 0) {
                    elements.push(<ul key={`list-end-${i}-${tpIdx}`} className="list-disc list-inside mb-2 pl-2">{currentList}</ul>);
                }
            });
        } else if (i % 3 === 1) {
            // This is the language tag, skip it
            continue;
        } else if (i % 3 === 2) {
            // This is the code block content
            const lang = parts[i - 1] || 'text';
            const code = part;
            elements.push(
                <div key={`code-${i}`} className="my-4 rounded-lg overflow-hidden bg-gray-900 text-gray-100 shadow-md border border-gray-700">
                    <div className="flex justify-between items-center px-4 py-1 bg-gray-800 border-b border-gray-700 text-xs text-gray-400 uppercase font-semibold select-none">
                        <span>{lang}</span>
                        <button 
                            onClick={() => navigator.clipboard.writeText(code.trim())}
                            className="hover:text-white transition-colors"
                            data-tooltip-id="app-tooltip"
                            data-tooltip-content={t('copyCode')}
                        >
                            Copy
                        </button>
                    </div>
                    <pre className="p-4 overflow-x-auto custom-scrollbar">
                        <code className="font-mono text-sm">{code.trim()}</code>
                    </pre>
                </div>
            );
        }
    }

    return <>{elements}</>;
});

// --- Chat View Component ---

const ChatView: React.FC<ChatViewProps> = ({ onEditImage }) => {
    const { t } = useLanguage();
    const [messages, setMessages] = React.useState<Message[]>([{
        id: 'welcome',
        role: 'model',
        text: 'Hello! I am your AI assistant. I can help you brainstorm ideas, analyze media, or write content. Try dropping an image here!'
    }]);
    const [inputValue, setInputValue] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isVoiceMode, setIsVoiceMode] = React.useState(false);
    const [useReasoning, setUseReasoning] = React.useState(false);
    const [attachedFile, setAttachedFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [smartReplies, setSmartReplies] = React.useState<string[]>([]);
    const [isDragOver, setIsDragOver] = React.useState(false);
    
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const ttsAudioContextRef = React.useRef<AudioContext | null>(null);
    
    const { connect, disconnect, isConnected, isSpeaking, volume, error: liveError } = useLiveSession();

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    React.useEffect(() => {
        return () => {
            if (ttsAudioContextRef.current) {
                ttsAudioContextRef.current.close();
            }
        };
    }, []);

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

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
            setAttachedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleSendMessage = async (textOverride?: string) => {
        const text = textOverride || inputValue;
        if ((!text.trim() && !attachedFile) || isLoading) return;

        setSmartReplies([]);
        
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: text,
            image: previewUrl && attachedFile?.type.startsWith('image/') ? previewUrl : undefined
        };
        
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        const currentFile = attachedFile;
        setAttachedFile(null);
        setPreviewUrl(null);

        try {
            if (currentFile?.type.startsWith('video/')) {
                const responseText = await analyzeVideo(currentFile, userMsg.text || "Describe this video.");
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: responseText }]);
            } else if (currentFile?.type.startsWith('audio/')) {
                const responseText = await transcribeAudio(currentFile);
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: responseText }]);
            } else {
                const modelMsgId = (Date.now() + 1).toString();
                setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isThinking: true }]);

                const stream = chatWithGeminiStream(
                    messages.map(m => ({ role: m.role, text: m.text })),
                    userMsg.text,
                    currentFile || undefined,
                    useReasoning
                );

                let accumulatedText = '';
                let accumulatedGrounding = undefined;

                for await (const chunk of stream) {
                    if (chunk.text) {
                        accumulatedText += chunk.text;
                    }
                    if (chunk.groundingMetadata) {
                        accumulatedGrounding = chunk.groundingMetadata;
                    }

                    setMessages(prev => prev.map(msg => 
                        msg.id === modelMsgId 
                            ? { ...msg, text: accumulatedText, grounding: accumulatedGrounding, isThinking: false }
                            : msg
                    ));
                }
                
                const replies = await generateSmartReplies([...messages, userMsg, { role: 'model', text: accumulatedText }]);
                setSmartReplies(replies);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "I encountered an error processing your request. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClearChat = () => {
        setMessages([{
            id: 'welcome',
            role: 'model',
            text: 'Hello! I am your AI assistant. I can help you brainstorm ideas, analyze media, or write content. Try dropping an image here!'
        }]);
        setSmartReplies([]);
    };

    const handleTTS = async (text: string) => {
        try {
            const audioBuffer = await generateSpeech(text);
            if (!ttsAudioContextRef.current) {
                ttsAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = ttsAudioContextRef.current;
            if (ctx.state === 'suspended') await ctx.resume();

            const buffer = await ctx.decodeAudioData(audioBuffer);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start();
        } catch (e) {
            console.error("TTS Failed", e);
        }
    };

    const handleEditAttachedImage = (imgSrc: string) => {
        if (onEditImage) {
            const file = dataURLtoFile(imgSrc, 'chat-image.png');
            onEditImage(file);
        }
    };

    return (
        <div className="flex flex-col w-full h-[calc(100vh-100px)] max-w-5xl mx-auto p-4 gap-4 animate-fade-in">
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
                                data-tooltip-id="app-tooltip"
                                data-tooltip-content={t('clearChat')}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setUseReasoning(!useReasoning)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-2 ${useReasoning ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}
                                data-tooltip-id="app-tooltip"
                                data-tooltip-content={t('thinkingMode')}
                            >
                                <SparkleIcon className="w-3 h-3" /> Thinking {useReasoning ? 'ON' : 'OFF'}
                            </button>
                        </>
                    )}
                    <button
                        onClick={toggleVoiceMode}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${isVoiceMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-theme-gradient text-white hover:shadow-lg'}`}
                        data-tooltip-id="app-tooltip"
                        data-tooltip-content={isVoiceMode ? 'Stop Voice Chat' : 'Start Voice Chat'}
                    >
                        {isVoiceMode ? 'End Live Session' : 'Start Live Voice'}
                    </button>
                </div>
            </div>

            <div className={`flex-grow relative overflow-hidden rounded-3xl glass-panel border transition-all ${isDragOver ? 'border-theme-accent border-2' : 'border-white/20 dark:border-white/10'} shadow-2xl bg-white/40 dark:bg-black/40`}>
                {isDragOver && (
                    <div className="absolute inset-0 z-50 bg-theme-accent/10 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                        <div className="text-2xl font-bold text-theme-accent">Drop Media to Analyze</div>
                    </div>
                )}
                
                {isVoiceMode ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8 text-center">
                        {liveError ? (
                            <div className="text-red-500 font-bold">{liveError}</div>
                        ) : (
                            <>
                                <div className="relative flex items-center justify-center h-40">
                                    <div className="flex gap-2 items-center justify-center">
                                        {[...Array(7)].map((_, i) => (
                                             <div 
                                                key={i} 
                                                className="w-3 bg-theme-gradient rounded-full transition-all duration-75 ease-linear"
                                                style={{ 
                                                    height: `${Math.max(12, volume * 200 * (Math.sin(i) + 1.5))}px`,
                                                    opacity: isSpeaking || isConnected ? 0.8 : 0.2,
                                                    animation: isSpeaking ? `pulse-glow 0.5s infinite alternate` : 'none'
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
                    <div 
                        className="absolute inset-0 flex flex-col"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-theme-accent/10 border border-theme-accent text-theme-accent' : 'bg-theme-gradient text-white shadow-md'}`}>
                                        {msg.role === 'user' ? <div className="w-2 h-2 bg-theme-accent rounded-full" /> : <RobotIcon className="w-5 h-5" />}
                                    </div>
                                    
                                    <div className={`max-w-[85%] space-y-2`}>
                                        <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 rounded-tr-none border border-theme-accent/20' : 'bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700'}`}>
                                            {msg.image && (
                                                <div className="relative group mb-3 inline-block">
                                                    <img src={msg.image} alt="Attachment" className="max-h-64 rounded-lg object-cover shadow-sm" />
                                                    {onEditImage && (
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                            <button 
                                                                onClick={() => handleEditAttachedImage(msg.image!)} 
                                                                className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-200 transition-colors"
                                                                data-tooltip-id="app-tooltip"
                                                                data-tooltip-content={t('editImage')}
                                                            >
                                                                <EditIcon className="w-4 h-4"/> Edit
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {msg.isThinking ? (
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Spinner /> 
                                                    <span className="text-sm animate-pulse">Thinking...</span>
                                                </div>
                                            ) : (
                                                <div className="prose dark:prose-invert text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                    <MarkdownRenderer text={msg.text} />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {msg.role === 'model' && !msg.isThinking && (
                                            <div className="flex flex-col gap-2 pl-2">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleTTS(msg.text)} className="p-1.5 text-gray-500 hover:text-theme-accent transition-colors" data-tooltip-id="app-tooltip" data-tooltip-content={t('readAloud')}>
                                                        <SpeakerLoudIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                
                                                {msg.grounding?.groundingChunks && (
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {msg.grounding.groundingChunks.map((chunk: any, idx: number) => {
                                                            if (chunk.web?.uri) {
                                                                return (
                                                                    <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800" data-tooltip-id="app-tooltip" data-tooltip-content={t('sourceLink')}>
                                                                        <SparkleIcon className="w-3 h-3" /> 
                                                                        <span className="truncate max-w-[150px]">{chunk.web.title || "Source"}</span>
                                                                    </a>
                                                                )
                                                            }
                                                            if (chunk.maps) {
                                                                return (
                                                                    <button key={idx} className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800 cursor-default" data-tooltip-id="app-tooltip" data-tooltip-content={t('mapLink')}>
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

                        <div className="p-4 bg-white/60 dark:bg-black/60 border-t border-gray-200 dark:border-gray-700 backdrop-blur-md">
                            {previewUrl && (
                                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 dark:bg-white/5 rounded-lg w-fit border border-gray-200 dark:border-white/10">
                                    {attachedFile?.type.startsWith('video/') ? (
                                        <VideoIcon className="w-8 h-8 text-gray-500" />
                                    ) : attachedFile?.type.startsWith('audio/') ? (
                                        <SpeakerLoudIcon className="w-8 h-8 text-gray-500" />
                                    ) : (
                                        <img src={previewUrl} alt="Preview" className="w-8 h-8 rounded object-cover" />
                                    )}
                                    <span className="text-xs font-bold text-gray-500 uppercase">{attachedFile?.type.split('/')[0]} attached</span>
                                    <button onClick={() => { setAttachedFile(null); setPreviewUrl(null); }} className="text-red-500 hover:text-red-700 ml-2 text-lg leading-none">&times;</button>
                                </div>
                            )}
                            
                            <div className="flex items-end gap-2">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-theme-accent hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                                    data-tooltip-id="app-tooltip"
                                    data-tooltip-content="Upload Image, Video or Audio"
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
                                        data-tooltip-id="app-tooltip"
                                        data-tooltip-content={t('sendMessage')}
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
