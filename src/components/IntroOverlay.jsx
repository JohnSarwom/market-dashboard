import React, { useEffect, useState } from 'react';
import { stocks, INTRO_DURATION } from '../data';

export default function IntroOverlay({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [faded, setFaded] = useState(false);
    const [displayNone, setDisplayNone] = useState(false);
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const n = new Date();
            const p = v => String(v).padStart(2, '0');
            setTime(`${p(n.getHours())}:${p(n.getMinutes())} PETS`);
        };
        updateTime();
        const t = setInterval(updateTime, 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        // Artificial 2s delay before progress starts
        const delay = setTimeout(() => {
            const step = 100 / (INTRO_DURATION / 50);
            const timer = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        clearInterval(timer);
                        setFaded(true);
                        setTimeout(() => {
                            setDisplayNone(true);
                            onComplete();
                        }, 850);
                        return 100;
                    }
                    return Math.min(100, p + step);
                });
            }, 50);
            return () => clearInterval(timer);
        }, 2000);
        return () => clearTimeout(delay);
    }, [onComplete]);

    if (displayNone) return null;

    const tickerItems = stocks.map((s, i) => {
        const p = (s.p - s.pv) / s.pv * 100;
        const clr = p > 0 ? '#e8b800' : p < 0 ? '#ff5252' : '#a07880';
        return (
            <div key={i} className="inline-flex items-center gap-2 px-6 font-mono text-[11px] border-r border-border">
                <span className="font-bold text-text">{s.t}</span>
                <span className="text-dim">{s.p.toFixed(2)}</span>
                <span style={{ color: clr }} className="font-mono text-[10px]">
                    {p >= 0 ? '+' : ''}{p.toFixed(2)}%
                </span>
            </div>
        );
    });

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center flex-col transition-all duration-800 ease-in-out ${faded ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
                }`}
        >
            {/* Base solid background */}
            <div className="fixed inset-0 bg-bg z-[-2]"></div>

            {/* Backdrop Image */}
            <div 
                className="fixed inset-0 z-[-1] opacity-50"
                style={{
                    backgroundImage: "url('/images/Market_Data_Dashboard_Backdrop (1).jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            ></div>
            
            {/* Dark Overlay for readability */}
            <div className="fixed inset-0 bg-bg/60 backdrop-blur-[2px] z-[-1]"></div>

            <div className="fixed inset-0 bg-grid-pattern animate-gridPan z-0 opacity-40"></div>

            {/* Corner Brackets */}
            <div className="fixed w-10 h-10 border-t-2 border-l-2 border-accent top-6 left-6 animate-fadeIn opacity-0 [animation-delay:0.8s]"></div>
            <div className="fixed w-10 h-10 border-t-2 border-r-2 border-accent top-6 right-6 animate-fadeIn opacity-0 [animation-delay:1s]"></div>
            <div className="fixed w-10 h-10 border-b-2 border-l-2 border-accent bottom-6 left-6 animate-fadeIn opacity-0 [animation-delay:1.2s]"></div>
            <div className="fixed w-10 h-10 border-b-2 border-r-2 border-accent bottom-6 right-6 animate-fadeIn opacity-0 [animation-delay:1.4s]"></div>

            <div className="fixed top-8 left-[72px] font-mono text-[10px] text-accent/35 tracking-[0.5px] leading-[1.9] z-10 text-left opacity-0 animate-fadeIn [animation-delay:0.3s]">
                <span className="block">SYS // MARKET-DASHBOARD-TERMINAL v1.0</span>
                <span className="block">CONN // PORT MORESBY REGULATORY NODE</span>
                <span className="block">AUTH // SESSION ESTABLISHED</span>
                <span className="block">DATA // FETCHING LIVE FEED ████████ OK</span>
            </div>

            <div className="relative flex flex-col items-center justify-center text-center w-full max-w-[900px] p-10 z-[2] before:content-[''] before:fixed before:inset-0 before:bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.18)_2px,rgba(0,0,0,0.18)_4px)] before:pointer-events-none before:z-[-1]">

                <div className="font-mono text-[clamp(10px,1vw,13px)] text-muted tracking-[4px] uppercase mb-4 opacity-0 animate-slideUp [animation-delay:0.7s]">
                    Securities Commission of Papua New Guinea
                </div>
                <div className="text-[clamp(52px,6vw,110px)] font-extrabold leading-[0.9] tracking-[-4px] text-text mb-2.5 opacity-0 animate-slideUp [animation-delay:0.9s]">
                    MARKET<br />
                    <span className="text-accent">
                        DASHBOARD<span className="inline-block w-[10px] h-[1.1em] bg-accent align-text-bottom animate-blink ml-1"></span>
                    </span>
                </div>
                <div className="font-mono text-[clamp(11px,0.9vw,14px)] text-muted tracking-[1.5px] leading-[1.6] mt-5 mb-9 opacity-0 animate-slideUp [animation-delay:1.1s]">
                    Real-time equities dashboard · PETS session 10:00–16:00 Mon–Fri · settlement T+3<br />
                    13 listed companies · K 28.4B total market capitalisation · daily closing prices
                </div>

                <div className="flex gap-[3px] flex-wrap justify-center mb-11 opacity-0 animate-slideUp [animation-delay:1.3s]">
                    <div className="bg-card border border-border px-5 py-2.5 flex flex-col items-center gap-1 rounded">
                        <span className="font-mono text-[9px] text-muted tracking-[1.5px] uppercase">KPEX Composite</span>
                        <span className="font-mono text-[clamp(14px,1.4vw,18px)] font-bold up">4,821.3</span>
                    </div>
                    <div className="bg-card border border-border px-5 py-2.5 flex flex-col items-center gap-1 rounded">
                        <span className="font-mono text-[9px] text-muted tracking-[1.5px] uppercase">PGK / USD</span>
                        <span className="font-mono text-[clamp(14px,1.4vw,18px)] font-bold text-text">0.2621</span>
                    </div>
                    <div className="bg-card border border-border px-5 py-2.5 flex flex-col items-center gap-1 rounded">
                        <span className="font-mono text-[9px] text-muted tracking-[1.5px] uppercase">Market Status</span>
                        <span className="font-mono text-[clamp(14px,1.4vw,18px)] font-bold up">OPEN</span>
                    </div>
                    <div className="bg-card border border-border px-5 py-2.5 flex flex-col items-center gap-1 rounded">
                        <span className="font-mono text-[9px] text-muted tracking-[1.5px] uppercase">Session</span>
                        <span className="font-mono text-[clamp(14px,1.4vw,18px)] font-bold text-text">{time || '—'}</span>
                    </div>
                </div>

                <div className="w-[280px] opacity-0 animate-slideUp [animation-delay:1.5s]">
                    <div className="font-mono text-[10px] text-muted flex justify-between mb-2 tracking-[0.5px]">
                        <span>LOADING DASHBOARD</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-[2px] bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all duration-[50ms]" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setFaded(true);
                        setTimeout(() => { setDisplayNone(true); onComplete(); }, 850);
                    }}
                    className="mt-4 bg-transparent border border-border text-dim font-mono text-[11px] tracking-[2px] px-7 py-2.5 rounded cursor-pointer transition-all duration-200 hover:border-accent hover:text-accent hover:bg-accent/5 opacity-0 animate-slideUp [animation-delay:1.7s]"
                >
                    ENTER DASHBOARD →
                </button>
            </div>

            {/* Bottom Ticker */}
            <div className="fixed bottom-0 left-0 right-0 h-[36px] bg-surface border-t border-border overflow-hidden z-10 opacity-0 animate-fadeIn [animation-delay:1.8s]">
                <div className="flex items-center h-full animate-tickerScroll whitespace-nowrap w-max">
                    {tickerItems}
                    {tickerItems} {/* Duplicated for smooth scrolling */}
                </div>
            </div>
        </div>
    );
}
