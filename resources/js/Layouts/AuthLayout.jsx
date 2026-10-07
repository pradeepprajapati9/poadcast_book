import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import BrandLogo from '@/Components/store/BrandLogo';
import { BookOpen, ShieldCheck, Unlock } from 'lucide-react';

const PERKS = [
    { icon: Unlock, text: 'Instant access to exclusive stories' },
    { icon: BookOpen, text: 'Read anytime, on any device' },
    { icon: ShieldCheck, text: '100% private & secure' },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
    return (
        <div className="min-h-screen bg-ink-950 lg:grid lg:grid-cols-2">
            {/* Left — animated brand panel */}
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-ink-800 via-ink-900 to-black lg:block">
                <motion.div
                    className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl"
                    animate={{ x: [0, 50, 0], y: [0, 60, 0] }}
                    transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"
                    animate={{ x: [0, -40, 0], y: [0, -40, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* floating decorative books */}
                {[
                    { l: '12%', t: '18%', d: 0, r: -12 },
                    { l: '62%', t: '12%', d: 1, r: 10 },
                    { l: '70%', t: '58%', d: 2, r: -8 },
                ].map((b, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-28 w-20 rounded-lg border border-gold-500/20 bg-gradient-to-br from-ink-700 to-ink-900 shadow-xl"
                        style={{ left: b.l, top: b.t, rotate: b.r }}
                        animate={{ y: [0, -18, 0] }}
                        transition={{ duration: 5 + b.d, repeat: Infinity, ease: 'easeInOut', delay: b.d * 0.5 }}
                    >
                        <BookOpen className="mx-auto mt-2 h-5 w-5 text-gold-500/40" strokeWidth={1.5} />
                    </motion.div>
                ))}

                <div className="relative flex h-full flex-col justify-between p-12">
                    <Link href={route('home')}>
                        <BrandLogo />
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <h2 className="font-display text-4xl font-bold leading-tight text-slate-50">
                            Unlock stories.
                            <br />
                            <span className="text-gold-300">Anytime, anywhere.</span>
                        </h2>
                        <ul className="mt-8 space-y-4">
                            {PERKS.map((p, i) => (
                                <motion.li
                                    key={i}
                                    className="flex items-center gap-3 text-slate-300"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.15 }}
                                >
                                    <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gold-500/10 text-gold-400">
                                        <p.icon className="h-4 w-4" strokeWidth={1.75} />
                                    </span>
                                    {p.text}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    <p className="text-xs text-slate-500">© {new Date().getFullYear()} StoryVerse Digital Library</p>
                </div>
            </div>

            {/* Right — form */}
            <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-sm"
                >
                    <div className="mb-8 lg:hidden">
                        <Link href={route('home')}>
                            <BrandLogo />
                        </Link>
                    </div>

                    <h1 className="font-display text-3xl font-bold text-slate-50">{title}</h1>
                    {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}

                    <div className="mt-8">{children}</div>

                    {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
                </motion.div>
            </div>
        </div>
    );
}

/** Animated floating-label text field for auth forms. */
export function AuthField({ label, error, delay = 0, className = '', ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="mb-4"
        >
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-slate-500">{label}</label>
            <input
                {...props}
                className={`w-full rounded-xl border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-slate-100 transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/40 ${className}`}
            />
            {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
        </motion.div>
    );
}
