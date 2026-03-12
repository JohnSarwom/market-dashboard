import React from 'react';
import { stocks } from '../data';
import { pct, cls } from '../utils';

export default function Strip({ curSlide, onSelect }) {
    const items = [...stocks, ...stocks]; // duplicate for seamless loop

    return (
        <div className="fixed top-[52px] left-0 right-0 h-[44px] bg-surface border-b border-border z-[200] overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-9 bg-gradient-to-r from-surface to-transparent z-[2] pointer-events-none"></div>

            <div className="flex items-stretch h-full animate-tickerScrollRight" style={{ width: 'max-content' }}>
                {items.map((s, i) => {
                    const p = pct(s);
                    const c = cls(s);
                    const realIdx = i % stocks.length;
                    const isActive = realIdx === curSlide;

                    return (
                        <div
                            key={i}
                            onClick={() => onSelect(realIdx)}
                            className={`flex-shrink-0 relative inline-flex items-center gap-2 px-4 h-full border-r border-border cursor-pointer transition-all duration-200
                                ${isActive ? 'opacity-100 bg-accent/[0.07]' : 'opacity-35 hover:opacity-70 hover:bg-card'}
                            `}
                        >
                            <span className="font-mono text-[11px] font-bold text-dim">{s.t}</span>
                            <span className={`font-mono text-[12px] font-bold ${c}`}>{s.p.toFixed(2)}</span>
                            <span className={`font-mono text-[10px] px-1.5 py-px rounded-[3px]
                                ${c === 'up' ? 'text-accent bg-accent/10' : c === 'down' ? 'text-red bg-red/10' : 'text-muted'}
                            `}>
                                {p >= 0 ? '+' : ''}{p.toFixed(2)}%
                            </span>

                            <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-accent transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0'}`}></div>
                        </div>
                    );
                })}
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-9 bg-gradient-to-l from-surface to-transparent z-[2] pointer-events-none"></div>
        </div>
    );
}
