import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { stocks } from '../data';

// ── Export helpers ────────────────────────────────────────────────────────

function fmtChg(s) {
    const chg = ((s.p - s.pv) / s.pv * 100);
    return (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';
}

function doExportExcel() {
    const date = new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
    const rows = stocks.map(s => ({
        Ticker: s.t,
        Company: s.n,
        'Price (K)': s.p,
        'Prev Close': s.pv,
        Open: s.o,
        'Day High': s.h,
        'Day Low': s.l,
        Volume: s.v,
        'Change %': fmtChg(s),
        'Mkt Cap (PGK)': s.mc,
        'P/E Ratio': s.pe,
        'Div Yield': s.dv,
        '52W High': s.h52,
        '52W Low': s.l52,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    // Auto-width columns
    const colWidths = Object.keys(rows[0]).map(k => ({
        wch: Math.max(k.length, ...rows.map(r => String(r[k]).length)) + 2,
    }));
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Market Data');
    // Metadata sheet
    const meta = XLSX.utils.aoa_to_sheet([
        ['SCPNG Market Dashboard Export'],
        ['Securities Commission of Papua New Guinea'],
        [''],
        ['Date', date],
        ['Stocks', stocks.length],
        ['Source', 'KPEX / SCPNG'],
    ]);
    XLSX.utils.book_append_sheet(wb, meta, 'Info');
    XLSX.writeFile(wb, `SCPNG_Market_Data_${date.replace(/ /g, '_')}.xlsx`);
}

function doExportPDF() {
    const date = new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header
    doc.setFillColor(19, 23, 34);
    doc.rect(0, 0, 297, 24, 'F');
    doc.setFontSize(14);
    doc.setTextColor(232, 184, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('SCPNG MARKET DASHBOARD', 14, 11);
    doc.setFontSize(8);
    doc.setTextColor(120, 123, 134);
    doc.setFont('helvetica', 'normal');
    doc.text(`Securities Commission of Papua New Guinea  ·  Exported: ${date}  ·  All prices in PGK (K)`, 14, 18);

    autoTable(doc, {
        startY: 28,
        head: [['Ticker', 'Company', 'Price (K)', 'Chg %', 'Open', 'High', 'Low', 'Volume', 'Mkt Cap', 'P/E', 'Div Yield', '52W High', '52W Low']],
        body: stocks.map(s => {
            const chg = (s.p - s.pv) / s.pv * 100;
            return [
                s.t,
                s.n,
                `K ${s.p.toFixed(2)}`,
                (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%',
                `K ${s.o.toFixed(2)}`,
                `K ${s.h.toFixed(2)}`,
                `K ${s.l.toFixed(2)}`,
                s.v.toLocaleString(),
                `K ${s.mc}`,
                s.pe,
                s.dv,
                `K ${s.h52.toFixed(2)}`,
                `K ${s.l52.toFixed(2)}`,
            ];
        }),
        styles: { fontSize: 7.5, font: 'helvetica', cellPadding: 2.5 },
        headStyles: {
            fillColor: [30, 34, 45],
            textColor: [232, 184, 0],
            fontStyle: 'bold',
            fontSize: 7.5,
        },
        alternateRowStyles: { fillColor: [252, 248, 248] },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 14 },
            1: { cellWidth: 40 },
            4: { halign: 'right' },
            5: { halign: 'right' },
            6: { halign: 'right' },
            7: { halign: 'right' },
        },
        didParseCell(data) {
            if (data.section === 'body' && data.column.index === 3) {
                const v = data.cell.raw;
                data.cell.styles.textColor = v.startsWith('+') ? [180, 140, 0] : [220, 50, 50];
            }
        },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(120, 123, 134);
        doc.text(
            `PETS session 10:00–16:00 · prices reflect daily closing trades · settlement T+3 · Page ${i} of ${pageCount}`,
            14, doc.internal.pageSize.height - 6
        );
    }

    doc.save(`SCPNG_Market_Data_${date.replace(/ /g, '_')}.pdf`);
}

// ── Icons (simple inline SVG) ─────────────────────────────────────────────

const IconRefresh = () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.5 5.5A4 4 0 1 1 3 8.9" />
        <polyline points="1.5,9.5 1.5,7 4,7" />
    </svg>
);

const IconFullscreen = () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M1 4V1h3M7 1h3v3M10 7v3H7M4 10H1V7" />
    </svg>
);

const IconExitFullscreen = () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M4 1v3H1M10 4H7V1M7 10V7h3M1 7h3v3" />
    </svg>
);

const IconSun = () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <circle cx="5.5" cy="5.5" r="2" />
        <line x1="5.5" y1="0.5" x2="5.5" y2="2" />
        <line x1="5.5" y1="9" x2="5.5" y2="10.5" />
        <line x1="0.5" y1="5.5" x2="2" y2="5.5" />
        <line x1="9" y1="5.5" x2="10.5" y2="5.5" />
        <line x1="2" y1="2" x2="3.1" y2="3.1" />
        <line x1="7.9" y1="7.9" x2="9" y2="9" />
        <line x1="9" y1="2" x2="7.9" y2="3.1" />
        <line x1="3.1" y1="7.9" x2="2" y2="9" />
    </svg>
);

const IconMoon = () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M8.5 6.5A4 4 0 1 1 4.5 2.5 3 3 0 0 0 8.5 6.5z" />
    </svg>
);

