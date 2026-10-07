import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ChevronDown, Home, Library, Menu, Search, ShieldCheck, User, X } from 'lucide-react';
import BrandLogo from '@/Components/store/BrandLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import { SOCIAL_ICONS } from '@/Components/store/SocialIcons';
import { genreIcon } from '@/lib/genreIcon';

function NavLink({ href, active, children }) {
    return (
        <Link href={href} className="group relative text-sm theme-text transition hover:text-gold-300">
            <span className={active ? 'text-gold-300' : 'theme-text'}>{children}</span>
            <span
                className={`absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-gold-400 transition-all duration-300 ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
            />
        </Link>
    );
}

export default function StoreLayout({ children }) {
    const { auth, flash, nav } = usePage().props;
    const genres = nav?.genres ?? [];
    const currentUrl = usePage().url;
    const [search, setSearch] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [genresOpen, setGenresOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
            const t = setTimeout(() => setToast(null), 4500);
            return () => clearTimeout(t);
        }
    }, [flash?.success]);

    const submitSearch = (e) => {
        e.preventDefault();
        router.get(route('library'), search ? { search } : {}, { preserveState: false });
    };

    const isActive = (path) => currentUrl.startsWith(path);

    const bottomNav = [
        { label: 'Home', icon: Home, href: route('home'), active: currentUrl === '/' },
        { label: 'Library', icon: Library, href: route('library'), active: isActive('/library') },
        {
            label: auth?.user ? 'Account' : 'Log in',
            icon: User,
            href: auth?.user ? route('dashboard') : route('otp.create'),
            active: isActive('/dashboard') || isActive('/profile'),
        },
        { label: 'Menu', icon: Menu, onClick: () => setMobileOpen((o) => !o) },
    ];

    return (
        <div className="min-h-screen pb-[4.75rem] md:pb-0 theme-bg theme-text transition-colors duration-300">
            {/* Header */}
            <motion.header
                className={`sticky top-0 z-40 border-b transition-colors duration-300 theme-surface theme-border ${
                    scrolled ? 'backdrop-blur' : 'backdrop-blur-sm'
                }`}
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <motion.div
                    className="mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6"
                    animate={{ paddingTop: scrolled ? 8 : 14, paddingBottom: scrolled ? 8 : 14 }}
                    transition={{ duration: 0.3 }}
                >
                    <Link href={route('home')} className="flex-none transition-transform hover:scale-105">
                        <BrandLogo />
                    </Link>

                    <nav className="ml-6 hidden items-center gap-6 lg:flex">
                        <NavLink href={route('home')} active={currentUrl === '/'}>Home</NavLink>
                        <NavLink href={route('library')} active={isActive('/library')}>Library</NavLink>

                        {/* Genres megamenu */}
                        <div className="relative" onMouseEnter={() => setGenresOpen(true)} onMouseLeave={() => setGenresOpen(false)}>
                            <button className="group relative flex items-center gap-1 text-sm theme-text transition hover:text-gold-300">
                                Genres
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${genresOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                            </button>
                            <AnimatePresence>
                                {genresOpen && genres.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.18 }}
                                        className="absolute left-1/2 top-full z-50 mt-3 w-[30rem] -translate-x-1/2 rounded-2xl border border-white/10 bg-ink-800/95 p-4 shadow-2xl backdrop-blur"
                                    >
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {genres.map((g) => {
                                                const Icon = genreIcon(g);
                                                return (
                                                    <Link
                                                        key={g.slug}
                                                        href={route('library', { genre: g.slug })}
                                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-ink-700 hover:text-gold-300"
                                                    >
                                                        <Icon className="h-4 w-4 flex-none" strokeWidth={1.75} />
                                                        {g.name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                        <Link href={route('library')} className="mt-2 block rounded-lg bg-ink-700/60 px-3 py-2 text-center text-xs text-gold-300 hover:bg-ink-700">
                                            Browse all stories
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {auth?.user && (
                            <NavLink href={route('dashboard')} active={isActive('/dashboard') || isActive('/profile')}>
                                My Account
                            </NavLink>
                        )}
                    </nav>

                    <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 sm:block">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search stories…"
                            className="w-full rounded-full border theme-input px-4 py-1.5 text-sm theme-text placeholder:text-current transition focus:border-gold-500 focus:ring-gold-500"
                        />
                    </form>

                    <div className="ml-auto flex items-center gap-2 sm:ml-0">
                        <div className="hidden items-center gap-2 sm:flex">
                            <ThemeToggle />
                        </div>
                        <button
                            onClick={() => setMobileOpen((o) => !o)}
                            className="order-last grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-ink-700 text-slate-200 lg:hidden"
                            aria-label="Menu"
                        >
                            {mobileOpen ? <X className="h-4 w-4" strokeWidth={1.75} /> : <Menu className="h-4 w-4" strokeWidth={1.75} />}
                        </button>
                        {auth?.user ? (
                            <>
                                <div className="relative">
                                    <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-gold-500/40">
                                        <span className="grid h-6 w-6 place-items-center rounded-full bg-gold-500 text-xs font-bold text-ink-950">
                                            {auth.user.name.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="hidden max-w-[8rem] truncate sm:inline">{auth.user.name}</span>
                                    </button>
                                    <AnimatePresence>
                                        {menuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                                transition={{ duration: 0.18 }}
                                                className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-ink-800 py-1 shadow-xl"
                                                onMouseLeave={() => setMenuOpen(false)}
                                            >
                                                <Link href={route('dashboard')} className="block px-4 py-2 text-sm theme-text hover:bg-ink-700">My Account</Link>
                                                {auth.user.is_admin && (
                                                    <Link href={route('admin.dashboard')} className="block px-4 py-2 text-sm theme-accent hover:bg-ink-700">Admin Panel</Link>
                                                )}
                                                <Link href={route('logout')} method="post" as="button" className="block w-full px-4 py-2 text-left text-sm text-rose-500 hover:bg-ink-700">Log Out</Link>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <div className="hidden items-center gap-2 sm:flex">
                                <Link href={route('otp.create')} className="rounded-full px-3 py-1.5 text-sm text-slate-300 transition hover:text-gold-300">Log in</Link>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                                    <Link href={route('otp.create')} className="btn-brand inline-block rounded-full px-4 py-1.5 text-sm font-semibold">Get Started</Link>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </motion.div>

            </motion.header>

            {/* Mobile left drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
                        />
                        <motion.aside
                            key="drawer"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
                            className="fixed left-0 top-0 z-50 flex h-full w-[85%] max-w-sm flex-col overflow-y-auto theme-surface lg:hidden"
                        >
                            {/* header with brand glow */}
                            <div className="relative overflow-hidden border-b theme-border">
                                <div className="pointer-events-none absolute inset-0 opacity-70" style={{
                                    background: 'radial-gradient(18rem 8rem at 0% 0%, rgba(124,58,237,0.18), transparent 60%), radial-gradient(16rem 8rem at 100% 0%, rgba(244,63,94,0.12), transparent 60%)',
                                }} />
                                <div className="relative flex items-center justify-between px-4 py-4">
                                    <BrandLogo />
                                    <button onClick={() => setMobileOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-xl border theme-border theme-muted transition hover:border-gold-500/40 hover:text-[color:var(--accent)]"><X className="h-4 w-4" strokeWidth={1.75} /></button>
                                </div>
                            </div>

                            <div className="flex-1 space-y-1.5 p-4">
                                <form onSubmit={(e) => { submitSearch(e); setMobileOpen(false); }} className="mb-4">
                                    <div className="flex items-center gap-2 rounded-full border theme-border theme-card px-3 py-1 shadow-sm focus-within:border-gold-500/50">
                                        <Search className="h-4 w-4 flex-none theme-muted" strokeWidth={2} />
                                        <input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search stories…"
                                            className="w-full min-w-0 bg-transparent py-2 text-sm theme-text placeholder:text-[color:var(--muted)] focus:outline-none"
                                        />
                                    </div>
                                </form>

                                {[
                                    { label: 'Home', icon: Home, href: route('home'), active: currentUrl === '/' },
                                    { label: 'Library', icon: Library, href: route('library'), active: isActive('/library') },
                                    ...(auth?.user ? [{ label: 'My Account', icon: User, href: route('dashboard'), active: isActive('/dashboard') || isActive('/profile') }] : []),
                                ].map((it) => (
                                    <Link
                                        key={it.label}
                                        href={it.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition ${it.active ? 'bg-gold-500/10 text-[color:var(--accent)]' : 'theme-text hover:bg-gold-500/5'}`}
                                    >
                                        <span className={`grid h-9 w-9 flex-none place-items-center rounded-lg ${it.active ? 'bg-brand-grad text-white shadow-gold' : 'bg-gold-500/10 theme-accent'}`}>
                                            <it.icon className="h-4 w-4" strokeWidth={1.75} />
                                        </span>
                                        {it.label}
                                    </Link>
                                ))}

                                {genres.length > 0 && (
                                    <div className="pt-4">
                                        <p className="px-1 pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] theme-accent">Genres</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {genres.map((g) => {
                                                const Icon = genreIcon(g);
                                                return (
                                                    <Link
                                                        key={g.slug}
                                                        href={route('library', { genre: g.slug })}
                                                        onClick={() => setMobileOpen(false)}
                                                        className="inline-flex items-center gap-1.5 rounded-full border theme-border theme-card px-3 py-1.5 text-xs font-medium theme-text shadow-sm transition hover:border-gold-500/40 hover:text-[color:var(--accent)]"
                                                    >
                                                        <Icon className="h-3.5 w-3.5 flex-none theme-accent" strokeWidth={1.75} />{g.name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t theme-border p-4">
                                {auth?.user ? (
                                    <Link href={route('logout')} method="post" as="button" onClick={() => setMobileOpen(false)} className="block w-full rounded-xl border theme-border px-3 py-3 text-center text-sm font-semibold text-rose-500 transition hover:border-rose-400/50 hover:bg-rose-500/5">Log Out</Link>
                                ) : (
                                    <div className="flex gap-2.5">
                                        <Link href={route('otp.create')} onClick={() => setMobileOpen(false)} className="flex-1 rounded-xl border theme-border px-3 py-3 text-center text-sm font-semibold theme-text transition hover:border-gold-500/40">Log in</Link>
                                        <Link href={route('otp.create')} onClick={() => setMobileOpen(false)} className="btn-brand flex-1 rounded-xl px-3 py-3 text-center text-sm font-semibold">Get Started</Link>
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Page content with enter transition */}
            <AnimatePresence mode="wait">
                <motion.main
                    key={currentUrl}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    {children}
                </motion.main>
            </AnimatePresence>

            {/* Footer — premium dark band */}
            <footer className="on-dark relative mt-20 overflow-hidden bg-ink-950 text-slate-300">
                {/* top accent line + brand glow */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />
                <div className="pointer-events-none absolute inset-0" style={{
                    background: 'radial-gradient(40rem 22rem at 15% 0%, rgba(124,58,237,0.22), transparent 60%), radial-gradient(36rem 22rem at 100% 20%, rgba(244,63,94,0.14), transparent 55%)',
                }} />

                <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
                    {/* CTA band */}
                    <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-10 md:flex-row md:items-center">
                        <div>
                            <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                                Start your next story <span className="text-grad">tonight</span>.
                            </h3>
                            <p className="mt-1.5 text-sm text-slate-400">One card. The whole library. Any device.</p>
                        </div>
                        <div className="flex flex-none gap-3">
                            <Link href={route('library')} className="btn-brand inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
                                <Library className="h-4 w-4" strokeWidth={2} /> Explore Library
                            </Link>
                            <Link href={route('otp.create')} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-gold-500/60 hover:text-gold-300">
                                I have a card
                            </Link>
                        </div>
                    </div>

                    {/* columns */}
                    <div className="grid gap-10 md:grid-cols-12">
                        {/* Brand */}
                        <div className="md:col-span-5">
                            <BrandLogo />
                            <p className="mt-4 max-w-sm text-sm text-slate-400">
                                StoryVerse — original serialized novels by Mori Zenro. One code unlocks
                                the full book. Read anytime, on any device.
                            </p>
                            <div className="mt-5 flex gap-2.5">
                                {SOCIAL_ICONS.map((Icon, i) => (
                                    <motion.span
                                        key={i}
                                        whileHover={{ y: -3 }}
                                        className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-gold-500/50 hover:bg-gold-500/10 hover:text-gold-300"
                                    >
                                        <Icon className="h-4 w-4" />
                                    </motion.span>
                                ))}
                            </div>
                        </div>

                        {/* Explore */}
                        <div className="md:col-span-2">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">Explore</h4>
                            <ul className="space-y-2.5 text-sm text-slate-400">
                                <li><Link href={route('home')} className="transition hover:text-gold-300">Home</Link></li>
                                <li><Link href={route('library')} className="transition hover:text-gold-300">Library</Link></li>
                                {auth?.user
                                    ? <li><Link href={route('dashboard')} className="transition hover:text-gold-300">My Account</Link></li>
                                    : <li><Link href={route('otp.create')} className="transition hover:text-gold-300">Log in</Link></li>}
                            </ul>
                        </div>

                        {/* Genres */}
                        <div className="md:col-span-3">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">Genres</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {genres.slice(0, 8).map((g) => (
                                    <Link
                                        key={g.slug}
                                        href={route('library', { genre: g.slug })}
                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 transition hover:border-gold-500/50 hover:bg-gold-500/10 hover:text-gold-300"
                                    >
                                        {g.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Support */}
                        <div className="md:col-span-2">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">Support</h4>
                            <ul className="space-y-2.5 text-sm text-slate-400">
                                <li className="transition hover:text-gold-300">hello@storyverse.in</li>
                                <li className="transition hover:text-gold-300">www.storyverse.in</li>
                                <li className="flex items-center gap-1.5 text-emerald-400"><ShieldCheck className="h-4 w-4" strokeWidth={1.75} /> Secure &amp; Private</li>
                            </ul>
                        </div>
                    </div>

                    {/* bottom bar */}
                    <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
                        <p>© {new Date().getFullYear()} StoryVerse. All rights reserved.</p>
                        <p>Unlock stories. Anytime, anywhere.</p>
                    </div>
                </div>

                {/* oversized brand watermark */}
                <p className="pointer-events-none select-none absolute -bottom-6 left-0 right-0 text-center font-display text-[22vw] font-extrabold leading-none tracking-tighter text-white/[0.03] sm:text-[16vw]">
                    STORYVERSE
                </p>
            </footer>

            {/* Mobile bottom app-nav */}
            <motion.nav
                initial={{ y: 80 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 24 }}
                className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/95 backdrop-blur md:hidden"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="mx-auto flex max-w-md items-end justify-around px-2 py-1.5">
                    {bottomNav.map((item) =>
                        item.onClick ? (
                            <button key={item.label} onClick={item.onClick} className="flex flex-1 flex-col items-center gap-0.5 py-1 text-slate-400">
                                <item.icon className="h-5 w-5" strokeWidth={1.75} />
                                <span className="text-[0.6rem]">{item.label}</span>
                            </button>
                        ) : (
                            <Link key={item.label} href={item.href} className={`flex flex-1 flex-col items-center gap-0.5 py-1 ${item.active ? 'text-gold-300' : 'text-slate-400'}`}>
                                <item.icon className="h-5 w-5" strokeWidth={1.75} />
                                <span className="text-[0.6rem]">{item.label}</span>
                                {item.active && <motion.span layoutId="bnav" className="h-1 w-1 rounded-full bg-gold-400" />}
                            </Link>
                        )
                    )}
                </div>
            </motion.nav>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.9 }}
                        className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-gold-500/40 bg-ink-800 px-5 py-2.5 text-sm text-gold-100 shadow-gold md:bottom-6"
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
