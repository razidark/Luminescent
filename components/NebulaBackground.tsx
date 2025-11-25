/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const NebulaBackground: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let stars: { x: number, y: number, radius: number, alpha: number, speed: number }[] = [];
        let particles: { x: number, y: number, radius: number, color: string, speedX: number, speedY: number }[] = [];

        const setup = () => {
            const dpr = window.devicePixelRatio || 1;
            width = canvas.width = window.innerWidth * dpr;
            height = canvas.height = window.innerHeight * dpr;
            
            // Stars
            stars = [];
            for (let i = 0; i < 200; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.5 * dpr,
                    alpha: Math.random(),
                    speed: Math.random() * 0.1 + 0.05
                });
            }

            // Nebula particles
            particles = [];
            const colors = [theme.gradientFrom, theme.gradientTo, theme.accent];
            for (let i = 0; i < 30; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: (Math.random() * 150 + 100) * dpr,
                    color: colors[i % colors.length],
                    speedX: (Math.random() - 0.5) * 0.2,
                    speedY: (Math.random() - 0.5) * 0.2
                });
            }
        };

        setup();
        window.addEventListener('resize', setup);

        let animationFrameId: number;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw stars
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();
                
                star.alpha += star.speed;
                if(star.alpha > 1) {
                    star.alpha = 1;
                    star.speed *= -1;
                } else if (star.alpha < 0) {
                    star.alpha = 0;
                    star.speed *= -1;
                }
            });

            // Draw nebula
            ctx.globalCompositeOperation = 'lighter';
            ctx.filter = 'blur(60px)';
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < -p.radius) p.x = width + p.radius;
                if (p.x > width + p.radius) p.x = -p.radius;
                if (p.y < -p.radius) p.y = height + p.radius;
                if (p.y > height + p.radius) p.y = -p.radius;
            });
            ctx.filter = 'none';
            ctx.globalCompositeOperation = 'source-over';


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

export default NebulaBackground;