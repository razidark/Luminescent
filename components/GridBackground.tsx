/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Point3D { x: number; y: number; z: number; }

const GridBackground: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0, height = 0, dpr = 1;
        let time = 0;
        const fov = 200;
        const gridSize = 20;

        const setup = () => {
            dpr = window.devicePixelRatio || 1;
            width = canvas.width = window.innerWidth * dpr;
            height = canvas.height = window.innerHeight * dpr;
        };

        const project = (p: Point3D) => {
            const scale = fov / (fov + p.z);
            return {
                x: p.x * scale + width / 2,
                y: p.y * scale + height / 2,
                scale: scale
            };
        };

        setup();
        window.addEventListener('resize', setup);

        let animationFrameId: number;
        const animate = () => {
            time += 0.5;
            ctx.clearRect(0, 0, width, height);

            const zOffset = time % (gridSize * dpr);
            
            // Draw horizontal lines
            for (let i = 0; i < height / 2 / (gridSize * dpr) + 2; i++) {
                const z = i * gridSize * dpr - zOffset;
                const p1 = project({ x: -width, y: 150, z });
                const p2 = project({ x: width, y: 150, z });

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineWidth = 2 * p1.scale * dpr;
                ctx.strokeStyle = `rgba(${hexToRgb(theme.accent)}, ${1 - z / 200})`;
                ctx.stroke();
            }
            
            // Draw vertical lines
            for(let i = 0; i < width / (gridSize * dpr) + 1; i++) {
                const x = (i - width / (gridSize * dpr * 2)) * gridSize * dpr;
                const p1 = project({ x, y: 150, z: 0 });
                const p2 = project({ x, y: 150, z: 500 });

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineWidth = 1 * dpr;
                ctx.strokeStyle = `rgba(${hexToRgb(theme.accent)}, 0.5)`;
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
        };
        
        animate();

        return () => {
            window.removeEventListener('resize', setup);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10"
        />
    );
};

export default GridBackground;