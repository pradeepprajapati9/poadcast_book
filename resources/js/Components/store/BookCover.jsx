import { BookOpen } from 'lucide-react';
const GRADIENTS = [
    'from-indigo-900 via-ink-800 to-ink-950',
    'from-rose-900 via-ink-800 to-ink-950',
    'from-emerald-900 via-ink-800 to-ink-950',
    'from-amber-900 via-ink-800 to-ink-950',
    'from-sky-900 via-ink-800 to-ink-950',
    'from-fuchsia-900 via-ink-800 to-ink-950',
];

function pick(str = '') {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % GRADIENTS.length;
    return GRADIENTS[h];
}

/**
 * variant:
 *  'full'    → gradient + wrapped title + author (for tall vertical covers)
 *  'minimal' → gradient + book glyph + monogram (for compact horizontal covers, with no clutter)
 */
export default function BookCover({ book, className = '', variant = 'full' }) {
    if (book.cover_image) {
        return (
            <img
                src={book.cover_image}
                alt={book.title}
                loading="lazy"
                decoding="async"
                className={`h-full w-full object-cover ${className}`}
            />
        );
    }

    const gradient = pick(book.title);

    if (variant === 'minimal') {
        return (
            <div className={`on-dark flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${gradient} ${className}`}>
                <BookOpen className="h-8 w-8 text-white/70" strokeWidth={1.5} />
                <span className="mt-1 font-display text-xl font-bold tracking-wider text-white/70">
                    {(book.title || '?').charAt(0).toUpperCase()}
                </span>
            </div>
        );
    }

    return (
        <div className={`on-dark flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${gradient} p-4 text-center ${className}`}>
            <span className="font-display text-lg font-bold leading-tight text-slate-100 line-clamp-4">
                {book.title}
            </span>
            {book.author && (
                <span className="mt-2 text-[0.65rem] uppercase tracking-widest text-gold-400/80">
                    {book.author}
                </span>
            )}
        </div>
    );
}
