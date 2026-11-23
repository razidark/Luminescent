import * as React from 'react';

export type AudioSourceType = 'mic' | 'file' | null;

interface AudioContextType {
    isActive: boolean;
    sourceType: AudioSourceType;
    beatIntensity: number;
    frequencyData: Uint8Array;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    trackName: string;
    sensitivity: number;
    volume: number;
    startMic: () => Promise<void>;
    playFile: (file: File) => void;
    togglePlay: () => void;
    stop: () => void;
    setSensitivity: (val: number) => void;
    setVolume: (val: number) => void;
    seek: (time: number) => void;
}

const AudioContext = React.createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isActive, setIsActive] = React.useState(false);
    const [sourceType, setSourceType] = React.useState<AudioSourceType>(null);
    const [beatIntensity, setBeatIntensity] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [trackName, setTrackName] = React.useState('');
    const [sensitivity, setSensitivityState] = React.useState(1.2);
    const [volume, setVolumeState] = React.useState(0.8);

    // Audio API nodes
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    const micStreamRef = React.useRef<MediaStream | null>(null);
    const audioSourceNodeRef = React.useRef<AudioNode | null>(null);
    
    // HTML5 Audio element for file playback
    const audioElementRef = React.useRef<HTMLAudioElement | null>(null);
    
    // Arrays for frequency data
    const freqArrayRef = React.useRef<Uint8Array>(new Uint8Array(0));
    const animationFrameRef = React.useRef<number | null>(null);
    
    // Keep beatIntensity smoothing
    const prevBeatRef = React.useRef(0);

    // Initialize HTML5 Audio Element
    React.useEffect(() => {
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audioElementRef.current = audio;

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
        };

        const updateDuration = () => {
            setDuration(audio.duration || 0);
        };

        const handleEnded = () => {
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('durationchange', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('durationchange', updateDuration);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    // Create lazy audio context
    const initAudioNodes = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;
            freqArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
        
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    // Main animation loop to extract frequency and calculate beat intensity
    const startAnalysisLoop = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

        const analyze = () => {
            if (!analyserRef.current || !isActive) return;

            const analyser = analyserRef.current;
            const freqArray = freqArrayRef.current;
            
            // Get frequency values
            analyser.getByteFrequencyData(freqArray);

            // Calculate beat intensity focusing on bass frequencies (bins 0 to 4, representing ~20Hz to ~350Hz)
            let bassSum = 0;
            const bassBinsCount = 5;
            for (let i = 0; i < bassBinsCount; i++) {
                bassSum += freqArray[i];
            }
            const avgBass = bassSum / bassBinsCount;

            // Normalize average bass energy (0-255) to 0.0 - 1.0 range
            let targetIntensity = (avgBass / 255) * sensitivity;
            if (targetIntensity > 1.0) targetIntensity = 1.0;

            // Apply exponential decay for smooth transitions
            const smoothFactor = 0.15; // weight of new value
            const currentIntensity = prevBeatRef.current * (1 - smoothFactor) + targetIntensity * smoothFactor;
            
            prevBeatRef.current = currentIntensity;
            setBeatIntensity(currentIntensity);

            animationFrameRef.current = requestAnimationFrame(analyze);
        };

        animationFrameRef.current = requestAnimationFrame(analyze);
    };

    React.useEffect(() => {
        if (isActive) {
            startAnalysisLoop();
        } else {
            setBeatIntensity(0);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        }
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isActive, sensitivity]);

    const startMic = async () => {
        try {
            stop();
            initAudioNodes();
            const ctx = audioContextRef.current!;
            const analyser = analyserRef.current!;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            micStreamRef.current = stream;

            const micSource = ctx.createMediaStreamSource(stream);
            micSource.connect(analyser);
            audioSourceNodeRef.current = micSource;

            setSourceType('mic');
            setIsActive(true);
            setIsPlaying(true);
            setTrackName('Live Microphone Input');
        } catch (err) {
            console.error('Failed to get mic access', err);
            throw new Error('Could not access microphone. Please check permissions.');
        }
    };

    const playFile = (file: File) => {
        stop();
        initAudioNodes();
        const ctx = audioContextRef.current!;
        const analyser = analyserRef.current!;
        const audio = audioElementRef.current!;

        const objectUrl = URL.createObjectURL(file);
        audio.src = objectUrl;
        audio.volume = volume;
        setTrackName(file.name);
        
        // Connect audio element source
        const fileSource = ctx.createMediaElementSource(audio);
        fileSource.connect(analyser);
        analyser.connect(ctx.destination); // Send to speakers
        audioSourceNodeRef.current = fileSource;

        setSourceType('file');
        setIsActive(true);
        audio.play().then(() => {
            setIsPlaying(true);
        }).catch(err => {
            console.error("Audio playback error:", err);
        });
    };

    const togglePlay = () => {
        const audio = audioElementRef.current;
        if (!audio || sourceType !== 'file') return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume();
            }
            audio.play();
            setIsPlaying(true);
        }
    };

    const stop = () => {
        setIsActive(false);
        setIsPlaying(false);
        setSourceType(null);
        setTrackName('');
        setCurrentTime(0);
        setDuration(0);

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        const audio = audioElementRef.current;
        if (audio) {
            audio.pause();
            audio.src = '';
        }

        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(track => track.stop());
            micStreamRef.current = null;
        }

        if (audioSourceNodeRef.current) {
            try {
                audioSourceNodeRef.current.disconnect();
            } catch (e) {
                // Ignore disconnect errors
            }
            audioSourceNodeRef.current = null;
        }
    };

    const setSensitivity = (val: number) => {
        setSensitivityState(val);
    };

    const setVolume = (val: number) => {
        setVolumeState(val);
        if (audioElementRef.current) {
            audioElementRef.current.volume = val;
        }
    };

    const seek = (time: number) => {
        if (audioElementRef.current && sourceType === 'file') {
            audioElementRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    return (
        <AudioContext.Provider value={{
            isActive,
            sourceType,
            beatIntensity,
            frequencyData: freqArrayRef.current,
            isPlaying,
            currentTime,
            duration,
            trackName,
            sensitivity,
            volume,
            startMic,
            playFile,
            togglePlay,
            stop,
            setSensitivity,
            setVolume,
            seek
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = React.useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
