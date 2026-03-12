import React, { useEffect, useState } from 'react';
import { stocks } from '../data';
import { pct, cls } from '../utils';

export default function TableSlide({ isActive }) {
    const [dateStr, setDateStr] = useState('');

    useEffect(() => {
        if (isActive) {
            const now = new Date();
            setDateStr(`${now.toLocaleDateString('en-PG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}  ${now.toLocaleTimeString('en-PG', { hour: '2-digit', minute: '2-digit' })} PETS`);
        }
    }, [isActive]);

    const adv = stocks.filter(s => pct(s) > 0).length;
    const dec = stocks.filter(s => pct(s) < 0).length;

    return (
        <div className={`absolute inset-0 bg-bg transition-all duration-500 ease-in-out ${isActive ? 'pointer-events-auto' : 'pointer-events-none'} ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
      flex flex-col p-5 px-7 pb-4 h-full overflow-hidden`}
        >
            <div className="flex items-baseline justify-between mb-3.5 flex-shrink-0">
                <div>
                    <div className="font-mono text-[11px] text-muted tracking-[2px] uppercase">
            // ALL LISTED COMPANIES · MARKET SUMMARY
                    </div>
                    <div className="text-[clamp(20px,2.5vw,30px)] font-extrabold tracking-[-0.5px] text-text mt-0.5">
                        PNGX Market Overview
                    </div>
                </div>
                <div className="font-mono text-[11px] text-muted">{dateStr || '—'}</div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden border border-border rounded-lg">
                <table className="w-full border-collapse table-fixed">
                    <thead>
                        <tr>
                            <th className="bg-card sticky top-0 z-[1] text-[10px] font-mono text-muted tracking-[1px] uppercase px-4 h-9 text-left border-b border-border w-[70px]">SYM</th>
                            <th className="bg-card sticky top-0 z-[1] text-[10px] font-mono text-muted tracking-[1px] uppercase px-4 h-9 text-right border-b border-border w-[200px]">COMPANY</th>
                            <th className="bg-card sticky top-0 z-[1] text-[10px] font-mono text-muted tracking-[1px] uppercase px-4 h-9 text-right border-b border-border w-[90px]">LAST (PGK)</th>
                            <th className="bg-card sticky top-0 z-[1] text-[10px] font-mono text-muted tracking-[1px] uppercase px-4 h-9 text-right border-b border-border w-[80px]">BID</th>
                            <th className="bg-card sticky top-0 z-[1] text-[10px] font-mono text-muted tracking-[1px] uppercase px-4 h-9 text-right border-b border-border w-[80px]">OFFER</th>
                            <th className="bg-card sticky top-0 z-[1] text-[10px] font-mono text-muted tracking-[1px] uppercase px-4 h-9 text-right border-b border-border w-[90px]">CHG%</th>
                            <th className="bg-card sticky top-0 z-[1] text-[10px] font-mono text-muted tracking-[1px] uppercase px-4 h-9 text-right border-b border-border w-[90px]">VOLUME</th>
                            <th className="bg-card sticky top-0 z-[1] text-[10px] font-mono text-muted tracking-[1px] uppercase px-4 h-9 text-right border-b border-border w-[90px]">MKT CAP</th>
                            <th className="bg-card sticky top-0 z-[1] text-[10px] font-mono text-muted tracking-[1px] uppercase px-4 h-9 text-right border-b border-border w-[80px]">52W HI</th>
                            <th className="bg-card sticky top-0 z-[1] text-[10px] font-mono text-muted tracking-[1px] uppercase px-4 h-9 text-right border-b border-border w-[80px]">52W LO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map((s, i) => {
                            const p = pct(s);
                            const c = cls(s);
                            return (
                                <tr key={i} className="border-b border-border transition-colors duration-100 hover:bg-card last:border-none">
                                    <td className="px-4 h-9 font-mono text-left font-bold text-text text-[14px] whitespace-nowrap">{s.t}</td>
                                    <td className="px-4 h-9 text-right text-[12px] font-semibold text-dim whitespace-nowrap !font-sans !text-left">{s.n}</td>
                                    <td className="px-4 h-9 font-mono text-[clamp(11px,1vw,13px)] text-right whitespace-nowrap">{s.p.toFixed(2)}</td>
                                    <td className="px-4 h-9 font-mono text-[clamp(11px,1vw,13px)] text-right whitespace-nowrap text-dim">{(s.p - 0.02).toFixed(2)}</td>
                                    <td className="px-4 h-9 font-mono text-[clamp(11px,1vw,13px)] text-right whitespace-nowrap text-dim">{(s.p + 0.02).toFixed(2)}</td>
                                    <td className={`px-4 h-9 font-mono text-[clamp(11px,1vw,13px)] text-right whitespace-nowrap font-bold ${c}`}>{p >= 0 ? '+' : ''}{p.toFixed(2)}%</td>
                                    <td className="px-4 h-9 font-mono text-[clamp(11px,1vw,13px)] text-right whitespace-nowrap text-dim">{s.v.toLocaleString()}</td>
                                    <td className="px-4 h-9 font-mono text-[clamp(11px,1vw,13px)] text-right whitespace-nowrap text-dim">{s.mc}</td>
                                    <td className="px-4 h-9 font-mono text-[clamp(11px,1vw,13px)] text-right whitespace-nowrap text-dim">{s.h52.toFixed(2)}</td>
                                    <td className="px-4 h-9 font-mono text-[clamp(11px,1vw,13px)] text-right whitespace-nowrap text-dim">{s.l52.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-4 gap-px bg-border rounded-md overflow-hidden mt-3 flex-shrink-0">
                <div className="bg-card px-4 py-2.5">
                    <div className="text-[9px] font-mono text-muted tracking-[1px] uppercase mb-[3px]">Listed Companies</div>
                    <div className="font-mono text-[clamp(13px,1.4vw,17px)] font-bold">{stocks.length}</div>
                </div>
                <div className="bg-card px-4 py-2.5">
                    <div className="text-[9px] font-mono text-muted tracking-[1px] uppercase mb-[3px]">Total Market Cap</div>
                    <div className="font-mono text-[clamp(13px,1.4vw,17px)] font-bold up">K 28.4B</div>
                </div>
                <div className="bg-card px-4 py-2.5">
                    <div className="text-[9px] font-mono text-muted tracking-[1px] uppercase mb-[3px]">Advancing</div>
                    <div className="font-mono text-[clamp(13px,1.4vw,17px)] font-bold up">{adv}</div>
                </div>
                <div className="bg-card px-4 py-2.5">
                    <div className="text-[9px] font-mono text-muted tracking-[1px] uppercase mb-[3px]">Declining</div>
                    <div className="font-mono text-[clamp(13px,1.4vw,17px)] font-bold down">{dec}</div>
                </div>
            </div>
        </div>
    );
}
