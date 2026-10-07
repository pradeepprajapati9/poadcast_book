import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import StoreLayout from '@/Layouts/StoreLayout';
import Seo from '@/Components/Seo';
import BookCard from '@/Components/store/BookCard';
import BookCover from '@/Components/store/BookCover';
import CinematicSlider from '@/Components/store/CinematicSlider';
import Testimonials from '@/Components/store/Testimonials';
import Reveal, { Stagger, StaggerItem } from '@/Components/motion/Reveal';
import Counter from '@/Components/motion/Counter';
import {
    ArrowRight, BookOpen, Compass, CreditCard, Library, Mail, ScanLine,
    Search, ShieldCheck, Smartphone, Sparkles, Star, Unlock,
} from 'lucide-react';
import { genreIcon } from '@/lib/genreIcon';

const STEPS = [
    { icon: Mail, title: 'Open the packet', desc: 'Your StoryVerse card arrives with a unique code.' },
    { icon: ScanLine, title: 'Scan or enter', desc: 'Scan the QR or type the code on the card.' },
    { icon: Unlock, title: 'Unlock the book', desc: 'The whole book unlocks instantly — every chapter.' },
    { icon: BookOpen, title: 'Read anywhere', desc: 'Continue on any device, anytime you like.' },
];

const FEATURES = [
    { icon: Unlock, title: 'Instant Access', desc: 'One code unlocks the full book — no waiting.' },
    { icon: Library, title: 'Exclusive Stories', desc: 'Original novels you will not find anywhere else.' },
    { icon: ShieldCheck, title: 'Safe & Private', desc: 'Your library is encrypted and yours alone.' },
    { icon: Smartphone, title: 'Any Device', desc: 'Phone, tablet or laptop — your progress follows.' },
];

// Colourful backgrounds for the genre tiles — cycled by index.
const GENRE_GRADS = [
    'from-violet-600 via-purple-600 to-fuchsia-500',
    'from-rose-500 via-pink-500 to-orange-400',
    'from-indigo-600 via-blue-600 to-sky-500',
    'from-emerald-500 via-teal-500 to-cyan-500',
    'from-fuchsia-600 via-purple-600 to-indigo-500',
    'from-amber-500 via-orange-500 to-rose-500',
    'from-cyan-500 via-sky-500 to-blue-600',
    'from-pink-500 via-rose-500 to-red-500',
];

/* ── small building blocks ─────────────────────────────────────────────── */

function SectionHead({ eyebrow, title, subtitle, href, hrefLabel = 'View all' }) {
    return (
        <div className="mb-6 flex items-end justify-between gap-4">
            <Reveal>
                {eyebrow && (
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] theme-accent">
                        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />{eyebrow}
                    </p>
                )}
                <h2 className="font-display text-2xl font-bold theme-heading sm:text-3xl">{title}</h2>
                {subtitle && <p className="mt-1 text-sm theme-muted">{subtitle}</p>}
            </Reveal>
            {href && (
                <Reveal dir="none">
                    <Link href={href} className="group hidden flex-none items-center gap-1 rounded-full border theme-border px-4 py-1.5 text-sm font-medium theme-accent transition hover:border-gold-500/50 sm:inline-flex">
                        {hrefLabel}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                    </Link>
                </Reveal>
            )}
        </div>
    );
}

/** Horizontal, snap-scrolling rail (streaming-app style). */
function Rail({ children }) {
    return (
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 no-scrollbar sm:mx-0 sm:px-0">
            {children}
        </div>
    );
}

/* ── page ──────────────────────────────────────────────────────────────── */