const IconUser = () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <circle cx="5.5" cy="3.5" r="2" />
        <path d="M1.5 10c0-2.2 1.8-4 4-4s4 1.8 4 4" />
    </svg>
);

const IconDownload = () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <line x1="5.5" y1="1" x2="5.5" y2="7.5" />
        <polyline points="3,5.5 5.5,8 8,5.5" />
        <line x1="1.5" y1="10" x2="9.5" y2="10" />
    </svg>
);

const IconExcel = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <rect x="1.5" y="1.5" width="11" height="11" rx="1" />
        <line x1="1.5" y1="5" x2="12.5" y2="5" />
        <line x1="1.5" y1="8.5" x2="12.5" y2="8.5" />
        <line x1="5" y1="5" x2="5" y2="12.5" />
        <line x1="8.5" y1="5" x2="8.5" y2="12.5" />
    </svg>
);

const IconPDF = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M2 1.5h7l2.5 2.5V12.5a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5z" />
        <polyline points="9,1.5 9,4 11.5,4" />
        <line x1="4" y1="7" x2="10" y2="7" />
        <line x1="4" y1="9.5" x2="10" y2="9.5" />
    </svg>
);

// ── Admin Login Modal ─────────────────────────────────────────────────────

function AdminModal({ onClose, onOpenAdmin }) {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (user === 'scpng@123' && pass === 'scapng@123') {
            onClose();
            onOpenAdmin();
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded p-6 w-[300px] font-mono shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <span className="text-[12px] font-bold tracking-[2px] text-text">ADMIN LOGIN</span>
                    <span className="text-[9px] text-muted tracking-wider">SCPNG</span>
                </div>

                <>
                    <div className="flex flex-col gap-3 mb-4">
                            <div>
                                <div className="text-[9px] text-muted tracking-[2px] mb-1.5">USERNAME</div>
                                <input
                                    type="text"
                                    value={user}
                                    onChange={e => setUser(e.target.value)}
                                    className="w-full bg-card border border-border px-3 py-2 text-[11px] text-text outline-none focus:border-accent transition-colors rounded-sm"
                                    autoFocus
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <div className="text-[9px] text-muted tracking-[2px] mb-1.5">PASSWORD</div>
                                <input
                                    type="password"
                                    value={pass}
                                    onChange={e => setPass(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    className="w-full bg-card border border-border px-3 py-2 text-[11px] text-text outline-none focus:border-accent transition-colors rounded-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-[10px] mb-3" style={{ color: 'var(--red)' }}>{error}</div>
                        )}

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={onClose}
                                className="border border-border px-3 py-1.5 text-[10px] text-dim hover:text-text transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleLogin}
                                className="bg-accent px-4 py-1.5 text-[10px] font-bold hover:opacity-90 transition-opacity"
                                style={{ color: 'var(--bg)' }}
                            >
                                LOGIN
                            </button>
                        </div>
                </>
            </div>
        </div>
    );
}

// ── Export Modal ──────────────────────────────────────────────────────────

