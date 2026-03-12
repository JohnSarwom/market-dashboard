/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: 'var(--bg)',
                surface: 'var(--surface)',
                card: 'var(--card)',
                border: 'var(--border)',
                accent: 'var(--accent)',
                red: 'var(--red)',
                text: 'var(--text)',
                muted: 'var(--muted)',
                dim: 'var(--dim)',
            },
            fontFamily: {
                sans: ['Syne', 'sans-serif'],
                mono: ['Space Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
