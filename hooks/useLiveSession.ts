
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// The SDK does not export LiveSession type, so we use any.
type LiveSession = any;

/**
 * Hook to manage a Gemini Live session (Real-time Audio/Video).
 * Handles microphone input (16kHz), audio output (24kHz PCM), and WebSocket connection.
 */
export const useLiveSession = () => {
    const [isConnected, setIsConnected] = React.useState(false);
    const [isSpeaking, setIsSpeaking] = React.useState(false);
    const [volume, setVolume] = React.useState(0);
    const [error, setError] = React.useState<string | null>(null);

    const audioContextRef = React.useRef<AudioContext | null>(null);
    const mediaStreamRef = React.useRef<MediaStream | null>(null);
    const processorRef = React.useRef<ScriptProcessorNode | null>(null);
    const sourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null);
    const sessionRef = React.useRef<LiveSession | null>(null);
    const currentSessionPromiseRef = React.useRef<Promise<LiveSession> | null>(null);
    
    // Audio playback state
    // nextStartTimeRef ensures audio chunks are scheduled sequentially without gaps.
    const nextStartTimeRef = React.useRef<number>(0);
    const audioSourcesRef = React.useRef<Set<AudioBufferSourceNode>>(new Set());

    // Helpers for encoding/decoding
    
    /**
     * Encodes Float32 audio data from the microphone into 16-bit PCM base64 string.
     * The model expects raw PCM 16-bit little-endian audio.
     */
    const encodePCM = (data: Float32Array) => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            // Convert float (-1.0 to 1.0) to int16 (-32768 to 32767)
            int16[i] = data[i] * 32768;
        }
        let binary = '';
        const bytes = new Uint8Array(int16.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    /**
     * Decodes base64 raw PCM 16-bit audio from the model into an AudioBuffer.
     * The model typically returns 24kHz audio.
     */
    const decodeAudioData = async (base64: string, ctx: AudioContext) => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const frameCount = dataInt16.length;
        // Create a buffer at 24kHz (standard for Gemini Live output)
        const buffer = ctx.createBuffer(1, frameCount, 24000); 
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
            // Convert int16 back to float (-1.0 to 1.0) for Web Audio API
            channelData[i] = dataInt16[i] / 32768.0;
        }
        return buffer;
    };

    const connect = React.useCallback(async () => {
        try {
            setError(null);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            // Setup Audio Context for input (mic) and output (speaker)
            // Note: We use 16kHz for the context to match the input requirement of the model primarily,
            // though output can be resampled.
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass({ sampleRate: 16000 }); 
            
            // Ensure context is running (critical for some browsers that suspend audio context on load)
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }
            
            audioContextRef.current = ctx;
            nextStartTimeRef.current = ctx.currentTime;

            // Get Microphone Stream
            // We explicitly request 16kHz, mono, with processing enabled for better voice quality.
            const stream = await navigator.mediaDevices.getUserMedia({ audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                autoGainControl: true,
                noiseSuppression: true
            }});
            mediaStreamRef.current = stream;

            // Connect to Gemini Live
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
                    },
                    systemInstruction: { parts: [{ text: "You are a helpful, creative, and friendly AI assistant named Luminescent. Keep responses concise and conversational." }] }
                },
                callbacks: {
                    onopen: () => {
                        console.log("Live session connected");
                        setIsConnected(true);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        // Handle Audio Output from Model
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData && audioContextRef.current) {
                            setIsSpeaking(true);
                            const buffer = await decodeAudioData(audioData, audioContextRef.current);
                            
                            const source = audioContextRef.current.createBufferSource();
                            source.buffer = buffer;
                            source.connect(audioContextRef.current.destination);
                            
                            // Schedule playback to occur immediately after the previous chunk finishes
                            const now = audioContextRef.current.currentTime;
                            const startTime = Math.max(now, nextStartTimeRef.current);
                            source.start(startTime);
                            nextStartTimeRef.current = startTime + buffer.duration;
                            
                            audioSourcesRef.current.add(source);
                            source.onended = () => {
                                audioSourcesRef.current.delete(source);
                                // If no more sources are playing, model has stopped speaking
                                if (audioSourcesRef.current.size === 0) setIsSpeaking(false);
                            };
                        }
                        
                        // Handle Interruption
                        if (msg.serverContent?.interrupted) {
                            console.log("Model interrupted");
                            // Stop all currently playing audio chunks immediately
                            audioSourcesRef.current.forEach(s => s.stop());
                            audioSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            setIsSpeaking(false);
                        }
                    },
                    onclose: () => {
                        console.log("Live session closed");
                        setIsConnected(false);
                    },
                    onerror: (e) => {
                        console.error("Live session error", e);
                        setError("Connection error");
                        disconnect();
                    }
                }
            });
            
            currentSessionPromiseRef.current = sessionPromise;
            sessionRef.current = await sessionPromise;

            // Setup Audio Processing for Input
            const source = ctx.createMediaStreamSource(stream);
            // ScriptProcessor is deprecated but widely supported for raw PCM access needed here.
            // Buffer size 4096 provides a good balance between latency and performance.
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Calculate volume for UI visualization
                let sum = 0;
                for(let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                setVolume(Math.sqrt(sum / inputData.length));

                const base64Data = encodePCM(inputData);
                
                // Send audio chunk to model via WebSocket
                // FIX: Updated to wrap audio part in { media: { ... } } as required by the SDK.
                currentSessionPromiseRef.current?.then(session => {
                    session.sendRealtimeInput({
                        media: { mimeType: 'audio/pcm;rate=16000', data: base64Data }
                    });
                });
            };

            source.connect(processor);
            processor.connect(ctx.destination); // Muted destination hack to keep processor alive
            
            sourceRef.current = source;
            processorRef.current = processor;

        } catch (e) {
            console.error("Failed to start live session", e);
            setError("Could not access microphone or connect.");
            disconnect();
        }
    }, []);

    const disconnect = React.useCallback(() => {
        // Clean up Web Audio resources
        processorRef.current?.disconnect();
        sourceRef.current?.disconnect();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        audioContextRef.current?.close();

        // Close Gemini Live Session
        sessionRef.current?.close();
        
        // Reset Refs
        processorRef.current = null;
        sourceRef.current = null;
        mediaStreamRef.current = null;
        audioContextRef.current = null;
        sessionRef.current = null;
        currentSessionPromiseRef.current = null;
        
        setIsConnected(false);
        setIsSpeaking(false);
        setVolume(0);
    }, []);

    React.useEffect(() => {
        return () => disconnect();
    }, [disconnect]);

    return {
        connect,
        disconnect,
        isConnected,
        isSpeaking,
        volume,
        error
    };
};
