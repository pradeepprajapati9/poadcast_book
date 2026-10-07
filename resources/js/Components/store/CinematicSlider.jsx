import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function bg(slide) {
    return slide.bg || slide.cover || `https://picsum.photos/seed/sv-${slide.id}/1600/900`;
}

/**
 * Pure-image banner slider.
 *
 * The banner artwork is uploaded fully designed — its own colours and text are
 * baked in — so it is shown exactly as-is: whole image, no gradient overlay, no
 * text or buttons on top. The only chrome is navigation (dots + arrows), and the
 * whole slide is a link.
 */
export default function CinematicSlider({ slides = [] }) {
    const [i, setI] = useState(0);
    const count = slides.length;

    const go = (n) => setI((n + count) % count);
    const next = () => setI((p) => (p + 1) % count);
    const prev = () => setI((p) => (p - 1 + count) % count);

    useEffect(() => {
        if (count <= 1) return;
        const t = setInterval(() => setI((p) => (p + 1) % count), 5500);
        return () => clearInterval(t);
    }, [count]);

    if (!count) return null;
    const s = slides[i];

    const image = (
        <img
            src={bg(s)}
            alt={s.title || 'Featured'}
            className="block aspect-square w-full object-cover object-center md:aspect-auto md:h-[52vh]"
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchpriority={i === 0 ? 'high' : 'auto'}
        />
    );

    return (
        <section className="relative mx-2 overflow-hidden rounded-2xl sm:mx-4 sm:rounded-3xl">
            <AnimatePresence mode="wait">
                <motion.div
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {s.href ? (
                        <Link href={s.href}>{image}</Link>
                    ) : (
                        image
                    )}
                </motion.div>
            </AnimatePresence>

            {count > 1 && (
                <>
                    {/* Dots */}
                    <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 sm:bottom-4">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => go(idx)}
                                aria-label={`Slide ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === i ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Arrows */}
                    <button
                        onClick={prev}
                        aria-label="Previous"
                        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60 sm:block"
                    >
                        ‹
                    </button>
                    <button
                        onClick={next}
                        aria-label="Next"
                        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60 sm:block"
                    >
                        ›
                    </button>
                </>
            )}
        </section>
    );
}
