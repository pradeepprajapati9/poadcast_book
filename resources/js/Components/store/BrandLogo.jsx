export default function BrandLogo({ className = '', showText = true, subtitle = true }) {
    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <svg viewBox="0 0 32 32" className="h-7 w-7 flex-none text-gold-400" fill="none">
                <path
                    d="M4 6c3.5-1.5 7-1.5 12 0 5-1.5 8.5-1.5 12 0v20c-3.5-1.5-7-1.5-12 0-5-1.5-8.5-1.5-12 0V6Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <path d="M16 6v20" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            {showText && (
                <span className="leading-none">
                    <span className="block text-sm font-semibold tracking-[0.15em] text-slate-100 sm:text-base sm:tracking-[0.2em]">
                        STORYVERSE
                    </span>
                    {subtitle && (
                        <span className="hidden text-[0.62rem] tracking-[0.3em] text-gold-400 sm:block">
                            DIGITAL LIBRARY
                        </span>
                    )}
                </span>
            )}
        </span>
    );
}
