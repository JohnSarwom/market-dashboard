import React, { useState, useEffect } from 'react';
import { announcements, stocks } from '../data';
import { pct, cls } from '../utils';

export default function RightPanel({ }) {
    const [moverStep, setMoverStep] = useState(0);

    const movers = [...stocks].sort((a, b) => Math.abs(pct(b)) - Math.abs(pct(a))).slice(0, 6);
    const volLeaders = [...stocks].sort((a, b) => b.v - a.v).slice(0, 4);
    const maxVol = volLeaders[0]?.v || 1;

    useEffect(() => {
        const t = setInterval(() => {
            setMoverStep(prev => {
                const next = prev + 1;
                if (next >= movers.length) {
                    // Reset back safely via CSS without animation in real app, but React re-render handles snapping well.
                    return 0;
                }
                return next;
            });
        }, 2500);
        return () => clearInterval(t);
    }, [movers.length]);

    return (
        <div className="bg-surface border-l border-border grid grid-rows-[auto_auto_auto] overflow-hidden h-full">
            <div className="p-3 border-b border-border overflow-hidden">
                <div className="text-[9px] font-mono text-accent tracking-[2px] uppercase mb-2 flex items-center gap-1.5">SCPNG Market Index</div>
                <div className="bg-card border border-border rounded-[5px] overflow-hidden grid grid-cols-2">
                    <div className="p-2 border-r border-border">
                        <div className="font-mono text-[8px] text-muted tracking-[1px] uppercase mb-1 whitespace-nowrap">KPEX Composite</div>
                        <div className="font-mono text-[16px] font-bold text-text leading-[1.1] whitespace-nowrap">4,821.3</div>
                        <div className="font-mono text-[9px] mt-1 whitespace-nowrap text-accent">▲ +32.4 (+0.68%)</div>
                    </div>
                    <div className="p-2">
                        <div className="font-mono text-[8px] text-muted tracking-[1px] uppercase mb-1 whitespace-nowrap">Total Mkt Cap</div>
                        <div className="font-mono text-[16px] font-bold text-text leading-[1.1] whitespace-nowrap">K 28.4B</div>
                        <div className="font-mono text-[9px] mt-1 whitespace-nowrap text-accent">▲ +0.3B YTD</div>
                    </div>
                </div>
            </div>

            <div className="p-3 border-b border-border overflow-hidden">
                <div className="text-[9px] font-mono tracking-[2px] uppercase mb-2 flex items-center gap-1.5">
                    <span className="text-accent text-[11px] font-bold">{movers.length}</span>
                    <span className="text-accent ml-1">Top Movers</span>
                </div>

                <div className="h-[126px] overflow-hidden relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-6 after:bg-gradient-to-t after:from-surface after:to-transparent after:pointer-events-none">
                    <div
                        className="will-change-transform transition-transform duration-[700ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{ transform: `translateY(-${moverStep * 42}px)` }}
                    >
                        {[...movers, ...movers].map((s, i) => {
                            const p = pct(s);
                            const c = cls(s);
                            return (
                                <div key={`${s.t}-${i}`} className="h-[42px] flex justify-between items-center border-b border-border px-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-[8px] text-muted w-3">{(i % movers.length) + 1}</span>
                                        <div>
                                            <div className="font-mono text-[11px] font-bold">{s.t}</div>
                                            <div className="text-[9px] text-muted mt-px">{s.n.split(' ').slice(0, 3).join(' ')}</div>
                                        </div>
                                    </div>
                                    <div className={`font-mono text-[11px] font-bold ${c}`}>{p >= 0 ? '+' : ''}{p.toFixed(2)}%</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-3 overflow-hidden">
                <div className="text-[9px] font-mono text-accent tracking-[2px] uppercase mb-2 flex items-center gap-1.5">Volume Leaders</div>
                <div>
                    {volLeaders.map(s => {
                        const w = (s.v / maxVol * 100).toFixed(0);
                        return (
                            <div key={s.t} className="mb-2 last:mb-0">
                                <div className="flex justify-between mb-1">
                                    <span className="font-mono text-[10px] text-dim">{s.t}</span>
                                    <span className="font-mono text-[10px] text-muted">{s.v.toLocaleString()}</span>
                                </div>
                                <div className="h-[3px] bg-border rounded-[2px] overflow-hidden">
                                    <div className="h-full bg-accent rounded-[2px]" style={{ width: `${w}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
