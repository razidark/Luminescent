
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { chatWithGeminiStream, analyzeVideo, transcribeAudio, generateSpeech, generateSmartReplies } from '../services/geminiService';
import { useLiveSession } from '../hooks/useLiveSession';
import { ChatIcon, MicrophoneOnIcon, MicrophoneOffIcon, UploadIcon, VideoIcon, MapIcon, SpeakerLoudIcon, RobotIcon, SparkleIcon, TrashIcon, EditIcon, GenerateIcon } from './icons';
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
    onApplyPrompt?: (prompt: string) => void;
}

const MarkdownRenderer: React.FC<{ text: string }> = React.memo(({ text }) => {
    const elements: React.ReactNode[] = [];
    const parts = text.split(/```(\w*)\n([\s\S]*?)```/g);
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (i % 3 === 0) {
            if (!part.trim()) continue;
            const tableBlockRegex = /((?:\|.+?\|\n)+)/g;
            const textParts = part.split(tableBlockRegex);

            textParts.forEach((textPart, tpIdx) => {
                if (textPart.trim().startsWith('|') && textPart.includes('\n')) {
                    const rows = textPart.trim().split('\n').map(row => row.split('|').filter(c => c.trim() !== '').map(c => c.trim()));
                    if (rows.length > 1) {
                        const headers = rows[0];
                        const bodyRows = rows.slice(2);
                        elements.push(
                            <div key={`table-${i}-${tpIdx}`} className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-scale-up">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>{headers.map((h, hIdx) => (<th key={hIdx} scope="col" className="px-6 py-3">{h}</th>))}</tr>
                                    </thead>
                                    <tbody>
                                        {bodyRows.map((row, rIdx) => (
                                            <tr key={rIdx} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                {row.map((cell, cIdx) => (<td key={cIdx} className="px-6 py-4 text-gray-900 dark:text-white">{cell}</td>))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                        return;
                    }
                }

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
                            if (span.startsWith('**') && span.endsWith('**')) return <strong key={j} className="font-bold text-gray-900 dark:text-white">{span.slice(2, -2)}</strong>;
                            if (span.startsWith('`') && span.endsWith('`')) return <code key={j} className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm font-mono text-red-500 dark:text-red-300">{span.slice(1, -1)}</code>;
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
                if (inList && currentList.length > 0) elements.push(<ul key={`list-end-${i}-${tpIdx}`} className="list-disc list-inside mb-2 pl-2">{currentList}</ul>);
            });
        } else if (i % 3 === 2) {
            const lang = parts[i - 1] || 'text';
            const code = part;
            elements.push(
                <div key={`code-${i}`} className="my-4 rounded-lg overflow-hidden bg-gray-900 text-gray-100 shadow-md border border-gray-700 animate-scale-up">
                    <div className="flex justify-between items-center px-4 py-1 bg-gray-800 border-b border-gray-700 text-xs text-gray-400 uppercase font-semibold select-none">
                        <span>{lang}</span>
                        <button onClick={() => navigator.clipboard.writeText(code.trim())} className="hover:text-white transition-colors">Copy</button>
                    </div>
                    <pre className="p-4 overflow-x-auto custom-scrollbar"><code className="font-mono text-sm">{code.trim()}</code></pre>
                </div>
            );
        }
    }
    return <>{elements}</>;
});

const ChatView: React.FC<ChatViewProps> = ({ onEditImage, onApplyPrompt }) => {
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

    const toggleVoiceMode = () => {
        if (isVoiceMode) { disconnect(); setIsVoiceMode(false); }
        else { setIsVoiceMode(true); connect(); }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setAttachedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
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

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
            setAttachedFile(file); setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSendMessage = async (textOverride?: string) => {
        const text = textOverride || inputValue;
        if ((!text.trim() && !attachedFile) || isLoading) return;
        setSmartReplies([]);
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text, image: previewUrl && attachedFile?.type.startsWith('image/') ? previewUrl : undefined };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);
        const currentFile = attachedFile;
        setAttachedFile(null); setPreviewUrl(null);

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
                const stream = chatWithGeminiStream(messages.map(m => ({ role: m.role, text: m.text })), userMsg.text, currentFile || undefined, useReasoning);
                let accumulatedText = '';
                let accumulatedGrounding = undefined;
                for await (const chunk of stream) {
                    if (chunk.text) accumulatedText += chunk.text;
                    if (chunk.groundingMetadata) accumulatedGrounding = chunk.groundingMetadata;
                    setMessages(prev => prev.map(msg => msg.id === modelMsgId ? { ...msg, text: accumulatedText, grounding: accumulatedGrounding, isThinking: false } : msg));
                }
                const replies = await generateSmartReplies([...messages, userMsg, { role: 'model', text: accumulatedText }]);
                setSmartReplies(replies);
            }
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Error processing request. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClearChat = () => {
        setMessages([{ id: 'welcome', role: 'model', text: 'Hello! I am your AI assistant. I can help you brainstorm ideas, analyze media, or write content. Try dropping an image here!' }]);
        setSmartReplies([]);
    };

    const handleTTS = async (text: string) => {
        try {
            const audioBuffer = await generateSpeech(text);
            if (!ttsAudioContextRef.current) ttsAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const ctx = ttsAudioContextRef.current;
            if (ctx.state === 'suspended') await ctx.resume();
            const buffer = await ctx.decodeAudioData(audioBuffer);
            const source = ctx.createBufferSource();
            source.buffer = buffer; source.connect(ctx.destination); source.start();
        } catch (e) { console.error(e); }
    };

    const extractSuggestedPrompts = (text: string): string[] => {
        const matches = text.match(/"([^"]{10,})"/g);
        if (!matches) return [];
        return matches.map(m => m.slice(1, -1)).filter(m => m.length < 200 && m.length > 15);
    };

    return (
        <div className="flex flex-col w-full h-[calc(100vh-100px)] max-w-5xl mx-auto p-4 gap-4 animate-fade-in">
            <div className="flex items-center justify-between bg-white/50 dark:bg-gray-900/50 p-4 rounded-2xl backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full transition-all duration-500 ${isVoiceMode ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-blue-100 text-blue-500'}`}>
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
                            <button onClick={handleClearChat} className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors active:scale-90" data-tooltip-id="app-tooltip" data-tooltip-content={t('clearChat')}><TrashIcon className="w-5 h-5" /></button>
                            <button onClick={() => setUseReasoning(!useReasoning)} className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-2 active:scale-95 ${useReasoning ? 'bg-purple-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`} data-tooltip-id="app-tooltip" data-tooltip-content={t('thinkingMode')}><SparkleIcon className="w-3 h-3" /> Thinking {useReasoning ? 'ON' : 'OFF'}</button>
                        </>
                    )}
                    <button onClick={toggleVoiceMode} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${isVoiceMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-theme-gradient text-white hover:shadow-lg'}`}>{isVoiceMode ? 'End Session' : 'Go Live'}</button>
                </div>
            </div>

            <div className={`flex-grow relative overflow-hidden rounded-3xl glass-panel border transition-all duration-500 ${isDragOver ? 'border-theme-accent border-2 scale-[1.01]' : 'border-white/20 dark:border-white/10'} shadow-2xl bg-white/40 dark:bg-black/40`}>
                {isVoiceMode ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8 text-center animate-fade-in">
                        <div className="flex gap-2 items-center justify-center h-40">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="w-3 bg-theme-gradient rounded-full transition-all duration-75" style={{ height: `${Math.max(12, volume * 200 * (Math.sin(i) + 1.5))}px`, opacity: isSpeaking || isConnected ? 0.8 : 0.2 }} />
                            ))}
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white animate-pulse">{isConnected ? (isSpeaking ? "Speaking..." : "Listening...") : "Connecting..."}</h3>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-4 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110 ${msg.role === 'user' ? 'bg-theme-accent/10 border border-theme-accent text-theme-accent' : 'bg-theme-gradient text-white shadow-md'}`}>
                                        {msg.role === 'user' ? <div className="w-2 h-2 bg-theme-accent rounded-full" /> : <RobotIcon className="w-5 h-5" />}
                                    </div>
                                    <div className={`max-w-[85%] space-y-2`}>
                                        <div className={`p-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${msg.role === 'user' ? 'bg-white/80 dark:bg-gray-800/80 rounded-tr-none border border-theme-accent/20' : 'bg-white/90 dark:bg-gray-900/90 rounded-tl-none border border-gray-200 dark:border-gray-700'}`}>
                                            {msg.image && (
                                                <div className="relative group mb-3 inline-block rounded-lg overflow-hidden animate-scale-up">
                                                    <img src={msg.image} alt="Attachment" className="max-h-64 object-cover" />
                                                    {onEditImage && (
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button onClick={() => onEditImage(dataURLtoFile(msg.image!, 'chat.png'))} className="bg-white text-gray-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform"><EditIcon className="w-4 h-4"/> Edit</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {msg.isThinking ? <div className="flex items-center gap-2 text-gray-500"><Spinner /> <span className="text-sm animate-pulse">Thinking...</span></div> : <div className="prose dark:prose-invert text-sm leading-relaxed break-words"><MarkdownRenderer text={msg.text} /></div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 bg-white/60 dark:bg-black/60 border-t border-gray-200 dark:border-gray-700 backdrop-blur-md animate-fade-in">
                            {previewUrl && (
                                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 dark:bg-white/5 rounded-lg w-fit border border-gray-200 dark:border-white/10 animate-scale-up">
                                    <img src={previewUrl} alt="Preview" className="w-8 h-8 rounded object-cover" />
                                    <span className="text-xs font-bold text-gray-500 uppercase">Attached</span>
                                    <button onClick={() => { setAttachedFile(null); setPreviewUrl(null); }} className="text-red-500 ml-2 text-lg leading-none active:scale-125 transition-transform">&times;</button>
                                </div>
                            )}
                            <div className="flex items-end gap-2">
                                <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-theme-accent transition-all active:scale-90"><UploadIcon className="w-6 h-6" /></button>
                                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,video/*,audio/*" />
                                <div className="flex-grow relative">
                                    <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} placeholder="Message Gemini..." className="w-full bg-gray-100 dark:bg-white/10 border-transparent focus:border-theme-accent focus:ring-0 rounded-xl p-3 pr-12 resize-none h-12 max-h-32 custom-scrollbar text-gray-800 dark:text-gray-100 shadow-inner transition-all duration-300 focus:shadow-lg" disabled={isLoading} />
                                    <button onClick={() => handleSendMessage()} disabled={!inputValue.trim() && !attachedFile || isLoading} className="absolute right-2 bottom-2 p-1.5 bg-theme-gradient text-white rounded-lg transition-all active:scale-90 disabled:opacity-50 hover:brightness-110"><ChatIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(ChatView);
