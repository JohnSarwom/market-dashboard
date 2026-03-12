import React, { useEffect, useState } from 'react';
import { TOTAL_SLIDES, stocks } from '../data';
import ThreeDotsMenu from './ThreeDotsMenu';

export default function NavigationBar({ curSlide, paused, onTogglePause, onDotClick, darkMode, onToggleDarkMode, onOpenAdmin, navVisible, onMouseEnter, onMouseLeave }) {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const n = new Date();
            const p = v => String(v).padStart(2, '0');
            setTime(`${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())} GMT+10`);
        };
        updateTime();
        const t = setInterval(updateTime, 1000);
        return () => clearInterval(t);
    }, []);

    const isTable = curSlide === stocks.length;
    const label = isTable
        ? `MARKET TABLE · ${TOTAL_SLIDES} / ${TOTAL_SLIDES}`
        : `${stocks[curSlide]?.t} · ${curSlide + 1} / ${TOTAL_SLIDES}`;

    return (
        <div
            className="fixed top-0 left-0 right-0 h-[50px] bg-surface border-b border-border flex items-center justify-between px-5 z-[300]"
            style={{ transform: navVisible ? 'translateY(0)' : 'translateY(-100%)', transition: 'transform 0.35s ease' }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="flex items-center gap-2.5">
                <span className="text-[14px] font-extrabold tracking-[2px]">MARKET DASHBOARD</span>
                <span className="text-[11px] font-mono text-muted">— Securities Commission of PNG</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 font-mono text-[11px] text-muted">
                    <span>{label}</span>
                    <div className="flex gap-1 items-center">
                        {stocks.map((_, i) => (
                            <div
                                key={i}
                                onClick={() => onDotClick(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === curSlide ? 'bg-accent scale-125' : 'bg-border'
                                    }`}
                            ></div>
                        ))}
                        <div
                            onClick={() => onDotClick(stocks.length)}
                            className={`h-1.5 rounded-sm transition-all duration-300 cursor-pointer ${stocks.length === curSlide ? 'bg-accent w-2' : 'bg-border w-2.5'
                                }`}
                        ></div>
                    </div>
                </div>

                <button
                    onClick={onTogglePause}
                    className={`bg-card border font-mono text-[11px] px-2.5 py-1 rounded transition-all duration-150 ${paused ? 'border-accent text-accent' : 'border-border text-dim hover:border-accent hover:text-accent'
                        }`}
                >
                    {paused ? '▶ RESUME' : '⏸ PAUSE'}
                </button>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted">
                    <div className="w-[7px] h-[7px] rounded-full bg-accent animate-blink-slow"></div>
                    SESSION OPEN · PETS 10:00–16:00
                </div>

                <div className="font-mono text-[12px] text-dim">{time}</div>

                <ThreeDotsMenu darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} onOpenAdmin={onOpenAdmin} />
            </div>
        </div>
    );
}
