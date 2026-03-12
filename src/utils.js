// src/utils.js

export const pct = s => (s.p - s.pv) / s.pv * 100;
export const cls = s => { const c = pct(s); return c > 0 ? 'up' : c < 0 ? 'down' : 'flat'; };
export const sgn = s => pct(s) >= 0 ? '+' : '';
export const cs = s => `${sgn(s)}${(s.p - s.pv).toFixed(2)} (${sgn(s)}${pct(s).toFixed(2)}%)`;

// Timeframe related utilities
export function genTradingDates(n) {
    // generate n trading days ending today (skip weekends)
    const dates = [];
    let d = new Date();
    while (dates.length < n) {
        if (d.getDay() !== 0 && d.getDay() !== 6) dates.unshift(new Date(d));
        d.setDate(d.getDate() - 1);
    }
    return dates;
}

export function formatDateLabel(d, fmt) {
    if (fmt === 'day') return d.toLocaleDateString('en-PG', { weekday: 'short' });
    if (fmt === 'date') return d.toLocaleDateString('en-PG', { day: 'numeric', month: 'short' });
    if (fmt === 'month') return d.toLocaleDateString('en-PG', { month: 'short', year: '2-digit' });
    return '';
}

export function genC(s, tf, config) {
    const cfg = config[tf] || config['5D'];
    const dates = genTradingDates(cfg.days);
    const prices = [];
    let v = s.p * cfg.sc;
    // simulate sparse PNGX trading — some days may repeat last close
    for (let i = 0; i < cfg.days; i++) {
        const traded = Math.random() > (cfg.days <= 5 ? 0.1 : 0.25); // some no-trade days
        if (traded) v += (Math.random() - .47) * (s.p * .012);
        prices.push(+v.toFixed(3));
    }
    prices[prices.length - 1] = s.p; // anchor to today's price
    const labels = dates.map(d => formatDateLabel(d, cfg.labelFmt));
    return { prices, labels, cfg };
}

export function getDateRange(tf, config) {
    const cfg = config[tf];
    if (!cfg) return null;
    const dates = genTradingDates(cfg.days);
    const fmt = d => d.toLocaleDateString('en-PG', { day: 'numeric', month: 'short', year: 'numeric' });
    const fmtShort = d => d.toLocaleDateString('en-PG', { day: 'numeric', month: 'short' });
    const start = dates[0], end = dates[dates.length - 1];
    const sameYear = start.getFullYear() === end.getFullYear();
    if (cfg.days === 1) {
        return { from: fmt(end), to: null, count: '1 trading day' };
    }
    return {
        from: sameYear ? fmtShort(start) : fmt(start),
        to: fmt(end),
        count: `${cfg.days} trading day${cfg.days > 1 ? 's' : ''}`
    };
}