function ExportModal({ onClose }) {
    const [loading, setLoading] = useState(null);

    const handleExport = (type) => {
        setLoading(type);
        setTimeout(() => {
            if (type === 'excel') doExportExcel();
            else doExportPDF();
            setLoading(null);
            onClose();
        }, 80);
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded p-6 w-[300px] font-mono shadow-2xl">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold tracking-[2px] text-text">EXPORT DATA</span>
                    <span className="text-[9px] text-muted tracking-wider">13 STOCKS</span>
                </div>
                <div className="text-[9px] text-muted mb-5">Securities Commission of PNG — Market Data</div>

                <div className="flex flex-col gap-2 mb-5">
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={!!loading}
                        className="flex items-center gap-3 border border-border px-4 py-3 text-left hover:border-accent hover:bg-card transition-all group disabled:opacity-50"
                    >
                        <span className="text-muted group-hover:text-accent transition-colors">
                            <IconExcel />
                        </span>
                        <div>
                            <div className="text-[11px] text-text group-hover:text-accent transition-colors">
                                {loading === 'excel' ? 'Generating…' : 'Export as Excel'}
                            </div>
                            <div className="text-[9px] text-muted mt-0.5">.xlsx · full data with metadata sheet</div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={!!loading}
                        className="flex items-center gap-3 border border-border px-4 py-3 text-left hover:border-accent hover:bg-card transition-all group disabled:opacity-50"
                    >
                        <span className="text-muted group-hover:text-accent transition-colors">
                            <IconPDF />
                        </span>
                        <div>
                            <div className="text-[11px] text-text group-hover:text-accent transition-colors">
                                {loading === 'pdf' ? 'Generating…' : 'Export as PDF'}
                            </div>
                            <div className="text-[9px] text-muted mt-0.5">.pdf · A4 landscape table report</div>
                        </div>
                    </button>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="border border-border px-3 py-1.5 text-[10px] text-dim hover:text-text transition-colors"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main ThreeDotsMenu ────────────────────────────────────────────────────

export default function ThreeDotsMenu({ darkMode, onToggleDarkMode, onOpenAdmin }) {
    const [open, setOpen] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
    const [dropPos, setDropPos] = useState({ top: 55, right: 16 });
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    // Track fullscreen changes
    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleToggle = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropPos({ top: rect.bottom + 5, right: window.innerWidth - rect.right });
        }
        setOpen(o => !o);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen();
        }
        setOpen(false);
    };

    const items = [
        {
            icon: <IconRefresh />,
            label: 'Refresh',
            onClick: () => { window.location.reload(); },
        },
        {
            icon: isFullscreen ? <IconExitFullscreen /> : <IconFullscreen />,
            label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
            onClick: toggleFullscreen,
        },
        {
            icon: darkMode ? <IconSun /> : <IconMoon />,
            label: darkMode ? 'Light Mode' : 'Dark Mode',
            onClick: () => { onToggleDarkMode(); setOpen(false); },
        },
        {
            icon: <IconUser />,
            label: 'Admin Login',
            onClick: () => { setShowAdmin(true); setOpen(false); },
        },
        {
            icon: <IconDownload />,
            label: 'Export Data',
            onClick: () => { setShowExport(true); setOpen(false); },
        },
    ];

    return (
        <>
            <div className="relative" ref={menuRef}>
                {/* Three-dot button */}
                <button
                    ref={buttonRef}
                    onClick={handleToggle}
                    title="Menu"
                    className={`flex flex-col gap-[3.5px] items-center justify-center w-[30px] h-[30px] border rounded-sm transition-all duration-150 ${open
                        ? 'border-accent text-accent bg-card'
                        : 'border-border text-dim hover:border-accent hover:text-accent'
                        }`}
                >
                    <span className="w-[3px] h-[3px] rounded-full bg-current block"></span>
                    <span className="w-[3px] h-[3px] rounded-full bg-current block"></span>
                    <span className="w-[3px] h-[3px] rounded-full bg-current block"></span>
                </button>

                {/* Dropdown */}
                {open && (
                    <div style={{ position: 'fixed', top: dropPos.top, right: dropPos.right }} className="bg-surface border border-border rounded-sm min-w-[168px] z-[9999] shadow-2xl overflow-hidden">
                        {items.map((item, i) => (
                            <button
                                key={i}
                                onClick={item.onClick}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 font-mono text-[11px] text-dim hover:text-text hover:bg-card transition-colors border-b border-border last:border-b-0"
                            >
                                <span className="w-[14px] flex items-center justify-center shrink-0">
                                    {item.icon}
                                </span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} onOpenAdmin={onOpenAdmin} />}
            {showExport && <ExportModal onClose={() => setShowExport(false)} />}
        </>
    );
}
