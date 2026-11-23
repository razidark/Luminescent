/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAudio } from '../contexts/AudioContext';

const MatrixBackground: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const { beatIntensity } = useAudio();
    const beatRef = React.useRef(beatIntensity);

    React.useEffect(() => {
        beatRef.current = beatIntensity;
    }, [beatIntensity]);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let dpr = window.devicePixelRatio || 1;
        let width = 0;
        let height = 0;
        
        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const characters = katakana + alphabet + numbers;
        
        let fontSize = 0;
        let columns = 0;
        let drops: number[] = [];

        const setup = () => {
            dpr = window.devicePixelRatio || 1;
            width = canvas.width = window.innerWidth * dpr;
            height = canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            fontSize = 16 * dpr;
            columns = Math.floor(width / fontSize);
            drops = [];
            for (let i = 0; i < columns; i++) {
               drops[i] = Math.floor(Math.random() * (height / fontSize));
            }
        };
        
        setup();

        let animationFrameId: number;
        
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);
            
            ctx.font = `${fontSize}px monospace`;
            const beat = beatRef.current;
            
            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                
                // Audio-reactive coloring: flash bright white on high beats
                if (beat > 0.6 && Math.random() > 0.9) {
                    ctx.fillStyle = '#ffffff';
                } else {
                    ctx.fillStyle = theme.matrixColor[Math.floor(Math.random() * theme.matrixColor.length)];
                }
                
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                
                // Fall faster on beat (slower base speed, audio-reactive boost)
                const fallStep = 0.35 + (beat > 0.3 ? beat * 0.65 : 0);
                drops[i] += fallStep;
            }
            animationFrameId = requestAnimationFrame(draw);
        };
        
        draw();
        window.addEventListener('resize', setup);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', setup);
        };
    }, [theme]);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 -z-10" />;
};

export default MatrixBackground;