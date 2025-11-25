/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';

export type BackgroundType = 'none' | 'nebula' | 'circuit' | 'grid' | 'matrix';

interface BackgroundContextType {
    background: BackgroundType;
    setBackground: (background: BackgroundType) => void;
}

const BackgroundContext = React.createContext<BackgroundContextType | undefined>(undefined);

const getInitialBackground = (): BackgroundType => {
    const savedBg = localStorage.getItem('luminescenceBackground') as BackgroundType;
    if (['none', 'nebula', 'circuit', 'grid', 'matrix'].includes(savedBg)) {
        return savedBg;
    }
    return 'matrix'; // Default background
};

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [background, setBackground] = React.useState<BackgroundType>(getInitialBackground);

    React.useEffect(() => {
        localStorage.setItem('luminescenceBackground', background);
    }, [background]);

    return (
        <BackgroundContext.Provider value={{ background, setBackground }}>
            {children}
        </BackgroundContext.Provider>
    );
};

export const useBackground = (): BackgroundContextType => {
    const context = React.useContext(BackgroundContext);
    if (!context) {
        throw new Error('useBackground must be used within a BackgroundProvider');
    }
    return context;
};