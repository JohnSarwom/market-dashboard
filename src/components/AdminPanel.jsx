import React, { useState, useEffect, useRef } from 'react';
import { stocks as defaultStocks } from '../data';

// ── Color helpers ─────────────────────────────────────────────────────────

function hexToRgba(hex, alpha) {
    try {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    } catch {
        return `rgba(0,0,0,${alpha})`;
    }
}

// ── Sub-components ────────────────────────────────────────────────────────

function Section({ title, children }) {
    return (
        <div>
            <div className="text-[9px] text-muted tracking-[2px] mb-3 font-mono">{title}</div>
            {children}
        </div>
    );
}

function ColorRow({ label, sub, value, onChange }) {
    const inputRef = useRef(null);
    return (
        <div className="flex items-center gap-4">
            {/* Swatch / native color picker trigger */}
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-[44px] h-[44px] rounded-sm border-2 border-border hover:border-accent transition-colors shrink-0 relative overflow-hidden shadow-inner"
                style={{ background: value }}
                title="Click to pick color"
            >
                <input
                    ref={inputRef}
                    type="color"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
            </button>

            {/* Labels */}
            <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono font-bold text-dim mb-0.5">{label}</div>
                <div className="text-[9px] font-mono text-muted">{sub}</div>
            </div>

            {/* Hex input */}
            <input
                type="text"
                value={value}
                onChange={e => {
                    const v = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
                }}
                className="w-[90px] bg-card border border-border px-3 py-1.5 text-[11px] text-text outline-none focus:border-accent transition-colors font-mono uppercase"
                placeholder="#000000"
                maxLength={7}
            />
        </div>
    );
}

function MiniPreview({ draft }) {
    const c1 = draft.color1 || '#e8b800';
    const c2 = draft.color2 || '#888';
    return (
        <div
            className="rounded-sm border border-border overflow-hidden"
            style={{ borderColor: hexToRgba(c1, 0.4) }}
        >
            {/* Mini nav bar */}
            <div
                className="h-[30px] flex items-center px-3 gap-2 border-b"
                style={{
                    background: 'var(--surface)',
                    borderBottomColor: hexToRgba(c1, 0.3),
                    borderBottomWidth: '2px',
                }}
            >
                <span className="text-[8px] font-bold tracking-[2px] font-mono text-text">MARKET DASHBOARD</span>
                <span className="ml-auto text-[9px] font-mono font-bold" style={{ color: c1 }}>
                    {draft.t}
                </span>
            </div>

            {/* Company hero row */}
            <div className="bg-card p-3 flex gap-3 items-start">
                {/* Logo box */}
                <div
                    className="w-[52px] h-[52px] border flex items-center justify-center relative overflow-hidden shrink-0 bg-surface"
                    style={{ borderColor: hexToRgba(c1, 0.35) }}
                >
                    {draft.logo ? (
                        <img src={draft.logo} alt="" className="w-full h-full object-contain" />
                    ) : (
                        <span className="font-mono text-[8px] font-bold" style={{ color: hexToRgba(c1, 0.35) }}>
                            {draft.t}
                        </span>
                    )}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: c1 }} />
                </div>

                {/* Company name + mock price */}
                <div className="flex-1 min-w-0">
                    <div className="font-mono text-[8px] font-bold mb-0.5" style={{ color: c1 }}>{draft.t}</div>
                    <div className="font-bold text-[12px] text-text truncate mb-1">{draft.n}</div>

                    {/* Mock chart using SVG */}
                    <div className="h-[28px] w-full rounded-sm overflow-hidden">
                        <svg width="100%" height="28" viewBox="0 0 260 28" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`admin-grad-${draft.t}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={c2} stopOpacity="0.45" />
                                    <stop offset="100%" stopColor={c2} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,22 C30,20 55,18 80,14 C105,10 125,12 150,9 C175,6 205,5 260,3"
                                fill="none"
                                stroke={c1}
                                strokeWidth="2"
                            />
                            <path
                                d="M0,22 C30,20 55,18 80,14 C105,10 125,12 150,9 C175,6 205,5 260,3 L260,28 L0,28 Z"
                                fill={`url(#admin-grad-${draft.t})`}
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Accent bar at bottom showing both colors */}
            <div className="flex h-[5px]">
                <div className="flex-1" style={{ background: c1 }} />
                <div className="flex-1" style={{ background: c2 }} />
            </div>
        </div>
    );
}

