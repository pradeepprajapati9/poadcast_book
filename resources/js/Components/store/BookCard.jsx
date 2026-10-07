import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import BookCover from './BookCover';
import { ArrowRight, Star } from 'lucide-react';

export default function BookCard({ book, index = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: (index % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
            <Link href={route('books.show', book.slug)} className="group block">
                <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="on-dark relative aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-ink-800 shadow-lg ring-1 ring-black/40 transition-shadow duration-300 group-hover:shadow-gold group-hover:ring-gold-500/40"
                >
                    <BookCover book={book} className="transition duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    {/* shine sweep on hover */}
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                    {book.rating > 0 && (
                        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[0.65rem] font-medium text-gold-300 backdrop-blur">
                            <Star className="mr-0.5 inline h-3 w-3 fill-current" strokeWidth={0} />{Number(book.rating).toFixed(1)}
                        </span>
                    )}
                    {book.status && (
                        <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-slate-300 backdrop-blur">
                            {book.status}
                        </span>
                    )}

                    {/* slide-up read hint */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
                        <span className="block rounded-full bg-gold-500 py-1.5 text-center text-xs font-semibold text-ink-950">
                            Read Now <ArrowRight className="ml-1 inline h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                    </div>
                </motion.div>
                <h3 className="mt-2 truncate text-sm font-semibold text-slate-100 transition group-hover:text-gold-300">
                    {book.title}
                </h3>
                {book.subtitle && <p className="truncate text-xs text-slate-400">{book.subtitle}</p>}
            </Link>
        </motion.div>
    );
}