export default function Home({ slides, featured, latest, genres, testimonials }) {
    const [q, setQ] = useState('');

    const spotlight = featured[0] || latest[0] || null;
    const heroSlides = (slides && slides.length
        ? slides
        : (featured.length ? featured : latest).map((b) => ({
            id: 'b' + b.id, title: b.title, bg: b.banner_image || b.cover_image || null,
            cover: b.cover_image || null, href: route('books.show', b.slug),
        }))).slice(0, 8);

    const totalStories = featured.length + latest.length;

    const search = (e) => {
        e.preventDefault();
        router.get(route('library'), q ? { search: q } : {}, { preserveState: false });
    };

    return (
        <StoreLayout>
            <Seo
                description="Read original serialized novels and stories online on StoryVerse — fantasy, sci-fi, horror, thriller, romance and more. Unlock a full book with one card."
                keywords="read novels online, web novels, online stories, serialized fiction, fantasy, sci-fi, horror, thriller, romance, digital library, StoryVerse"
                image={featured[0]?.cover_image || latest[0]?.cover_image}
            />

            {/* ══ HERO — editorial split: pitch + search on the left, spotlight cover on the right ══ */}
            <section className="relative overflow-hidden">
                {/* soft brand glow backdrop */}
                <div className="pointer-events-none absolute inset-0 opacity-70" style={{
                    background: 'radial-gradient(60rem 30rem at 15% -10%, rgba(124,58,237,0.16), transparent 60%), radial-gradient(50rem 30rem at 100% 10%, rgba(244,63,94,0.12), transparent 55%)',
                }} />

                <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-6 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-10">
                    {/* Left — pitch */}
                    <div className="max-w-xl">
                        <span className="inline-flex items-center gap-1.5 rounded-full border theme-border bg-gold-500/5 px-3 py-1 text-xs font-semibold theme-accent">
                            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} /> Premium Digital Library
                        </span>

                        <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.08] tracking-tight theme-heading sm:text-5xl lg:text-6xl">
                            Unlock a universe of <span className="text-grad">stories</span>.
                        </h1>

                        <p className="mt-4 text-base leading-relaxed theme-muted sm:text-lg">
                            Original serialized novels — fantasy, sci-fi, horror and more.
                            Get a StoryVerse card, unlock the full book, and read on any device.
                        </p>

                        {/* Search */}
                        <form onSubmit={search} className="mt-6 flex items-center gap-2 rounded-full border theme-border theme-card p-1.5 shadow-sm focus-within:border-gold-500/50">
                            <Search className="ml-3 h-4 w-4 flex-none theme-muted" strokeWidth={2} />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search a title, author or genre…"
                                className="w-full min-w-0 bg-transparent py-2 text-sm theme-text placeholder:text-[color:var(--muted)] focus:outline-none"
                            />
                            <button type="submit" className="btn-brand flex-none rounded-full px-5 py-2 text-sm font-semibold">Search</button>
                        </form>

                        {/* CTAs */}
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <Link href={route('library')} className="inline-flex items-center gap-2 rounded-full bg-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-gold transition hover:bg-gold-500">
                                <Compass className="h-4 w-4" strokeWidth={2} /> Explore Library
                            </Link>
                            <Link href={route('otp.create')} className="inline-flex items-center gap-2 rounded-full border theme-border px-6 py-3 text-sm font-semibold theme-text transition hover:border-gold-500/50 hover:text-[color:var(--accent)]">
                                <CreditCard className="h-4 w-4" strokeWidth={2} /> I have a card
                            </Link>
                        </div>

                        {/* Trust row */}
                        <div className="mt-8 flex items-center divide-x divide-[color:var(--border)]">
                            {[
                                { v: totalStories, s: '+', label: 'Stories' },
                                { v: 12000, s: '+', label: 'Readers' },
                                { v: 4.8, dec: 1, label: 'Avg rating' },
                            ].map((st) => (
                                <div key={st.label} className="px-5 first:pl-0">
                                    <p className="font-display text-xl font-bold theme-heading sm:text-2xl">
                                        <Counter value={st.v} suffix={st.s || ''} decimals={st.dec || 0} />
                                    </p>
                                    <p className="text-[0.7rem] uppercase tracking-wider theme-muted">{st.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — spotlight cover */}
                    {spotlight && (
                        <Reveal dir="none" className="relative mx-auto w-full max-w-sm lg:max-w-none">
                            <motion.div
                                initial={{ opacity: 0, y: 24, rotate: -1 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="relative"
                            >
                                {/* glow */}
                                <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-grad opacity-20 blur-3xl" />
                                <Link href={route('books.show', spotlight.slug)} className="group block">
                                    <div className="on-dark relative aspect-[3/4] overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-950 shadow-2xl ring-1 ring-black/10 sm:aspect-[4/5]">
                                        {spotlight.cover_image ? (
                                            <>
                                                {/* blurred fill so the FULL poster shows without cropping */}
                                                <img src={spotlight.cover_image} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl" />
                                                <img src={spotlight.cover_image} alt={spotlight.title} className="absolute inset-0 z-[1] h-full w-full object-contain transition duration-700 group-hover:scale-[1.03]" />
                                            </>
                                        ) : (
                                            <BookCover book={spotlight} className="transition duration-700 group-hover:scale-105" />
                                        )}
                                        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/90 via-black/25 to-black/10" />

                                        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                                            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} /> Featured
                                        </span>
                                        {spotlight.rating > 0 && (
                                            <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-gold-300 backdrop-blur">
                                                <Star className="h-3 w-3 fill-current" strokeWidth={0} />{Number(spotlight.rating).toFixed(1)}
                                            </span>
                                        )}

                                        <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                                            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-white/70">Now reading</p>
                                            <h3 className="mt-1 font-display text-2xl font-bold text-white">{spotlight.title}</h3>
                                            {spotlight.author && <p className="text-sm text-white/80">By {spotlight.author}</p>}
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {spotlight.genres?.slice(0, 3).map((g) => (
                                                    <span key={g.slug} className="rounded-full bg-white/15 px-2.5 py-0.5 text-[0.7rem] text-white backdrop-blur">{g.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        </Reveal>
                    )}
                </div>
            </section>

            {/* ══ FEATURED WORLDS — full-width cinematic slider ══ */}
            <section className="mx-auto max-w-7xl px-4 pt-2 sm:px-6">
                <SectionHead eyebrow="Editor's pick" title="Featured Worlds" subtitle="Handpicked stories worth your evening." />
            </section>
            <CinematicSlider slides={heroSlides} />

            {/* ══ LATEST — clean rail ══ */}
            {latest.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
                    <SectionHead eyebrow="Fresh off the press" title="Latest Additions" subtitle="New chapters and new stories — read them first." href={route('library')} />
                    <Rail>
                        {latest.map((book, idx) => (
                            <div key={book.id} className="flex-none snap-start" style={{ width: 'clamp(140px, 42vw, 180px)' }}>
                                <BookCard book={book} index={idx} />
                            </div>
                        ))}
                    </Rail>
                </section>
            )}

            {/* ══ HOW IT WORKS — connected stepper ══ */}
            <section className="border-y theme-border bg-gold-500/[0.03]">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] theme-accent">Simple as it gets</p>
                        <h2 className="font-display text-2xl font-bold theme-heading sm:text-3xl">From card to chapter in seconds</h2>
                        <p className="mt-2 text-sm theme-muted">No account hassle. No subscriptions. Just your card and the story.</p>
                    </div>

                    <div className="relative mt-10">
                        {/* connecting line (desktop) */}
                        <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent lg:block" />
                        {/* mobile → horizontal slider; sm+ → grid stepper */}
                        <Stagger className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                            {STEPS.map((s, idx) => (
                                <StaggerItem key={s.title} className="min-w-[64%] flex-none snap-start sm:min-w-0">
                                    <div className="relative h-full rounded-2xl border theme-border theme-card p-5 text-center shadow-sm sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                                        <div className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-grad text-white shadow-gold">
                                            <s.icon className="h-6 w-6" strokeWidth={1.75} />
                                            <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border-2 border-[color:var(--card)] bg-gold-600 text-[0.65rem] font-bold text-white sm:border-[color:var(--bg)]">{idx + 1}</span>
                                        </div>
                                        <h3 className="mt-4 font-semibold theme-heading">{s.title}</h3>
                                        <p className="mt-1 text-sm theme-muted">{s.desc}</p>
                                    </div>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </div>
            </section>

            {/* ══ BROWSE BY GENRE — colourful tiles ══ */}
            {genres.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
                    <SectionHead eyebrow="Find your vibe" title="Browse by Genre" subtitle="Pick a world and dive straight in." href={route('library')} />
                    <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4" gap={0.05}>
                        {genres.map((g, idx) => {
                            const Icon = genreIcon(g);
                            return (
                                <StaggerItem key={g.id}>
                                    <Link
                                        href={route('library', { genre: g.slug })}
                                        className={`on-dark group relative flex aspect-[5/3] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${GENRE_GRADS[idx % GENRE_GRADS.length]} p-4 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
                                    >
                                        {/* big translucent icon */}
                                        <Icon className="absolute -right-2 -top-2 h-20 w-20 text-white/20 transition duration-500 group-hover:scale-110 group-hover:text-white/30" strokeWidth={1.25} />
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                        {/* shine sweep */}
                                        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                        <span className="relative z-10 font-display text-base font-bold text-white sm:text-lg">{g.name}</span>
                                        <span className="relative z-10 mt-0.5 flex items-center gap-1 text-xs font-medium text-white/80">
                                            Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                                        </span>
                                    </Link>
                                </StaggerItem>
                            );
                        })}
                    </Stagger>
                </section>
            )}

            {/* ══ WHY STORYVERSE ══ */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
                <SectionHead eyebrow="Why readers stay" title="Built for a premium read" />
                <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map((f) => (
                        <StaggerItem key={f.title}>
                            <motion.div whileHover={{ y: -6 }}
                                className="group h-full rounded-2xl border theme-border theme-card p-5 shadow-sm transition hover:border-gold-500/40 hover:shadow-gold sm:p-6">
                                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gold-500/10 theme-accent transition group-hover:scale-110">
                                    <f.icon className="h-5 w-5" strokeWidth={1.75} />
                                </div>
                                <h3 className="font-semibold theme-heading">{f.title}</h3>
                                <p className="mt-1 text-sm theme-muted">{f.desc}</p>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </Stagger>
            </section>

            {/* ══ TESTIMONIALS ══ */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
                <SectionHead eyebrow="Loved by readers" title="What readers say" />
                <Testimonials items={testimonials} />
            </section>

            {/* ══ CTA ══ */}
            <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20">
                <Reveal>
                    <div className="relative isolate overflow-hidden rounded-[2rem] p-8 text-center sm:p-16">
                        <div className="absolute inset-0 -z-10 bg-brand-grad" />
                        <div className="absolute inset-0 -z-10 opacity-25" style={{
                            background: 'radial-gradient(30rem 20rem at 20% 20%, rgba(255,255,255,0.4), transparent 60%)',
                        }} />
                        <h2 className="font-display text-2xl font-bold text-white sm:text-4xl">Ready to unlock your story?</h2>
                        <p className="mx-auto mt-3 max-w-lg text-sm text-white/85 sm:text-base">
                            Explore the full library and start reading — free previews on every story.
                        </p>
                        <div className="mt-7 flex flex-wrap justify-center gap-3">
                            <Link href={route('library')} className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-gold-700 shadow-lg transition hover:scale-[1.03]">
                                <Compass className="h-4 w-4" strokeWidth={2} /> Explore Library
                            </Link>
                            <Link href={route('otp.create')} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                                Redeem a card <ArrowRight className="h-4 w-4" strokeWidth={2} />
                            </Link>
                        </div>
                    </div>
                </Reveal>
            </section>
        </StoreLayout>
    );
}
