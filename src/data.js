// src/data.js

export const stocks = [
  { t: 'BSP', n: 'Bank South Pacific',        p: 14.80, pv: 14.60, h: 15.00, l: 14.55, v: 12400, mc: '11.2B', pe: '8.4x',  dv: '6.8%', h52: 16.20, l52: 12.10, o: 14.60, color1: '#1976D2', color2: '#64B5F6', logo: '' },
  { t: 'KSL', n: 'Kina Securities Ltd',       p: 1.24,  pv: 1.22,  h: 1.27,  l: 1.21,  v: 8200,  mc: '0.8B',  pe: '9.1x',  dv: '4.2%', h52: 1.45,  l52: 0.98,  o: 1.22,  color1: '#00897B', color2: '#4DB6AC', logo: '' },
  { t: 'CPL', n: 'CPL Group',                 p: 3.68,  pv: 3.70,  h: 3.72,  l: 3.64,  v: 3400,  mc: '0.4B',  pe: '12.2x', dv: '3.1%', h52: 4.10,  l52: 3.10,  o: 3.70,  color1: '#EF6C00', color2: '#FFA726', logo: '' },
  { t: 'SST', n: 'Steamships Trading',        p: 18.40, pv: 18.20, h: 18.60, l: 18.10, v: 1800,  mc: '1.1B',  pe: '7.2x',  dv: '5.5%', h52: 20.00, l52: 16.50, o: 18.20, color1: '#5E35B1', color2: '#9575CD', logo: '' },
  { t: 'NEM', n: 'Newmont Corporation',       p: 55.20, pv: 54.80, h: 55.90, l: 54.50, v: 920,   mc: '44.0B', pe: '18.4x', dv: '2.3%', h52: 62.00, l52: 41.20, o: 54.80, color1: '#F9A825', color2: '#FFD54F', logo: '' },
  { t: 'STO', n: 'Santos Limited',            p: 7.14,  pv: 7.20,  h: 7.22,  l: 7.09,  v: 5600,  mc: '12.1B', pe: '11.0x', dv: '3.8%', h52: 8.20,  l52: 6.10,  o: 7.20,  color1: '#0097A7', color2: '#4FC3F7', logo: '' },
  { t: 'NIU', n: 'Niuminco Group',            p: 0.03,  pv: 0.03,  h: 0.04,  l: 0.03,  v: 42000, mc: '0.02B', pe: 'N/A',   dv: '0%',   h52: 0.06,  l52: 0.02,  o: 0.03,  color1: '#43A047', color2: '#81C784', logo: '' },
  { t: 'NGP', n: 'New Guinea Islands Produce',p: 5.10,  pv: 5.00,  h: 5.20,  l: 4.98,  v: 2200,  mc: '0.3B',  pe: '10.5x', dv: '4.0%', h52: 5.80,  l52: 4.20,  o: 5.00,  color1: '#7CB342', color2: '#AED581', logo: '' },
  { t: 'PLC', n: 'Pacific Lime & Cement',     p: 2.40,  pv: 2.38,  h: 2.44,  l: 2.36,  v: 1600,  mc: '0.5B',  pe: '14.2x', dv: '2.8%', h52: 2.90,  l52: 1.90,  o: 2.38,  color1: '#546E7A', color2: '#90A4AE', logo: '' },
  { t: 'KAM', n: 'Kina Asset Management',     p: 1.48,  pv: 1.46,  h: 1.50,  l: 1.44,  v: 7100,  mc: '0.9B',  pe: '11.3x', dv: '5.1%', h52: 1.65,  l52: 1.20,  o: 1.46,  color1: '#3949AB', color2: '#7986CB', logo: '' },
  { t: 'KAML', n: 'Kina Asset Mgmt (Listed)', p: 1.52,  pv: 1.52,  h: 1.54,  l: 1.50,  v: 4300,  mc: '0.6B',  pe: '11.8x', dv: '5.0%', h52: 1.70,  l52: 1.25,  o: 1.52,  color1: '#039BE5', color2: '#4FC3F7', logo: '' },
  { t: 'NCM', n: 'Newcrest Mining',           p: 26.10, pv: 25.90, h: 26.40, l: 25.80, v: 2800,  mc: '19.8B', pe: '22.1x', dv: '1.4%', h52: 30.50, l52: 21.00, o: 25.90, color1: '#BF6900', color2: '#FFB300', logo: '' },
  { t: 'TTM', n: 'Tininga Ltd',               p: 0.82,  pv: 0.80,  h: 0.85,  l: 0.79,  v: 6500,  mc: '0.1B',  pe: '15.0x', dv: '1.0%', h52: 1.00,  l52: 0.65,  o: 0.80,  color1: '#D81B60', color2: '#F48FB1', logo: '' },
];

export const announcements = [
  { sym: 'KAM', text: 'NTA as at 28 February 2026', date: '10 Mar 2026' },
  { sym: 'KAML', text: 'Audited Financial Statements 31 Dec 2025', date: '10 Mar 2026' },
  { sym: 'BSP', text: 'Q4 2025 Dividend — K0.65/share', date: '07 Mar 2026' },
  { sym: 'SST', text: 'Half Year Report — December 2025', date: '05 Mar 2026' },
  { sym: 'NEM', text: 'Annual General Meeting — 28 Apr 2026', date: '02 Mar 2026' },
  { sym: 'KSL', text: 'FY2025 Full Year Results released', date: '28 Feb 2026' },
  { sym: 'NCM', text: 'Q1 2026 Production Report — Mar 2026', date: '25 Feb 2026' },
  { sym: 'STO', text: 'Dividend reinvestment plan suspended', date: '20 Feb 2026' },
  { sym: 'NGP', text: 'Board appointment — new Independent Director', date: '18 Feb 2026' },
  { sym: 'TTM', text: 'Trading halt lifted — normal trading resumed', date: '14 Feb 2026' },
];

export const TF_SEQUENCE = ['1D', '3D', '5D', '1M', '3M', '6M', '1Y'];
export const TF_DURATION = 30000;  // ms per timeframe within a stock
export const TABLE_DURATION = 12000;
export const INTRO_DURATION = 5000;

export const TF_CONFIG = {
  '1D': { days: 1, label: 'today\'s session', labelFmt: 'day', sc: .998 },
  '3D': { days: 3, label: '3 trading days', labelFmt: 'day', sc: .991 },
  '5D': { days: 5, label: '5 trading days', labelFmt: 'day', sc: .985 },
  '1M': { days: 22, label: '1 month', labelFmt: 'date', sc: .96 },
  '3M': { days: 66, label: '3 months', labelFmt: 'date', sc: .92 },
  '6M': { days: 130, label: '6 months', labelFmt: 'month', sc: .87 },
  '1Y': { days: 252, label: '1 year', labelFmt: 'month', sc: .75 },
};

export const TOTAL_SLIDES = stocks.length + 1;
