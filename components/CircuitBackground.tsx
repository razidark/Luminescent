/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Point { x: number; y: number; }
interface Pulse { path: Point[]; progress: number; speed: number; }

const CircuitBackground: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '100, 108, 122';
    };

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0, height = 0, dpr = 1;
        let grid: Point[] = [];
        let paths: Point[][] = [];
        let pulses: Pulse[] = [];
        const gridSize = 50;

        const setup = () => {
            dpr = window.devicePixelRatio || 1;
            width = canvas.width = window.innerWidth * dpr;
            height = canvas.height = window.innerHeight * dpr;
            
            // Create grid points
            grid = [];
            for (let y = gridSize * dpr; y < height; y += gridSize * dpr) {
                for (let x = gridSize * dpr; x < width; x += gridSize * dpr) {
                    if (Math.random() > 0.5) {
                        grid.push({ x, y });
                    }
                }
            }
            
            // Create paths
            paths = [];
            const usedPoints = new Set<Point>();
            for(let i = 0; i < grid.length / 4; i++) {
                const startPoint = grid[Math.floor(Math.random() * grid.length)];
                if (usedPoints.has(startPoint)) continue;

                let currentPath = [startPoint];
                usedPoints.add(startPoint);
                let currentPoint = startPoint;
                
                for (let j = 0; j < 5; j++) {
                    const neighbors = grid.filter(p => {
                        const dist = Math.sqrt(Math.pow(p.x - currentPoint.x, 2) + Math.pow(p.y - currentPoint.y, 2));
                        return dist <= gridSize * dpr * 1.5 && !usedPoints.has(p);
                    });
                    
                    if (neighbors.length > 0) {
                        const nextPoint = neighbors[Math.floor(Math.random() * neighbors.length)];
                        currentPath.push(nextPoint);
                        usedPoints.add(nextPoint);
                        currentPoint = nextPoint;
                    } else {
                        break;
                    }
                }
                paths.push(currentPath);
            }

            // Create pulses
            pulses = [];
            for(let i = 0; i < 20; i++) {
                createPulse();
            }
        };

        const createPulse = () => {
            const path = paths[Math.floor(Math.random() * paths.length)];
            if(path && path.length > 1) {
                pulses.push({
                    path,
                    progress: 0,
                    speed: (Math.random() * 0.5 + 0.5)
                });
            }
        };

        setup();
        window.addEventListener('resize', setup);

        let animationFrameId: number;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            const accentRgb = hexToRgb(theme.accent);

            // Draw paths
            ctx.strokeStyle = `rgba(${accentRgb}, 0.2)`;
            ctx.lineWidth = 1 * dpr;
            paths.forEach(path => {
                if (path.length < 2) return;
                ctx.beginPath();
                ctx.moveTo(path[0].x, path[0].y);
                for (let i = 1; i < path.length; i++) {
                    ctx.lineTo(path[i].x, path[i].y);
                }
                ctx.stroke();
            });

            // Draw and update pulses
            pulses.forEach((pulse, index) => {
                const segmentIndex = Math.floor(pulse.progress);
                const segmentProgress = pulse.progress - segmentIndex;
                
                if (segmentIndex >= pulse.path.length - 1) {
                    pulses.splice(index, 1);
                    createPulse();
                    return;
                }
                
                const start = pulse.path[segmentIndex];
                const end = pulse.path[segmentIndex + 1];
                
                const x = start.x + (end.x - start.x) * segmentProgress;
                const y = start.y + (end.y - start.y) * segmentProgress;

                ctx.beginPath();
                ctx.arc(x, y, 2 * dpr, 0, Math.PI * 2);
                ctx.fillStyle = theme.accent;
                ctx.shadowColor = theme.accent;
                ctx.shadowBlur = 10 * dpr;
                ctx.fill();
                ctx.shadowBlur = 0;

                pulse.progress += pulse.speed * 0.02;
            });
            
            animationFrameId = requestAnimationFrame(animate);
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

export default CircuitBackground;