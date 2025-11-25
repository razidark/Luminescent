import * as React from 'react';

const AnalogClock: React.FC<{ className?: string }> = ({ className }) => {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondHandRotation = seconds * 6;
    const minuteHandRotation = minutes * 6 + seconds * 0.1;
    const hourHandRotation = (hours % 12) * 30 + minutes * 0.5;

    return (
        <div className={`relative w-16 h-16 ${className}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Clock face */}
                <circle cx="50" cy="50" r="48" className="fill-gray-200/50 dark:fill-black/50 stroke-gray-400 dark:stroke-gray-600" strokeWidth="2" />

                {/* Hour hand */}
                <line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="25"
                    stroke="var(--clock-hour)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{ transformOrigin: '50% 50%', transform: `rotate(${hourHandRotation}deg)` }}
                />
                
                {/* Minute hand */}
                <line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="15"
                    stroke="var(--clock-minute)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ transformOrigin: '50% 50%', transform: `rotate(${minuteHandRotation}deg)` }}
                />
                
                {/* Second hand */}
                <line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="10"
                    stroke="var(--clock-second)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    style={{ transformOrigin: '50% 50%', transform: `rotate(${secondHandRotation}deg)` }}
                />

                {/* Center dot */}
                <circle cx="50" cy="50" r="3" fill="var(--clock-second)" />
            </svg>
        </div>
    );
};

export default AnalogClock;