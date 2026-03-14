import React, { useState, useEffect, useRef } from 'react';
import IntroOverlay from './components/IntroOverlay';
import NavigationBar from './components/NavigationBar';
import ProgressBar from './components/ProgressBar';
import Strip from './components/Strip';
import StockSlide from './components/StockSlide';
import TableSlide from './components/TableSlide';
import AdminPanel from './components/AdminPanel';

import { stocks, TOTAL_SLIDES, TF_SEQUENCE, TF_DURATION, TABLE_DURATION } from './data';

// Load saved customizations from localStorage and merge with defaults
function loadCompanyData() {
  try {
    const saved = JSON.parse(localStorage.getItem('scpng_company_data') || '{}');
    return stocks.map(s => ({ ...s, ...(saved[s.t] || {}) }));
  } catch {
    return stocks.map(s => ({ ...s }));
  }
}

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [curSlide, setCurSlide] = useState(0);
  const [curTFIdx, setCurTFIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [companyData, setCompanyData] = useState(loadCompanyData);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [navVisible, setNavVisible] = useState(true);

  const timerRef = useRef(null);
  const hideNavTimer = useRef(null);

  // Auto-hide nav 3s after intro completes
  useEffect(() => {
    if (showIntro) return;
    clearTimeout(hideNavTimer.current);
    hideNavTimer.current = setTimeout(() => setNavVisible(false), 3000);
    return () => clearTimeout(hideNavTimer.current);
  }, [showIntro]);

  const showNav = () => {
    clearTimeout(hideNavTimer.current);
    setNavVisible(true);
  };

  const scheduleHideNav = () => {
    clearTimeout(hideNavTimer.current);
    hideNavTimer.current = setTimeout(() => setNavVisible(false), 600);
  };

  // Apply dark/light theme
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  // Apply per-company brand colors when slide changes
  useEffect(() => {
    const root = document.documentElement.style;
    if (curSlide < companyData.length) {
      const c = companyData[curSlide];
      root.setProperty('--accent', c.color1);
      root.setProperty('--color-accent', c.color1);
    } else {
      // Table slide — restore theme default
      root.removeProperty('--accent');
      root.removeProperty('--color-accent');
    }
  }, [curSlide, companyData]);

  const currentDuration = curSlide === stocks.length ? TABLE_DURATION : TF_DURATION;

  const goToSlide = (idx) => {
    setCurSlide(idx);
    setCurTFIdx(0);
    setResetKey(k => k + 1);
  };

  const advance = () => {
    if (curSlide < stocks.length) {
      if (curTFIdx + 1 < TF_SEQUENCE.length) {
        setCurTFIdx(prev => prev + 1);
        setResetKey(k => k + 1);
      } else {
        goToSlide((curSlide + 1) % TOTAL_SLIDES);
      }
    } else {
      goToSlide((curSlide + 1) % TOTAL_SLIDES);
    }
  };

  useEffect(() => {
    if (showIntro) return;
    if (paused) return;

    timerRef.current = setTimeout(advance, currentDuration);
    return () => clearTimeout(timerRef.current);
  }, [curSlide, curTFIdx, paused, showIntro, currentDuration]);

  // Update one company's data and persist to localStorage
  const handleUpdateCompany = (ticker, changes) => {
    const updated = companyData.map(c => c.t === ticker ? { ...c, ...changes } : c);
    const toSave = {};
    updated.forEach(c => {
      toSave[c.t] = { n: c.n, logo: c.logo, color1: c.color1, color2: c.color2 };
    });
    localStorage.setItem('scpng_company_data', JSON.stringify(toSave));
    setCompanyData(updated);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-bg text-text font-sans antialiased rounded-2xl" style={{ transform: 'translateZ(0)' }}>
      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}

      {!showIntro && (
        <>
          {/* Hover zone — always at top, triggers nav reveal */}
          <div
            className="fixed top-0 left-0 right-0 z-[302]"
            style={{ height: navVisible ? '50px' : '12px', pointerEvents: navVisible ? 'none' : 'auto' }}
            onMouseEnter={showNav}
          />

          <NavigationBar
            curSlide={curSlide}
            paused={paused}
            onTogglePause={() => setPaused(!paused)}
            onDotClick={goToSlide}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(d => !d)}
            onOpenAdmin={() => { setPaused(true); setShowAdminPanel(true); }}
            navVisible={navVisible}
            onMouseEnter={showNav}
            onMouseLeave={scheduleHideNav}
          />

          <ProgressBar
            duration={currentDuration}
            active={!paused}
            resetKey={resetKey}
            navVisible={navVisible}
          />

          <Strip
            curSlide={curSlide}
            navVisible={navVisible}
            onSelect={idx => {
              setPaused(true);
              goToSlide(idx);
            }}
          />

          <div className="fixed left-0 right-0 bottom-0 overflow-hidden" style={{ top: navVisible ? '96px' : '46px', transition: 'top 0.35s ease' }}>
            {companyData.map((stock, i) => (
              <StockSlide
                key={stock.t}
                stock={stock}
                curTFIdx={curTFIdx}
                isActive={curSlide === i}
                onSetTF={idx => {
                  setCurTFIdx(idx);
                  setResetKey(k => k + 1);
                  setPaused(true);
                }}
              />
            ))}

            <TableSlide isActive={curSlide === stocks.length} />
          </div>

          {showAdminPanel && (
            <AdminPanel
              companyData={companyData}
              onUpdateCompany={handleUpdateCompany}
              onClose={() => setShowAdminPanel(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
