import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import BookCover from './BookCover';

export default function HeroSlider({ slides = [] }) {
    const [i, setI] = useState(0);
    const [dir, setDir] = useState(1);
    const count = slides.length;

    const go = (n) => {
        setDir(n > i || (i === count - 1 && n === 0) ? 1 : -1);
        setI((n + count) % count);
    };

    useEffect(() => {
        if (count <= 1) return;
        const t = setInterval(() => {
            setDir(1);
            setI((p) => (p + 1) % count);
        }, 5000);
        return () => clearInterval(t);
    }, [count]);

    if (!count) return null;
    const book = slides[i];

    return (
        <section className="relative overflow-hidden border-b border-white/5 bg-ink-950">
            {/* animated aurora background */}
            <motion.div
                className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl"
                animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"
                animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
                {/* Text */}
                <div className="min-h-[16rem]">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 inline-block rounded-full border border-gold-500/30 bg-gold-500/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-gold-400"
                    >
                        Featured Story
                    </motion.p>
                    <AnimatePresence mode="wait" custom={dir}>
                        <motion.div
                            key={book.id}
                            custom={dir}
                            initial={{ opacity: 0, x: dir * 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: dir * -40 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <h1 className="font-display text-4xl font-bold leading-tight text-slate-50 sm:text-5xl">
                                {book.title}
                            </h1>
                            {book.subtitle && <p className="mt-2 text-lg text-gold-200">{book.subtitle}</p>}
                            {book.tagline && (
                                <p className="mt-4 max-w-md italic text-slate-300">“{book.tagline}”</p>
                            )}
                            {book.author && <p className="mt-3 text-sm text-slate-400">By {book.author}</p>}
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href={route('books.show', book.slug)} className="inline-block rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 shadow-gold transition hover:bg-gold-400">
                                Start Reading
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href={route('library')} className="inline-block rounded-full border border-gold-500/40 px-6 py-2.5 text-sm font-semibold text-gold-300 transition hover:bg-gold-500/10">
                                Browse Library
                            </Link>
                        </motion.div>
                    </div>

                    {/* dots */}
                    <div className="mt-8 flex gap-2">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => go(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === i ? 'w-8 bg-gold-400' : 'w-2 bg-white/20 hover:bg-white/40'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Cover */}
                <div className="relative mx-auto flex h-80 w-full max-w-sm items-center justify-center">
                    <AnimatePresence mode="popLayout" custom={dir}>
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, rotateY: 40, x: dir * 80, scale: 0.85 }}
                            animate={{ opacity: 1, rotateY: 0, x: 0, scale: 1 }}
                            exit={{ opacity: 0, rotateY: -40, x: dir * -80, scale: 0.85 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute w-52 sm:w-60"
                            style={{ perspective: 1000 }}
                        >
                            <motion.div
                                animate={{ y: [0, -12, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <Link href={route('books.show', book.slug)}>
                                    <div className="aspect-[2/3] overflow-hidden rounded-2xl shadow-gold ring-1 ring-gold-500/30">
                                        <BookCover book={book} />
                                    </div>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
