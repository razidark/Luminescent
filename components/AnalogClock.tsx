/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from 'react';

interface AnalogClockProps {
    className?: string;
}

const AnalogClock: React.FC<AnalogClockProps> = ({ className = '' }) => {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    // Calculate continuous angles
    const hourAngle = (hours % 12) * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6 + seconds * 0.1;
    const secondAngle = seconds * 6;

    // Prevent backward snap when second hand crosses 0 (354° → 0°)
    const secondRef = React.useRef(secondAngle);
    React.useEffect(() => {
        secondRef.current = secondAngle;
    }, [secondAngle]);

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg
                width="44"
                height="44"
                viewBox="0 0 100 100"
                className="w-11 h-11"
            >
                {/* Gradient Definitions */}
                <defs>
                    <linearGradient id="clock-face-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--theme-gradient-from)" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="var(--theme-gradient-to)" stopOpacity="0.03" />
                    </linearGradient>
                    <radialGradient id="clock-center-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="var(--theme-accent)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="var(--theme-accent)" stopOpacity="0" />
                    </radialGradient>
                    <filter id="clock-glow">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Outer Glass Ring */}
                <circle
                    cx="50"
                    cy="50"
                    r="47"
                    fill="url(#clock-face-gradient)"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-gray-300/50 dark:text-white/15"
                />

                {/* Subtle inner border */}
                <circle
                    cx="50"
                    cy="50"
                    r="43"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-gray-200/20 dark:text-white/5"
                />

                {/* Hour ticks */}
                {[...Array(12)].map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const isCardinal = i % 3 === 0;
                    const innerR = isCardinal ? 35 : 37;
                    const outerR = 42;
                    const x1 = 50 + innerR * Math.sin(angle);
                    const y1 = 50 - innerR * Math.cos(angle);
                    const x2 = 50 + outerR * Math.sin(angle);
                    const y2 = 50 - outerR * Math.cos(angle);
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="currentColor"
                            strokeWidth={isCardinal ? "2.5" : "1"}
                            strokeLinecap="round"
                            className={isCardinal ? "text-gray-600/70 dark:text-gray-300/50" : "text-gray-400/30 dark:text-gray-500/25"}
                        />
                    );
                })}

                {/* Minute ticks (60 marks) */}
                {[...Array(60)].map((_, i) => {
                    if (i % 5 === 0) return null; // Skip hour positions
                    const angle = (i * 6 * Math.PI) / 180;
                    const x1 = 50 + 40 * Math.sin(angle);
                    const y1 = 50 - 40 * Math.cos(angle);
                    const x2 = 50 + 42 * Math.sin(angle);
                    const y2 = 50 - 42 * Math.cos(angle);
                    return (
                        <line
                            key={`m${i}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="currentColor"
                            strokeWidth="0.5"
                            className="text-gray-300/20 dark:text-gray-500/15"
                        />
                    );
                })}

                {/* Hour Hand - Tapered, premium feel */}
                <line
                    x1="50"
                    y1="52"
                    x2="50"
                    y2="26"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="text-gray-800 dark:text-gray-100"
                    transform={`rotate(${hourAngle} 50 50)`}
                />

                {/* Minute Hand - Elegant, thinner */}
                <line
                    x1="50"
                    y1="52"
                    x2="50"
                    y2="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-gray-700 dark:text-gray-200"
                    transform={`rotate(${minuteAngle} 50 50)`}
                />

                {/* Second Hand - Accent colored with glow */}
                <g filter="url(#clock-glow)">
                    <line
                        x1="50"
                        y1="58"
                        x2="50"
                        y2="14"
                        stroke="var(--theme-accent, #ec4899)"
                        strokeWidth="1"
                        strokeLinecap="round"
                        transform={`rotate(${secondAngle} 50 50)`}
                    />
                </g>

                {/* Center Glow */}
                <circle
                    cx="50"
                    cy="50"
                    r="6"
                    fill="url(#clock-center-glow)"
                />

                {/* Center Pin - Layered for depth */}
                <circle
                    cx="50"
                    cy="50"
                    r="3"
                    fill="var(--theme-accent, #ec4899)"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="1.5"
                    fill="white"
                    opacity="0.8"
                />
            </svg>
        </div>
    );
};

export default React.memo(AnalogClock);
