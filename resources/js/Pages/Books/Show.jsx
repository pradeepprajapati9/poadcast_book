import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import StoreLayout from '@/Layouts/StoreLayout';
import BookCover from '@/Components/store/BookCover';
import Reveal, { Stagger, StaggerItem } from '@/Components/motion/Reveal';
import { bgFor } from '@/lib/images';
import { ArrowLeft, Check, Lock, Star } from 'lucide-react';
import Seo from '@/Components/Seo';

/* ── icons ───────────────────────────────────────────────────────────── */

const iconProps = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

function BookIcon(props) {
    return (
        <svg viewBox="0 0 24 24" {...iconProps} {...props}>
            <path d="M4 5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2z" />
            <path d="M20 5a2 2 0 0 0-2-2h-5v18h5a2 2 0 0 0 2-2z" />
        </svg>
    );
}

function ClockIcon(props) {
    return (
        <svg viewBox="0 0 24 24" {...iconProps} {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

function PagesIcon(props) {
    return (
        <svg viewBox="0 0 24 24" {...iconProps} {...props}>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
        </svg>
    );
}

function BookmarkIcon(props) {
    return (
        <svg viewBox="0 0 24 24" {...iconProps} {...props}>
            <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4z" />
        </svg>
    );
}

function LockIcon(props) {
    return (
        <svg viewBox="0 0 24 24" {...iconProps} {...props}>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
    );
}

function ChevronIcon(props) {
    return (
        <svg viewBox="0 0 24 24" {...iconProps} {...props}>
            <path d="m9 6 6 6-6 6" />
        </svg>
    );
}

/* ── pieces ──────────────────────────────────────────────────────────── */

/**
 * Stat cell: icon + label + value.
 * Stacks (icon on top) inside the mobile 3-across strip, goes side-by-side on
 * the desktop column.
 */
function StatTile({ icon, label, value }) {
    return (
        <div className="flex flex-col items-center gap-1.5 text-center lg:flex-row lg:gap-3 lg:text-left">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full border border-gold-500/25 bg-gold-500/10 text-gold-400 lg:h-11 lg:w-11">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-[0.6rem] uppercase tracking-[0.1em] theme-muted lg:text-[0.65rem]">{label}</p>
                <p className="truncate font-display text-base font-bold theme-heading lg:text-lg">{value}</p>
            </div>
        </div>
    );
}

/** Section heading with an optional right-hand action. */
function SectionHead({ icon, title, action }) {
    return (
        <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.12em] theme-heading">
                <span className="text-gold-400">{icon}</span>
                {title}
            </h2>
            {action}
        </div>
    );
}

/* ── page ────────────────────────────────────────────────────────────── */

export default function Show({ book, chapters, related = [], hasAccess }) {
    const { auth, flash } = usePage().props;
    const [showFullDescription, setShowFullDescription] = useState(false);

    const firstReadable = chapters.find((c) => !c.locked) || chapters[0];
    const readHref = firstReadable ? route('reader', [book.slug, firstReadable.number]) : null;
    const freeCount = chapters.filter((c) => c.is_free).length;

    // Redeem was removed from the UI, so a signed-in reader has no self-serve
    // way to unlock. Guests are still sent to log in; for everyone else a locked
    // chapter is simply not clickable rather than a link that goes nowhere.
    // Readers sign in with an email OTP; the password page is staff-only.
    const unlockHref = auth?.user ? null : route('otp.create');
    const chapterHref = (c) => (c.locked ? unlockHref : route('reader', [book.slug, c.number]));

    // SEO: a clean, keyword-rich description from the book's own text.
    const genreNames = book.genres.map((g) => g.name);
    const metaDescription = (book.tagline || book.description || `Read ${book.title} online on StoryVerse.`)
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160);
    const metaKeywords = [
        book.title,
        book.author,
        ...genreNames,
        `read ${book.title} online`,
        'web novel',
        'read stories online',
    ].filter(Boolean).join(', ');

    const bookJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: book.title,
        author: book.author ? { '@type': 'Person', name: book.author } : undefined,
        description: book.description || book.tagline || undefined,
        image: book.cover_image || undefined,
        genre: genreNames,
        numberOfPages: book.total_pages || undefined,
        aggregateRating: book.rating > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: book.rating,
            bestRating: 5,
            ratingCount: Math.max(book.views, 1),
        } : undefined,
        offers: {
            '@type': 'Offer',
            price: book.price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
        },
    };

    return (
        <StoreLayout>
            <Seo
                title={book.title}
                description={metaDescription}
                keywords={metaKeywords}
                image={book.cover_image || book.banner_image}
                type="book"
                jsonLd={bookJsonLd}
            />

            {/* ── Hero banner — full-bleed pure image (not clickable) ──── */}
            <section className="relative mx-2 overflow-hidden rounded-2xl sm:mx-4 sm:rounded-3xl">
                <img
                    src={bgFor(book)}
                    alt={book.title}
                    className="block aspect-square w-full object-cover object-center md:aspect-auto md:h-[74vh]"
                    decoding="async"
                    fetchpriority="high"
                />

                {/* Back to Library — navigation only, small floating pill */}
                <Link
                    href={route('library')}
                    className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/60 sm:left-4 sm:top-4"
                >
                    <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                    Back to Library
                </Link>
            </section>

            <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
                {hasAccess && (
                    <p className="inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-600">
                        <Check className="mr-1 inline h-4 w-4" strokeWidth={2} />You have full access to this book
                    </p>
                )}
                {flash?.locked && (
                    <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600">
                        <Lock className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.75} />{flash.locked}
                    </p>
                )}

                {/* ── Overview card ─────────────────────────────────────── */}
                <Reveal>
                    <div className="rounded-3xl border theme-border theme-card p-4 shadow-sm sm:p-6 lg:p-7">
                        {/* Top: cover (~35%) + info (~65%), vertically centred */}
                        <div className="grid grid-cols-[35%_1fr] items-center gap-4 sm:gap-6 lg:grid-cols-[32%_1fr] lg:gap-8">
                            <div className="relative">
                                <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-black/10 sm:rounded-2xl">
                                    {book.card_image ? (
                                        <img src={book.card_image} alt={book.title} className="block w-full" />
                                    ) : (
                                        <div className="aspect-[2/3]">
                                            <BookCover book={book} />
                                        </div>
                                    )}
                                </div>
                                <span className="absolute left-2 top-0 rounded-b-md bg-gold-500 px-1.5 py-0.5 font-display text-[0.65rem] font-bold text-ink-950 shadow sm:px-2 sm:py-1 sm:text-xs">
                                    {String(chapters.length).padStart(2, '0')}
                                </span>
                            </div>

                            <div className="min-w-0">
                                <p className="text-[0.6rem] uppercase tracking-[0.2em] theme-muted">Book:</p>
                                <h2 className="mt-0.5 font-display text-lg font-bold uppercase leading-tight theme-heading sm:text-2xl lg:text-3xl">
                                    {book.title}
                                </h2>
                                {book.author && <p className="mt-1 text-sm font-medium theme-accent sm:text-base">{book.author}</p>}
                                {book.subtitle && <p className="mt-0.5 text-xs theme-muted sm:text-sm">{book.subtitle}</p>}

                                <p className={`mt-3 whitespace-pre-line text-sm leading-6 theme-text ${showFullDescription ? '' : 'line-clamp-4 sm:line-clamp-6'}`}>
                                    {book.description}
                                </p>

                                {book.description?.length > 200 && (
                                    <button
                                        onClick={() => setShowFullDescription((v) => !v)}
                                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider theme-accent transition hover:opacity-70"
                                    >
                                        {showFullDescription ? 'Show less' : 'View full description'}
                                        <ChevronIcon className={`h-3.5 w-3.5 transition ${showFullDescription ? '-rotate-90' : 'rotate-90'}`} />
                                    </button>
                                )}

                                {book.genres.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {book.genres.map((g) => (
                                            <Link
                                                key={g.slug}
                                                href={route('library', { genre: g.slug })}
                                                className="rounded-full border theme-border px-2.5 py-0.5 text-xs theme-muted transition hover:border-gold-500/50 hover:text-gold-400"
                                            >
                                                {g.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom bar: stats + access + read — spans full width, fills the card */}
                        <div className="mt-5 grid gap-4 border-t theme-border pt-5 sm:mt-6 sm:pt-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
                            <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:max-w-lg">
                                <StatTile icon={<BookIcon className="h-5 w-5" />} label="Chapters" value={String(chapters.length).padStart(2, '0')} />
                                <StatTile icon={<PagesIcon className="h-5 w-5" />} label="Pages" value={String(book.total_pages).padStart(2, '0')} />
                                <StatTile
                                    icon={<BookmarkIcon className="h-5 w-5" />}
                                    label="Status"
                                    value={<span className="capitalize">{book.status}</span>}
                                />
                            </div>

                            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:justify-end">
                                {!hasAccess && (
                                    <div className="flex items-center gap-3 rounded-2xl border border-gold-500/25 bg-gold-500/5 px-4 py-2.5">
                                        <div>
                                            <p className="font-display text-xl font-bold leading-none theme-heading">
                                                ₹{book.price}
                                            </p>
                                            <p className="mt-0.5 text-[0.65rem] leading-tight theme-muted">
                                                {book.access_months} months · {freeCount} free
                                            </p>
                                        </div>
                                        {unlockHref && (
                                            <Link
                                                href={unlockHref}
                                                className="whitespace-nowrap rounded-full border border-gold-500/50 px-3 py-1.5 text-xs font-semibold theme-accent transition hover:bg-gold-500/10"
                                            >
                                                Unlock
                                            </Link>
                                        )}
                                    </div>
                                )}

                                {readHref && (
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Link
                                            href={readHref}
                                            className="btn-brand flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold"
                                        >
                                            <BookIcon className="h-4 w-4" />
                                            {hasAccess
                                                ? 'Continue Reading'
                                                : firstReadable.locked
                                                  ? 'Unlock to read'
                                                  : `Read chapter ${firstReadable.number} free`}
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* ── Chapters ────────────────────────────────────────── */}
                <Reveal>
                    <section>
                        <SectionHead
                            icon={<BookIcon className="h-4 w-4" />}
                            title="Chapters"
                            action={
                                readHref && (
                                    <Link
                                        href={readHref}
                                        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider theme-accent transition hover:opacity-70"
                                    >
                                        Start reading <ChevronIcon className="h-3.5 w-3.5" />
                                    </Link>
                                )
                            }
                        />

                        <Stagger className="overflow-hidden rounded-3xl border theme-border theme-card" gap={0.04}>
                            {chapters.map((c, i) => {
                                const href = chapterHref(c);
                                const Row = href ? Link : 'div';

                                return (
                                <StaggerItem key={c.id}>
                                    <Row
                                        {...(href ? { href } : {})}
                                        className={`group flex items-center gap-4 px-4 py-3 transition sm:px-5 ${
                                            href ? 'hover:bg-gold-500/5' : 'cursor-default opacity-70'
                                        } ${i > 0 ? 'border-t theme-border' : ''}`}
                                    >
                                        {/* chapter thumbnail */}
                                        <div className="on-dark relative h-16 w-24 flex-none overflow-hidden rounded-xl ring-1 ring-black/10">
                                            {c.image ? (
                                                <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                                            ) : (
                                                <BookCover book={book} variant="minimal" />
                                            )}
                                            {c.locked && (
                                                <span className="absolute inset-0 grid place-items-center bg-black/50 text-white">
                                                    <LockIcon className="h-4 w-4" />
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold theme-heading">Chapter {c.number}</p>
                                            <p className="truncate text-sm theme-muted">{c.title}</p>
                                            <p className="mt-0.5 flex items-center gap-1 text-xs theme-muted">
                                                <ClockIcon className="h-3 w-3" />
                                                {c.read_minutes} min read
                                                {c.is_free && !c.locked && (
                                                    <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.6rem] font-semibold text-emerald-500">
                                                        FREE
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        <span className="hidden flex-none rounded-full border border-gold-500/40 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wider theme-accent transition group-hover:bg-gold-500/10 sm:inline-block">
                                            {c.locked ? 'Locked' : 'Read'}
                                        </span>
                                        {href && (
                                            <ChevronIcon className="h-4 w-4 flex-none theme-muted transition group-hover:translate-x-0.5" />
                                        )}
                                    </Row>
                                </StaggerItem>
                                );
                            })}
                        </Stagger>
                    </section>
                </Reveal>

                {/* ── You may also like ───────────────────────────────── */}
                {related.length > 0 && (
                    <Reveal>
                        <section>
                            <SectionHead
                                icon={<Star className="h-4 w-4 fill-current" strokeWidth={0} />}
                                title="You may also like"
                                action={
                                    <Link
                                        href={route('library')}
                                        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider theme-accent transition hover:opacity-70"
                                    >
                                        View all <ChevronIcon className="h-3.5 w-3.5" />
                                    </Link>
                                }
                            />

                            <Stagger className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5" gap={0.05}>
                                {related.map((b) => (
                                    <StaggerItem key={b.id}>
                                        <Link href={route('books.show', b.slug)} className="group block w-32 sm:w-auto">
                                            <div className="on-dark aspect-[2/3] overflow-hidden rounded-2xl ring-1 ring-black/10 transition group-hover:ring-gold-500/40">
                                                <BookCover book={b} className="transition duration-500 group-hover:scale-105" />
                                            </div>
                                            <p className="mt-2 truncate text-sm font-semibold theme-heading transition group-hover:text-gold-400">
                                                {b.title}
                                            </p>
                                            {b.author && <p className="truncate text-xs theme-muted">{b.author}</p>}
                                        </Link>
                                    </StaggerItem>
                                ))}
                            </Stagger>
                        </section>
                    </Reveal>
                )}
            </div>
        </StoreLayout>
    );
}
