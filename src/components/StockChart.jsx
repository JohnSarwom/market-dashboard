import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function hexToRgba(hex, alpha) {
    try {
        const h = hex.replace('#', '');
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    } catch {
        return `rgba(232,184,0,${alpha})`;
    }
}

const easeInOutQuart = t => t < 0.5 ? 8*t*t*t*t : 1 - Math.pow(-2*t+2, 4)/2;

export default function StockChart({ stock, prices, labels, isUp, brandColor, brandColor2 }) {
    const canvasRef = useRef(null);
    const chartInstance = useRef(null);
    const pinsRef = useRef(null);
    const timersRef = useRef([]);
    const rafRef = useRef(null);

    const clearTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };

    useEffect(() => {
        return () => clearTimers();
    }, []);

    const placePins = (ca, minP, priceRange, col) => {
        if (!pinsRef.current) return;
        pinsRef.current.innerHTML = '';
        clearTimers();

        const n = prices.length;
        // pick 3 indices logic exactly from the original
        const pick3Indices = () => {
            if (n <= 3) return prices.map((_, i) => i);
            const last = n - 1;
            let minIdx = 0;
            for (let i = 1; i < n; i++) if (prices[i] < prices[minIdx]) minIdx = i;
            // Initialise maxIdx to last so it's always a valid fallback when no index passes the distance guard
            let maxIdx = last;
            for (let i = 1; i < n; i++) {
                if (Math.abs(i - minIdx) > 2 && Math.abs(i - last) > 2 && prices[i] > prices[maxIdx]) maxIdx = i;
            }
            const set = new Set([minIdx, maxIdx, last]);
            if (set.size < 3) {
                set.add(Math.floor(n * 0.25));
                set.add(Math.floor(n * 0.6));
            }
            return [...set].slice(0, 3).sort((a, b) => a - b);
        };

        const mainIndices = pick3Indices();

        const dataPos = (idx) => {
            const chart = chartInstance.current;
            const dotX = chart.scales.x.getPixelForIndex(idx);
            const dotY = chart.scales.y.getPixelForValue(prices[idx]);
            return { dotX, dotY };
        };

        const CARD_W = 136, CARD_H = 110, GHOST_W = 90, GHOST_H = 52, LINE_H = 24, DOT_R = 5, GDOT_R = 3;
        const aLeft = ca.left + 4, aRight = ca.right - 4, aTop = ca.top + 4, aBottom = ca.bottom - 4;

        const layoutCard = (dotX, dotY, cw, ch) => {
            const cdotX = Math.max(aLeft, Math.min(aRight, dotX));
            const cdotY = Math.max(aTop, Math.min(aBottom, dotY));
            const spaceBelow = aBottom - cdotY - DOT_R - LINE_H;
            const spaceAbove = cdotY - aTop - DOT_R - LINE_H;
            const flipUp = (spaceBelow < ch + 8 && spaceAbove >= ch + 8) || (cdotY > (aTop + aBottom) * 0.5);

            let cardLeft = cdotX - cw / 2;
            let cardTop = flipUp ? cdotY - GDOT_R - LINE_H - ch : cdotY + GDOT_R + LINE_H;
            cardLeft = Math.max(aLeft, Math.min(aRight - cw, cardLeft));
            cardTop = Math.max(aTop, Math.min(aBottom - ch, cardTop));

            const lineTop = flipUp ? cardTop + ch : cdotY + GDOT_R;
            const lineBot = flipUp ? cdotY - GDOT_R : cardTop;
            return { cdotX, cdotY, cardLeft, cardTop, lineTop, lineBot, flipUp };
        };

        const buildPinEl = (cdotX, cdotY, cardLeft, cardTop, lineTop, lineBot, lineH, dotR, pinColor, cardHTML, isGhost) => {
            const lineActualH = Math.max(0, Math.abs(lineBot - lineTop));
            const wrap = document.createElement('div');
            wrap.className = isGhost ? 'ghost' : 'pin';
            wrap.style.cssText = `position:absolute;left:0;top:0;opacity:1;z-index:${isGhost ? 1 : 3};`;

            const dot = document.createElement('div');
            dot.className = isGhost ? 'ghost-dot' : 'pin-dot';
            dot.style.cssText = `position:absolute; left:${cdotX - dotR}px; top:${cdotY - dotR}px; color:${pinColor}; background:${pinColor}; opacity:0; transition:opacity .8s ease, transform .9s cubic-bezier(.34,1.56,.64,1); transform:scale(0);`;

            const line = document.createElement('div');
            line.className = 'pin-line';
            line.style.cssText = `position:absolute; left:${cdotX}px; top:${Math.min(lineTop, lineBot)}px; height:${lineActualH}px; color:${pinColor}; background:${pinColor}; opacity:0; transform:scaleY(0); transform-origin:${lineTop < lineBot ? 'top' : 'bottom'}; transition:opacity .6s ease, transform .9s cubic-bezier(.4,0,.2,1);`;

            const card = document.createElement('div');
            card.className = isGhost ? 'ghost-card' : 'pin-card';
            card.style.cssText = isGhost
                ? `position:absolute; left:${cardLeft}px; top:${cardTop}px; opacity:0; transform:translateY(4px); transition:opacity .7s ease, transform .7s ease;`
                : `position:absolute; left:${cardLeft}px; top:${cardTop}px; border-color:${pinColor}33; opacity:0; transform:translateY(6px) scale(.97); transition:opacity .7s ease, transform .8s cubic-bezier(.22,1,.36,1);`;
            card.innerHTML = cardHTML;

            wrap.appendChild(dot);
            wrap.appendChild(line);
            wrap.appendChild(card);
            pinsRef.current.appendChild(wrap);

            wrap._dot = dot;
            wrap._line = line;
            wrap._card = card;
            return wrap;
        };

        const MAIN_TIMES = [1000, 8000, 15000];
        const GHOST_START = [4000, 11000];

        const ghostsBetween = (fromIdx, toIdx) => {
            const span = toIdx - fromIdx;
            if (span <= 1) return [];
            if (span === 2) return [fromIdx + 1];
            const count = Math.min(4, Math.max(1, Math.floor(span / 4)));
            const step = span / (count + 1);
            const res = [];
            for (let i = 1; i <= count; i++) {
                const idx = Math.round(fromIdx + i * step);
                if (idx > fromIdx && idx < toIdx) res.push(idx);
            }
            return [...new Set(res)];
        };

        mainIndices.forEach((dataIdx, pinNum) => {
            const price = prices[dataIdx];
            const label = labels[dataIdx] || '';
            const prevP = dataIdx > 0 ? prices[dataIdx - 1] : prices[0];
            const chg = price - prevP;
            const chgPct = prevP !== 0 ? (chg / prevP * 100) : 0;
            const ptIsUp = chg >= 0;
            const pinCol = ptIsUp ? (brandColor || '#e8b800') : '#f23645';
            const vol = Math.round(stock.v * (0.6 + Math.random() * 0.8));

            const { dotX, dotY } = dataPos(dataIdx);
            const L = layoutCard(dotX, dotY, CARD_W, CARD_H);

            const dayHigh = +(price * (1 + Math.random() * 0.008)).toFixed(3);
            const dayLow = +(price * (1 - Math.random() * 0.008)).toFixed(3);
            const w52Pct = stock.l52 !== stock.h52 ? Math.round((price - stock.l52) / (stock.h52 - stock.l52) * 100) : 50;
            const trendLbl = ptIsUp ? '▲ UP DAY' : '▼ DOWN DAY';

            const cardHTML = `
        <div class="pc-date">${label} <span style="color:${pinCol};font-size:8px">${trendLbl}</span></div>
        <div class="pc-price" style="color:${pinCol}">K ${price.toFixed(3)}</div>
        <div class="pc-chg" style="color:${pinCol}">${ptIsUp ? '+' : ''}${chg.toFixed(3)} (${ptIsUp ? '+' : ''}${chgPct.toFixed(2)}%)</div>
        <div class="pc-divider"></div>
        <div class="pc-row"><span class="pc-lbl">H</span><span class="pc-val">${dayHigh.toFixed(3)}</span><span class="pc-lbl" style="margin-left:6px">L</span><span class="pc-val">${dayLow.toFixed(3)}</span></div>
        <div class="pc-row"><span class="pc-lbl">VOL</span><span class="pc-val">${vol.toLocaleString()}</span></div>
        <div class="pc-52w">
          <div class="pc-lbl" style="margin-bottom:2px">52W RANGE</div>
          <div class="pc-52bar"><div class="pc-52fill" style="width:${w52Pct}%;background:${pinCol}"></div></div>
          <div class="pc-52ends"><span>${stock.l52.toFixed(2)}</span><span>${w52Pct}%</span><span>${stock.h52.toFixed(2)}</span></div>
        </div>`;

            const pinEl = buildPinEl(L.cdotX, L.cdotY, L.cardLeft, L.cardTop, L.lineTop, L.lineBot, LINE_H, DOT_R, pinCol, cardHTML, false);

            const baseT = MAIN_TIMES[pinNum];
            timersRef.current.push(
                setTimeout(() => { pinEl._dot.style.opacity = '1'; pinEl._dot.style.transform = 'scale(1)'; }, baseT),
                setTimeout(() => { pinEl._line.style.opacity = '0.35'; pinEl._line.style.transform = 'scaleY(1)'; }, baseT + 900),
                setTimeout(() => { pinEl._card.style.opacity = '1'; pinEl._card.style.transform = 'translateY(0) scale(1)'; }, baseT + 1800)
            );

            if (pinNum < mainIndices.length - 1) {
                const nextIdx = mainIndices[pinNum + 1];
                const ghostIdxs = ghostsBetween(dataIdx, nextIdx);
                if (ghostIdxs.length === 0) return;

                const segStart = GHOST_START[pinNum];
                const ghostStep = ghostIdxs.length > 1 ? 3000 / ghostIdxs.length : 0;

                ghostIdxs.forEach((gIdx, gi) => {
                    const gPrice = prices[gIdx];
                    const gLabel = labels[gIdx] || '';
                    const gPrevP = gIdx > 0 ? prices[gIdx - 1] : prices[0];
                    const gChg = gPrice - gPrevP;
                    const gChgPct = gPrevP !== 0 ? (gChg / gPrevP * 100) : 0;
                    const gIsUp = gChg >= 0;
                    const gCol = gIsUp ? hexToRgba(brandColor || '#e8b800', 0.45) : hexToRgba('#f23645', 0.45);
                    const gColText = gIsUp ? hexToRgba(brandColor || '#e8b800', 0.7) : hexToRgba('#f23645', 0.7);

                    const { dotX: gdx, dotY: gdy } = dataPos(gIdx);
                    const GL = layoutCard(gdx, gdy, GHOST_W, GHOST_H);

                    const gCardHTML = `
            <div class="gc-date">${gLabel}</div>
            <div class="gc-price" style="color:${gColText}">K ${gPrice.toFixed(3)}</div>
            <div class="gc-chg" style="color:${gColText}">${gIsUp ? '+' : ''}${gChg.toFixed(3)} (${gIsUp ? '+' : ''}${gChgPct.toFixed(2)}%)</div>`;

                    const ghostEl = buildPinEl(GL.cdotX, GL.cdotY, GL.cardLeft, GL.cardTop, GL.lineTop, GL.lineBot, LINE_H, GDOT_R, gCol, gCardHTML, true);

                    timersRef.current.push(setTimeout(() => {
                        ghostEl._dot.style.opacity = '0.5';
                        ghostEl._dot.style.transform = 'scale(1)';
                        ghostEl._line.style.opacity = '0.15';
                        ghostEl._line.style.transform = 'scaleY(1)';
                        ghostEl._card.style.opacity = '1';
                        ghostEl._card.style.transform = 'translateY(0)';
                    }, segStart + gi * ghostStep));
                });
            }
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Destroy previous chart immediately on effect run
        if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
        }
        pinsRef.current.innerHTML = '';
        clearTimers();

        let cancelled = false;

        document.fonts.ready.then(() => {
            if (cancelled || !canvasRef.current) return;

        const ctx = canvas.getContext('2d');

        // Read current theme CSS variables for chart chrome
        const cssVars = getComputedStyle(document.documentElement);
        const isDark = document.documentElement.dataset.theme !== 'light';
        const muteColor   = cssVars.getPropertyValue('--muted').trim()   || '#787b86';
        const dimColor    = cssVars.getPropertyValue('--dim').trim()      || '#9598a1';
        const borderColor = cssVars.getPropertyValue('--border').trim()   || '#363a45';
        const surfaceColor = cssVars.getPropertyValue('--surface').trim() || '#1e222d';
        const textColor   = cssVars.getPropertyValue('--text').trim()     || '#d1d4dc';
        const gridColor   = isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.06)';

        const upColor   = brandColor  || '#e8b800';
        const fillColor = brandColor2 || upColor;
        const downColor = '#f23645';
        const col = isUp ? upColor : downColor;
        const gradFill = isUp ? fillColor : downColor;
        // Gradient built after chart layout so it spans exactly the chart area (not the full canvas)
        const buildGrad = (yTop, yBot) => {
            const g = ctx.createLinearGradient(0, yTop, 0, yBot);
            g.addColorStop(0,    hexToRgba(gradFill, isDark ? 0.88 : 0.92));
            g.addColorStop(0.18, hexToRgba(gradFill, isDark ? 0.65 : 0.74));
            g.addColorStop(0.42, hexToRgba(gradFill, isDark ? 0.38 : 0.48));
            g.addColorStop(0.68, hexToRgba(gradFill, isDark ? 0.16 : 0.24));
            g.addColorStop(0.88, hexToRgba(gradFill, isDark ? 0.04 : 0.07));
            g.addColorStop(1,    hexToRgba(gradFill, 0));
            return g;
        };

        const labelStep = Math.max(1, Math.floor(labels.length / 6));
        const sparseLabels = labels.map((l, i) => i % labelStep === 0 ? l : '');

        // Left-to-right reveal plugin — reads closure variable `ltrRatio`
        let ltrRatio = 0;
        const pluginLTR = {
            id: 'leftToRight',
            beforeDatasetsDraw(chart) {
                const { ctx: c, chartArea: ca } = chart;
                if (!ca) return;
                c.save();
                c.beginPath();
                c.rect(ca.left, ca.top, (ca.right - ca.left) * ltrRatio, ca.bottom - ca.top);
                c.clip();
            },
            afterDatasetsDraw(chart) {
                chart.ctx.restore();
            }
        };

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sparseLabels,
                datasets: [{
                    data: prices,
                    borderColor: col,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.25,
                    fill: true,
                    backgroundColor: 'transparent',
                    spanGaps: true
                }]
            },
            plugins: [pluginLTR],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: surfaceColor,
                        borderColor: borderColor,
                        borderWidth: 1,
                        titleColor: muteColor,
                        bodyColor: textColor,
                        bodyFont: { family: 'Space Mono', size: 11 },
                        callbacks: {
                            title: ctx => labels[ctx[0].dataIndex] || '',
                            label: c => `Close  K ${c.parsed.y.toFixed(3)}`
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: { display: false },
                        border: { color: borderColor, display: true },
                        ticks: { color: muteColor, font: { family: 'Space Mono', size: 9 }, maxRotation: 0 }
                    },
                    y: {
                        display: true,
                        position: 'right',
                        grid: { color: gridColor },
                        border: { display: false },
                        ticks: {
                            color: muteColor,
                            font: { family: 'Space Mono', size: 10 },
                            callback: v => 'K ' + v.toFixed(2),
                            padding: 8
                        },
                        afterFit(scale) {
                            scale.width = 72;
                        }
                    }
                },
                interaction: { mode: 'index', intersect: false }
            }
        });

        // Inject gradient now that chartArea is computed
        const chart = chartInstance.current;
        if (chart.chartArea) {
            const { top, bottom } = chart.chartArea;
            chart.data.datasets[0].backgroundColor = buildGrad(top, bottom);
        }
        const startTime = performance.now();
        const ANIM_DURATION = 5000;

        const animateReveal = (now) => {
            if (cancelled || !chartInstance.current) return;
            const t = Math.min((now - startTime) / ANIM_DURATION, 1);
            ltrRatio = easeInOutQuart(t);
            chart.draw();
            if (t < 1) {
                rafRef.current = requestAnimationFrame(animateReveal);
            } else {
                ltrRatio = 1;
                chart.draw();
                // Place annotation pins after reveal completes
                const ca = chart.chartArea;
                if (ca) {
                    const minP = Math.min(...prices);
                    const maxP = Math.max(...prices);
                    const priceRange = maxP - minP || 1;
                    placePins(ca, minP, priceRange, col);
                }
            }
        };
        rafRef.current = requestAnimationFrame(animateReveal);

    }); // end document.fonts.ready.then

    return () => {
        cancelled = true;
        clearTimers();
        if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
        }
    };
}, [prices, labels, isUp, brandColor, brandColor2]); // Re-draw whenever data or brand colors change

    return (
        <div className="flex-1 min-h-0 relative rounded border border-border overflow-hidden anim-chart">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
            <div ref={pinsRef} className="absolute inset-0 pointer-events-none z-10 overflow-hidden"></div>
        </div>
    );
}
