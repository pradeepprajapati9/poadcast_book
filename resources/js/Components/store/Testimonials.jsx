import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const FALLBACK = [
    { name: 'Aarav S.', role: 'Reader · Delhi', body: 'I scanned the code from the packet and started reading instantly. Blue Beast kept me hooked all night. Best ₹30 spent.', stars: 5 },
    { name: 'Priya M.', role: 'Reader · Mumbai', body: 'The reading experience feels premium — text size, dark mode, and everything else are excellent. God’s Thought is beautifully written.', stars: 5 },
    { name: 'Rohan K.', role: 'Reader · Pune', body: 'The 7 Ke Baad thriller hooked me immediately. I can read anywhere on my phone without any issues.', stars: 5 },
    { name: 'Sneha T.', role: 'Reader · Jaipur', body: 'An Alien in the Classroom is such a lovely story! Instant access, no hassle at all. Highly recommended.', stars: 5 },
];

export default function Testimonials({ items }) {
    const DATA = items && items.length ? items : FALLBACK;
    const [i, setI] = useState(0);

    useEffect(() => {
        setI(0);
        const t = setInterval(() => setI((p) => (p + 1) % DATA.length), 4500);
        return () => clearInterval(t);
    }, [DATA.length]);

    const t = DATA[i];

    return (
        <div className="relative mx-auto max-w-3xl">
            <div className="relative min-h-[13rem] rounded-3xl border border-white/5 bg-gradient-to-br from-ink-800 to-ink-950 p-8 text-center shadow-xl sm:p-10">
                <span className="pointer-events-none absolute left-6 top-2 font-display text-7xl text-gold-500/20">“</span>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="mb-3 flex justify-center gap-1 text-gold-400">
                            {Array.from({ length: t.stars }).map((_, s) => (
                                <motion.span
                                    key={s}
                                    initial={{ scale: 0, rotate: -30 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.1 + s * 0.06 }}
                                >
                                    <Star className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                                </motion.span>
                            ))}
                        </div>
                        <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-200">{t.body}</p>
                        <div className="mt-5">
                            <p className="font-semibold text-gold-300">{t.name}</p>
                            <p className="text-xs text-slate-500">{t.role}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="mt-5 flex justify-center gap-2">
                {DATA.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setI(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === i ? 'w-8 bg-gold-400' : 'w-2 bg-white/20 hover:bg-white/40'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
