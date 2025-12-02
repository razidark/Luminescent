
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';

interface Theme {
    name: string;
    gradientFrom: string;
    gradientTo: string;
    accent: string;
    accentHover: string;
    matrixColor: string[];
    clockHour: string;
    clockMinute: string;
    clockSecond: string;
}

type Mode = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (themeName: string) => void;
    themes: Record<string, Theme>;
    mode: Mode;
    setMode: (mode: Mode) => void;
}

const themes: Record<string, Theme> = {
    luminescence: { 
        name: 'themeLuminescence', 
        gradientFrom: '#d946ef', // Fuschia 500
        gradientTo: '#8b5cf6', // Violet 500
        accent: '#d946ef', 
        accentHover: '#c026d3', 
        matrixColor: ['#d946ef', '#8b5cf6', '#f0abfc'], 
        clockHour: '#8b5cf6', 
        clockMinute: '#d946ef', 
        clockSecond: '#f472b6' 
    },
    midnight: { 
        name: 'themeMidnight', 
        gradientFrom: '#4338ca', // Indigo 700
        gradientTo: '#3b82f6', // Blue 500
        accent: '#6366f1', // Indigo 500
        accentHover: '#4f46e5', 
        matrixColor: ['#4338ca', '#3b82f6', '#818cf8'], 
        clockHour: '#4338ca', 
        clockMinute: '#3b82f6', 
        clockSecond: '#60a5fa' 
    },
    forest: { 
        name: 'themeForest', 
        gradientFrom: '#059669', // Emerald 600
        gradientTo: '#10b981', // Emerald 500
        accent: '#059669', 
        accentHover: '#047857', 
        matrixColor: ['#059669', '#10b981', '#34d399'], 
        clockHour: '#047857', 
        clockMinute: '#10b981', 
        clockSecond: '#6ee7b7' 
    },
    ocean: { 
        name: 'themeOcean', 
        gradientFrom: '#0284c7', // Sky 600
        gradientTo: '#06b6d4', // Cyan 500
        accent: '#0ea5e9', 
        accentHover: '#0284c7', 
        matrixColor: ['#0284c7', '#06b6d4', '#7dd3fc'], 
        clockHour: '#0369a1', 
        clockMinute: '#06b6d4', 
        clockSecond: '#67e8f9' 
    },
    sunset: { 
        name: 'themeSunset', 
        gradientFrom: '#ea580c', // Orange 600
        gradientTo: '#db2777', // Pink 600
        accent: '#f97316', 
        accentHover: '#ea580c', 
        matrixColor: ['#ea580c', '#db2777', '#fdba74'], 
        clockHour: '#c2410c', 
        clockMinute: '#db2777', 
        clockSecond: '#fca5a5' 
    },
    gold: { 
        name: 'themeGold', 
        gradientFrom: '#d97706', // Amber 600
        gradientTo: '#f59e0b', // Amber 500
        accent: '#d97706', 
        accentHover: '#b45309', 
        matrixColor: ['#d97706', '#f59e0b', '#fcd34d'], 
        clockHour: '#b45309', 
        clockMinute: '#f59e0b', 
        clockSecond: '#fde68a' 
    },
    candy: { 
        name: 'themeCandy', 
        gradientFrom: '#ec4899', // Pink 500
        gradientTo: '#3b82f6', // Blue 500
        accent: '#ec4899', 
        accentHover: '#db2777', 
        matrixColor: ['#ec4899', '#3b82f6', '#f9a8d4'], 
        clockHour: '#db2777', 
        clockMinute: '#3b82f6', 
        clockSecond: '#93c5fd' 
    },
    neon: { 
        name: 'themeNeon', 
        gradientFrom: '#eab308', // Yellow 500
        gradientTo: '#a3e635', // Lime 400
        accent: '#eab308', 
        accentHover: '#ca8a04', 
        matrixColor: ['#eab308', '#a3e635', '#fef08a'], 
        clockHour: '#ca8a04', 
        clockMinute: '#a3e635', 
        clockSecond: '#d9f99d' 
    },
    crimson: { 
        name: 'themeCrimson', 
        gradientFrom: '#dc2626', // Red 600
        gradientTo: '#991b1b', // Red 800
        accent: '#dc2626', 
        accentHover: '#b91c1c', 
        matrixColor: ['#dc2626', '#991b1b', '#fca5a5'], 
        clockHour: '#991b1b', 
        clockMinute: '#dc2626', 
        clockSecond: '#fecaca' 
    },
    lavender: { 
        name: 'themeLavender', 
        gradientFrom: '#7c3aed', // Violet 600
        gradientTo: '#c084fc', // Purple 400
        accent: '#8b5cf6', 
        accentHover: '#7c3aed', 
        matrixColor: ['#7c3aed', '#c084fc', '#ddd6fe'], 
        clockHour: '#6d28d9', 
        clockMinute: '#c084fc', 
        clockSecond: '#e9d5ff' 
    },
    mint: { 
        name: 'themeMint', 
        gradientFrom: '#0d9488', // Teal 600
        gradientTo: '#2dd4bf', // Teal 400
        accent: '#0d9488', 
        accentHover: '#0f766e', 
        matrixColor: ['#0d9488', '#2dd4bf', '#99f6e4'], 
        clockHour: '#0f766e', 
        clockMinute: '#2dd4bf', 
        clockSecond: '#ccfbf1' 
    },
    arctic: { 
        name: 'themeArctic', 
        gradientFrom: '#64748b', // Slate 500
        gradientTo: '#94a3b8', // Slate 400
        accent: '#475569', 
        accentHover: '#334155', 
        matrixColor: ['#64748b', '#94a3b8', '#cbd5e1'], 
        clockHour: '#334155', 
        clockMinute: '#94a3b8', 
        clockSecond: '#e2e8f0' 
    },
    graphite: {
        name: 'themeGraphite',
        gradientFrom: '#374151', // Gray 700
        gradientTo: '#111827', // Gray 900
        accent: '#4b5563',
        accentHover: '#374151',
        matrixColor: ['#4b5563', '#9ca3af', '#d1d5db'],
        clockHour: '#1f2937',
        clockMinute: '#4b5563',
        clockSecond: '#9ca3af'
    },
    sakura: {
        name: 'themeSakura',
        gradientFrom: '#f472b6', // Pink 400
        gradientTo: '#fb7185', // Rose 400
        accent: '#f472b6',
        accentHover: '#db2777',
        matrixColor: ['#f472b6', '#fbcfe8', '#fda4af'],
        clockHour: '#be185d',
        clockMinute: '#f472b6',
        clockSecond: '#fecdd3'
    },
    lime: {
        name: 'themeLime',
        gradientFrom: '#65a30d', // Lime 600
        gradientTo: '#4d7c0f', // Lime 700
        accent: '#84cc16', // Lime 500
        accentHover: '#65a30d',
        matrixColor: ['#65a30d', '#a3e635', '#d9f99d'],
        clockHour: '#3f6212',
        clockMinute: '#65a30d',
        clockSecond: '#bef264'
    },
    rainbow: {
        name: 'themeRainbow',
        gradientFrom: '#ff0000', // Red (Overridden by animation)
        gradientTo: '#0000ff', // Blue (Overridden by animation)
        accent: '#00d900', // Green (Overridden by animation)
        accentHover: '#ff00ff', // Magenta (Overridden by animation)
        matrixColor: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'], // ROYGBIV spectrum
        clockHour: '#ff0000',
        clockMinute: '#00ff00',
        clockSecond: '#0000ff'
    },
    coffee: {
        name: 'themeCoffee',
        gradientFrom: '#78350f', // Amber 900
        gradientTo: '#92400e', // Amber 800
        accent: '#d97706', // Amber 600
        accentHover: '#b45309',
        matrixColor: ['#78350f', '#b45309', '#fcd34d'],
        clockHour: '#78350f',
        clockMinute: '#b45309',
        clockSecond: '#fbbf24'
    },
    royal: {
        name: 'themeRoyal',
        gradientFrom: '#4c1d95', // Violet 900
        gradientTo: '#581c87', // Purple 900
        accent: '#fbbf24', // Amber 400 (Gold)
        accentHover: '#f59e0b',
        matrixColor: ['#4c1d95', '#fbbf24', '#fcd34d'],
        clockHour: '#fbbf24',
        clockMinute: '#a78bfa',
        clockSecond: '#fde68a'
    }
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeName, setThemeName] = React.useState<string>(() => {
        const savedTheme = localStorage.getItem('luminescenceTheme');
        return (savedTheme && themes[savedTheme]) ? savedTheme : 'rainbow';
    });

    const [mode, setMode] = React.useState<Mode>(() => {
        const savedMode = localStorage.getItem('luminescenceMode') as Mode;
        if (savedMode) return savedMode;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    // Apply basic theme colors
    React.useEffect(() => {
        const currentTheme = themes[themeName] || themes.rainbow;
        const root = document.documentElement;
        
        root.style.setProperty('--theme-gradient-from', currentTheme.gradientFrom);
        root.style.setProperty('--theme-gradient-to', currentTheme.gradientTo);
        root.style.setProperty('--theme-accent', currentTheme.accent);
        root.style.setProperty('--theme-accent-hover', currentTheme.accentHover);
        root.style.setProperty('--clock-hour', currentTheme.clockHour);
        root.style.setProperty('--clock-minute', currentTheme.clockMinute);
        root.style.setProperty('--clock-second', currentTheme.clockSecond);

        localStorage.setItem('luminescenceTheme', themeName);
    }, [themeName]);

    // Rainbow Animation Effect: Cycles HSL values for a true RGB effect
    React.useEffect(() => {
        if (themeName !== 'rainbow') return;

        let hue = 0;
        let animationFrameId: number;

        const animate = () => {
            hue = (hue + 0.5) % 360; // Smooth cycling speed
            const root = document.documentElement;
            
            // Rotating gradient (offset by 60deg)
            root.style.setProperty('--theme-gradient-from', `hsl(${hue}, 100%, 55%)`);
            root.style.setProperty('--theme-gradient-to', `hsl(${(hue + 60) % 360}, 100%, 55%)`);
            
            // Accent colors (offset by 180deg for contrast)
            root.style.setProperty('--theme-accent', `hsl(${(hue + 180) % 360}, 100%, 60%)`);
            root.style.setProperty('--theme-accent-hover', `hsl(${(hue + 180) % 360}, 100%, 70%)`);
            
            // Clock hands (staggered)
            root.style.setProperty('--clock-hour', `hsl(${hue}, 80%, 60%)`);
            root.style.setProperty('--clock-minute', `hsl(${(hue + 120) % 360}, 80%, 60%)`);
            root.style.setProperty('--clock-second', `hsl(${(hue + 240) % 360}, 80%, 60%)`);

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationFrameId);
    }, [themeName]);

    React.useEffect(() => {
        const root = document.documentElement;
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('luminescenceMode', mode);
    }, [mode]);

    const setTheme = (name: string) => {
        if (themes[name]) {
            setThemeName(name);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme: themes[themeName] || themes.rainbow, setTheme, themes, mode, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
