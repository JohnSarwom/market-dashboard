import React, { useMemo } from 'react';
import { cls, cs, genC, getDateRange } from '../utils';
import { announcements, TF_SEQUENCE, TF_CONFIG } from '../data';
import StockChart from './StockChart';
import RightPanel from './RightPanel';

export default function StockSlide({ stock, isActive, curTFIdx, onSetTF }) {
    const currentTFKey = TF_SEQUENCE[curTFIdx] || '5D';

    // Memoize data calculation to avoid unnecessary re-renders of the chart for the same TF
    const chartData = useMemo(() => genC(stock, currentTFKey, TF_CONFIG), [stock, currentTFKey]);
    const isUp = chartData.prices[chartData.prices.length - 1] >= chartData.prices[0];
    const dateRange = getDateRange(currentTFKey, TF_CONFIG);

    const AnouncementsTicker = useMemo(() => {
        return (
            <div className="h-7 border border-border rounded bg-card overflow-hidden relative flex items-center group
        before:content-['ANNOUNCEMENTS'] before:absolute before:left-0 before:top-0 before:bottom-0 before:flex before:items-center before:px-2.5 before:font-mono before:text-[8px] before:text-muted before:tracking-[1px] before:bg-surface before:border-r before:border-border before:z-[2] before:whitespace-nowrap"
            >
                <div className="flex items-center pl-[140px] animate-tickerScroll-slow whitespace-nowrap w-max group-hover:[animation-play-state:paused]">
                    {[...announcements, ...announcements].map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-[7px] pr-[22px] font-mono">
                            <span className="text-[9px] font-bold text-accent opacity-70">{a.sym}</span>
                            <span className="text-[9px] text-border">·</span>
                            <span className="text-[9px] text-muted tracking-[0.2px]">{a.text}</span>
                            <span className="text-[8px] text-muted/60 ml-0.5">{a.date}</span>
                        </span>
                    ))}
                </div>
            </div>
        );
    }, []);

    return (
        <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${isActive ? 'pointer-events-auto' : 'pointer-events-none'} ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
      grid grid-cols-[1fr_248px] h-full overflow-hidden`}
        >
            {/* Left side */}
            <div className="flex flex-col pt-3.5 px-[18px] pb-2.5 gap-2 overflow-hidden">
                {/* Hero Top */}
                <div className="flex-shrink-0 flex items-stretch gap-6 h-[104px]">
                    {/* Company logo — drop files at app/public/logos/{ticker}.png */}
                    <div className="flex-shrink-0 w-[104px] rounded-sm border border-border bg-card overflow-hidden flex items-center justify-center relative anim-sym">
                        <img
                            src={stock.logo || `/logos/${stock.t}.png`}
                            alt=""
                            className="w-full h-full object-contain absolute inset-0"
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="font-mono text-[10px] font-bold text-muted/30 select-none">{stock.t}</span>
                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${cls(stock) === 'up' ? 'bg-accent' : cls(stock) === 'down' ? 'bg-red' : 'bg-border'}`} />
                    </div>

                    {/* Left sub-col: Name + Price + Meta */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <span className="text-[clamp(16px,1.8vw,24px)] font-extrabold tracking-[-0.5px] anim-name">{stock.n}</span>
                        <div className="flex items-baseline gap-2.5 anim-price">
                            <span className="font-mono text-[clamp(32px,4vw,52px)] font-bold leading-[1.1]">{stock.p.toFixed(2)}</span>
                            <span className="font-mono text-[14px] text-muted">PGK</span>
                            <span className={`font-mono text-[clamp(14px,1.5vw,18px)] font-bold anim-chg ${cls(stock)}`}>{cs(stock)}</span>
                        </div>
                        <div className="flex gap-[clamp(8px,1.2vw,18px)] flex-wrap anim-meta">
                            <span className="font-mono text-[10px] text-muted">SESSION OPEN <span className="text-dim">{stock.o.toFixed(2)}</span></span>
                            <span className="font-mono text-[10px] text-muted">DAY HIGH <span className="text-dim">{stock.h.toFixed(2)}</span></span>
                            <span className="font-mono text-[10px] text-muted">DAY LOW <span className="text-dim">{stock.l.toFixed(2)}</span></span>
                            <span className="font-mono text-[10px] text-muted">TRADES <span className="text-dim">{stock.v.toLocaleString()}</span></span>
                            <span className="font-mono text-[10px] text-muted">MKT CAP <span className="text-dim">{stock.mc} PGK</span></span>
                            <span className="font-mono text-[10px] text-muted">P/E <span className="text-dim">{stock.pe}</span></span>
                            <span className="font-mono text-[10px] text-muted">DIV YIELD <span className="text-dim">{stock.dv}</span></span>
                        </div>
                    </div>

                    {/* Right sub-col: Announcements + TF buttons + Date range */}
                    <div className="w-[260px] flex-shrink-0 flex flex-col justify-between">
                        {AnouncementsTicker}
                        <div className="flex gap-[3px]">
                            {TF_SEQUENCE.map((tf, i) => (
                                <button
                                    key={tf}
                                    onClick={() => onSetTF(i)}
                                    className={`border font-mono text-[10px] px-2.5 py-1 rounded transition-all duration-150 cursor-pointer
                                        ${currentTFKey === tf ? 'bg-accent text-black font-bold border-accent' : 'bg-transparent border-transparent text-muted hover:text-dim hover:border-border'}`}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                        <div className="font-mono text-[10px] text-dim flex items-center gap-2">
                            {dateRange?.to ? (
                                <>
                                    <span className="text-muted">{dateRange.from}</span>
                                    <span className="text-border">→</span>
                                    <span className="text-text">{dateRange.to}</span>
                                </>
                            ) : (
                                <span className="text-text">{dateRange?.from}</span>
                            )}
                            <span className="text-muted text-[9px] ml-1">{dateRange?.count}</span>
                            <span className="flex gap-[3px] items-center ml-auto">
                                {TF_SEQUENCE.map(tf => (
                                    <span key={tf} className={`w-[5px] h-[5px] rounded-full transition-all duration-300 ${currentTFKey === tf ? 'bg-accent' : 'bg-border'}`}></span>
                                ))}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                {isActive && <StockChart key={currentTFKey} stock={stock} prices={chartData.prices} labels={chartData.labels} isUp={isUp} brandColor={stock.color1} brandColor2={stock.color2} />}

                {/* Stats Row */}
                <div className="grid grid-cols-5 gap-px bg-border rounded-md overflow-hidden flex-shrink-0 anim-stats">
                    <div className="bg-card px-3 py-2"><div className="text-[9px] font-mono text-muted tracking-[1px] uppercase mb-0.5">52W High</div><div className="font-mono text-[clamp(12px,1.2vw,15px)] font-bold">{stock.h52.toFixed(2)}</div></div>
                    <div className="bg-card px-3 py-2"><div className="text-[9px] font-mono text-muted tracking-[1px] uppercase mb-0.5">52W Low</div><div className="font-mono text-[clamp(12px,1.2vw,15px)] font-bold">{stock.l52.toFixed(2)}</div></div>
                    <div className="bg-card px-3 py-2"><div className="text-[9px] font-mono text-muted tracking-[1px] uppercase mb-0.5">Prev Close</div><div className="font-mono text-[clamp(12px,1.2vw,15px)] font-bold">{stock.pv.toFixed(2)}</div></div>
                    <div className="bg-card px-3 py-2"><div className="text-[9px] font-mono text-muted tracking-[1px] uppercase mb-0.5">Bid</div><div className="font-mono text-[clamp(12px,1.2vw,15px)] font-bold">{(stock.p - 0.02).toFixed(2)}</div></div>
                    <div className="bg-card px-3 py-2"><div className="text-[9px] font-mono text-muted tracking-[1px] uppercase mb-0.5">Offer</div><div className="font-mono text-[clamp(12px,1.2vw,15px)] font-bold">{(stock.p + 0.02).toFixed(2)}</div></div>
                </div>

                <div className="font-mono text-[9px] text-muted tracking-[0.3px] px-0.5 py-1 flex-shrink-0 border-t border-border mt-0.5">
          // PETS session 10:00–16:00 · prices reflect daily closing trades · settlement T+3
                </div>
            </div>

            {/* Right side (unchanging across stock slides mostly, but included in layout) */}
            <RightPanel />
        </div>
    );
}