// ── Main AdminPanel ───────────────────────────────────────────────────────

export default function AdminPanel({ companyData, onUpdateCompany, onClose }) {
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [draft, setDraft] = useState(null);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saved'
    const fileRef = useRef(null);

    // Sync draft when selected company changes
    useEffect(() => {
        setSaveStatus('idle');
        setDraft({ ...companyData[selectedIdx] });
    }, [selectedIdx, companyData]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setDraft(d => ({ ...d, logo: ev.target.result }));
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleSave = () => {
        if (!draft) return;
        onUpdateCompany(draft.t, {
            n: draft.n,
            logo: draft.logo,
            color1: draft.color1,
            color2: draft.color2,
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
    };

    const handleReset = () => {
        const def = defaultStocks.find(s => s.t === draft?.t);
        if (def) setDraft(d => ({ ...d, n: def.n, logo: def.logo || '', color1: def.color1, color2: def.color2 }));
    };

    if (!draft) return null;

    return (
        <div className="fixed inset-0 z-[500] flex flex-col font-mono overflow-hidden" style={{ background: 'var(--bg)' }}>

            {/* ── Header ─────────────────────────────────────────────── */}
            <div
                className="h-[50px] border-b flex items-center justify-between px-5 shrink-0"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
                <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold tracking-[2px]">ADMIN PANEL</span>
                    <span
                        className="text-[9px] font-mono px-2 py-0.5 border tracking-wider"
                        style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
                    >
                        SCPNG MARKET DASHBOARD
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="border px-3 py-1.5 text-[11px] transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--dim)' }}
                    onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--text)';
                        e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--dim)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                >
                    ← BACK TO DASHBOARD
                </button>
            </div>

            {/* ── Body ───────────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0">

                {/* Left sidebar — company list */}
                <div
                    className="w-[220px] border-r flex flex-col shrink-0 overflow-hidden"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                    <div
                        className="px-4 py-3 text-[9px] tracking-[2px] border-b shrink-0"
                        style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
                    >
                        COMPANIES ({companyData.length})
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-none">
                        {companyData.map((c, i) => (
                            <button
                                key={c.t}
                                onClick={() => setSelectedIdx(i)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left border-b transition-colors"
                                style={{
                                    borderColor: 'var(--border)',
                                    background: i === selectedIdx ? 'var(--card)' : 'transparent',
                                    color: i === selectedIdx ? 'var(--text)' : 'var(--muted)',
                                }}
                                onMouseEnter={e => { if (i !== selectedIdx) e.currentTarget.style.background = 'var(--card)'; }}
                                onMouseLeave={e => { if (i !== selectedIdx) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {/* Color dot */}
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0 border"
                                    style={{
                                        background: c.color1,
                                        borderColor: hexToRgba(c.color1, 0.4),
                                        boxShadow: i === selectedIdx ? `0 0 6px ${c.color1}80` : 'none',
                                    }}
                                />
                                <div className="min-w-0">
                                    <div className={`text-[11px] font-bold ${i === selectedIdx ? 'text-text' : ''}`}
                                        style={i === selectedIdx ? { color: c.color1 } : {}}
                                    >
                                        {c.t}
                                    </div>
                                    <div className="text-[9px] truncate" style={{ color: 'var(--muted)' }}>{c.n}</div>
                                </div>
                                {/* Two-color swatch */}
                                <div className="ml-auto flex gap-0.5 shrink-0">
                                    <div className="w-[8px] h-[16px] rounded-l-sm" style={{ background: c.color1 }} />
                                    <div className="w-[8px] h-[16px] rounded-r-sm" style={{ background: c.color2 }} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right editor */}
                <div className="flex-1 overflow-y-auto scrollbar-none p-8">
                    <div className="max-w-[640px] mx-auto flex flex-col gap-8">

                        {/* Company title */}
                        <div className="flex items-baseline gap-3 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                            <span
                                className="text-[28px] font-extrabold tracking-[-0.5px]"
                                style={{ color: draft.color1 }}
                            >
                                {draft.t}
                            </span>
                            <span className="text-[12px]" style={{ color: 'var(--muted)' }}>/ Company Settings</span>
                        </div>

                        {/* ── Name ─────────────────────────────── */}
                        <Section title="COMPANY NAME">
                            <input
                                type="text"
                                value={draft.n}
                                onChange={e => setDraft(d => ({ ...d, n: e.target.value }))}
                                className="w-full border px-4 py-2.5 text-[12px] outline-none transition-colors"
                                style={{
                                    background: 'var(--card)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text)',
                                }}
                                onFocus={e => e.target.style.borderColor = draft.color1}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                        </Section>

                        {/* ── Logo ─────────────────────────────── */}
                        <Section title="COMPANY LOGO">
                            <div className="flex gap-5 items-start">
                                {/* Preview box */}
                                <div
                                    className="w-[80px] h-[80px] border shrink-0 flex items-center justify-center overflow-hidden relative"
                                    style={{ background: 'var(--card)', borderColor: hexToRgba(draft.color1, 0.4) }}
                                >
                                    {draft.logo ? (
                                        <img src={draft.logo} alt="" className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <span
                                            className="text-[10px] font-bold select-none"
                                            style={{ color: hexToRgba(draft.color1, 0.3) }}
                                        >
                                            {draft.t}
                                        </span>
                                    )}
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: draft.color1 }} />
                                </div>

                                {/* URL + upload */}
                                <div className="flex-1 flex flex-col gap-2.5">
                                    <div>
                                        <div className="text-[9px] tracking-[1px] mb-1.5" style={{ color: 'var(--muted)' }}>
                                            LOGO URL
                                        </div>
                                        <input
                                            type="text"
                                            value={draft.logo && draft.logo.startsWith('data:') ? '' : (draft.logo || '')}
                                            onChange={e => setDraft(d => ({ ...d, logo: e.target.value }))}
                                            placeholder="https://example.com/logo.png"
                                            className="w-full border px-3 py-2 text-[11px] outline-none transition-colors"
                                            style={{
                                                background: 'var(--card)',
                                                borderColor: 'var(--border)',
                                                color: 'var(--text)',
                                            }}
                                            onFocus={e => e.target.style.borderColor = draft.color1}
                                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                        />
                                        {draft.logo?.startsWith('data:') && (
                                            <div className="text-[9px] mt-1" style={{ color: 'var(--muted)' }}>
                                                Using uploaded file
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-[9px] tracking-[1px]" style={{ color: 'var(--muted)' }}>
                                        OR UPLOAD FILE
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            className="border px-3 py-1.5 text-[10px] transition-colors"
                                            style={{ borderColor: 'var(--border)', color: 'var(--dim)' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = draft.color1}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                        >
                                            Choose Image…
                                        </button>
                                        {draft.logo && (
                                            <button
                                                type="button"
                                                onClick={() => setDraft(d => ({ ...d, logo: '' }))}
                                                className="text-[9px] transition-colors"
                                                style={{ color: 'var(--muted)' }}
                                                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                                            >
                                                × Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* ── Brand Colors ─────────────────────── */}
                        <Section title="BRAND COLORS">
                            <div
                                className="border rounded-sm p-5 flex flex-col gap-5"
                                style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                            >
                                <ColorRow
                                    label="PRIMARY COLOR"
                                    sub="Chart line · nav accents · active states · dots"
                                    value={draft.color1}
                                    onChange={v => setDraft(d => ({ ...d, color1: v }))}
                                />
                                <div className="h-px" style={{ background: 'var(--border)' }} />
                                <ColorRow
                                    label="SECONDARY COLOR"
                                    sub="Chart gradient fill · secondary highlights"
                                    value={draft.color2}
                                    onChange={v => setDraft(d => ({ ...d, color2: v }))}
                                />
                            </div>
                        </Section>

                        {/* ── Live Preview ─────────────────────── */}
                        <Section title="LIVE PREVIEW">
                            <MiniPreview draft={draft} />
                        </Section>

                        {/* ── Actions ──────────────────────────── */}
                        <div
                            className="flex items-center justify-between pt-5 border-t"
                            style={{ borderColor: 'var(--border)' }}
                        >
                            <button
                                type="button"
                                onClick={handleReset}
                                className="border px-4 py-2 text-[11px] transition-colors"
                                style={{ borderColor: 'var(--border)', color: 'var(--dim)' }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                    e.currentTarget.style.color = 'var(--text)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.color = 'var(--dim)';
                                }}
                            >
                                ↺ Reset to Default
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                className="px-6 py-2 text-[11px] font-bold transition-all"
                                style={{
                                    background: saveStatus === 'saved' ? '#2e7d32' : draft.color1,
                                    color: '#ffffff',
                                    letterSpacing: '1px',
                                }}
                            >
                                {saveStatus === 'saved' ? '✓ SAVED' : 'SAVE CHANGES'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
