import React, { useEffect, useRef } from 'react';

export default function ProgressBar({ duration, active, resetKey }) {
    const fillRef = useRef(null);

    useEffect(() => {
        const el = fillRef.current;
        if (!el) return;

        if (!active) {
            el.style.transition = 'none';
            const timer = setTimeout(() => {
                el.style.width = el.style.width || '50%'; // Keep current position visually when paused
            }, 0);
            return () => clearTimeout(timer);
        } else {
            // Start or resume
            el.style.transition = 'none';
            el.style.width = '0%';

            const frame = requestAnimationFrame(() => {
                el.style.transition = `width ${duration}ms linear`;
                el.style.width = '100%';
            });
            return () => cancelAnimationFrame(frame);
        }
    }, [active, duration, resetKey]);

    return (
        <div className="fixed top-[50px] left-0 right-0 h-[2px] bg-border z-[299]">
            <div ref={fillRef} className="h-full bg-accent w-0"></div>
        </div>
    );
}
