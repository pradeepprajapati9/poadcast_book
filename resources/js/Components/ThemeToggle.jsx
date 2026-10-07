import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const OPTIONS = [
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'light', label: 'Light', icon: Sun },
];

export default function ThemeToggle({ className = '' }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = window.localStorage.getItem('storyverse-theme');
        if (saved && ['dark', 'light'].includes(saved)) {
            setTheme(saved);
        }
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const root = document.documentElement;
        root.classList.remove('dark', 'light', 'sepia');
        root.classList.add(theme);
        window.localStorage.setItem('storyverse-theme', theme);

        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
            themeColor.content = theme === 'light' ? '#f8fafc' : '#080b14';
        }
    }, [theme]);

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {OPTIONS.map((option) => (
                <button
                    key={option.key}
                    type="button"
                    aria-label={option.label}
                    onClick={() => setTheme(option.key)}
                    className={`grid h-9 w-9 place-items-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-gold-300/50 ${
                        theme === option.key
                            ? 'border-gold-400 bg-gold-500/15 text-gold-100'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-gold-400 hover:bg-gold-500/10 hover:text-gold-100'
                    }`}
                >
                    <option.icon className="h-4 w-4" strokeWidth={1.75} />
                </button>
            ))}
        </div>
    );
}
