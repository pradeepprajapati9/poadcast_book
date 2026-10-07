import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PdfReader from '@/Components/PdfReader';

const THEMES = {
    dark: { wrap: 'bg-ink-900 on-dark', bar: 'bg-ink-950/90 border-white/5', text: '' },
    light: { wrap: 'bg-slate-100', bar: 'bg-white/90 border-black/5', text: 'reader-light' },
};

export default function Reader({ book, chapter, nav }) {
    const [size] = useState(18);
    // PDFs render on their own; the surrounding reader stays dark.
    const t = THEMES.dark;

    const go = (number) => {
        if (number) router.get(route('reader', [book.slug, number]));
    };

    const progress = Math.round((nav.index / nav.total) * 100);
    const isPdf = !!chapter.pdf_url;

    return (
        <div className={`min-h-screen ${t.wrap} ${t.text}`}>
            <Head title={`${chapter.title} — ${book.title}`} />

            {/* Top bar — back button + centered chapter heading, nothing else */}
            <header className={`sticky top-0 z-30 border-b backdrop-blur ${t.bar}`}>
                <div className="relative mx-auto flex max-w-5xl items-center px-4 py-3">
                    <Link
                        href={route('books.show', book.slug)}
                        className="text-slate-400 hover:text-gold-400"
                        title="Back to book"
                    >
                        <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
                    </Link>
                    <h2 className="pointer-events-none absolute inset-x-12 text-center text-sm font-semibold text-slate-200">
                        <span className="truncate">Chapter {chapter.number}: {chapter.title}</span>
                    </h2>
                </div>
                <div className="h-0.5 bg-black/20">
                    <div className="h-full bg-gold-500" style={{ width: `${progress}%` }} />
                </div>
            </header>

            {/* Chapter body */}
            {isPdf ? (
                // Full-bleed PDF: our own renderer, no viewer chrome, no download.
                <div className="mx-auto max-w-4xl px-0 py-4 sm:px-4 sm:py-6">
                    <PdfReader url={chapter.pdf_url} />
                </div>
            ) : (
                <article className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
                    <h1 className="mb-6 text-center font-display text-xl font-bold text-gold-300 sm:mb-8 sm:text-3xl">
                        Chapter {chapter.number}: {chapter.title}
                    </h1>

                    {chapter.content ? (
                        <div
                            className="chapter-content"
                            style={{ fontSize: `${size}px`, lineHeight: 1.8 }}
                            dangerouslySetInnerHTML={{ __html: chapter.content }}
                        />
                    ) : (
                        <p className="py-16 text-center text-slate-400">
                            This chapter has no content yet.
                        </p>
                    )}
                </article>
            )}

            {/* Prev / Next */}
            <nav className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 pb-10 pt-4 sm:pb-14">
                <button
                    onClick={() => go(nav.prev?.number)}
                    disabled={!nav.prev}
                    className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-slate-300 enabled:hover:border-gold-500/50 enabled:hover:text-gold-300 disabled:opacity-30"
                >
                    <ArrowLeft className="mr-1 inline h-4 w-4" strokeWidth={2} />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                </button>

                <span className="text-xs text-slate-500">
                    {nav.index} / {nav.total}
                </span>

                {nav.next ? (
                    <button
                        onClick={() => go(nav.next.number)}
                        className="rounded-full bg-gold-500 px-7 py-2.5 text-sm font-semibold text-ink-950 shadow-gold transition hover:bg-gold-400"
                    >
                        Next chapter
                        <ArrowRight className="ml-1.5 inline h-4 w-4" strokeWidth={2} />
                    </button>
                ) : (
                    <Link
                        href={route('books.show', book.slug)}
                        className="rounded-full border border-gold-500/40 px-6 py-2.5 text-sm font-semibold text-gold-300 transition hover:bg-gold-500/10"
                    >
                        Finish
                    </Link>
                )}
            </nav>
        </div>
    );
}
