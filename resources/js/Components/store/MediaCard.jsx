import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import BookCover from './BookCover';
import { ArrowRight, BookOpen, Star } from 'lucide-react';

/** Structured horizontal media card: cover + info panel. */
export default function MediaCard({ book, isNew = false }) {
    return (
        <Link href={route('books.show', book.slug)} className="group block h-full">
            <motion.div
                whileHover={{ y: -5 }}
                className="flex h-full flex-col gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3 transition hover:border-gold-500/40 hover:shadow-gold sm:flex-row sm:gap-4"
            >
                {/* cover */}
                <div className="relative aspect-[2/3] w-full flex-none overflow-hidden rounded-xl ring-1 ring-black/40 sm:w-24">
                    <BookCover book={book} variant="minimal" className="transition duration-500 group-hover:scale-110" />
                    {isNew && (
                        <span className="absolute left-1.5 top-1.5 rounded-full bg-gold-500 px-2 py-0.5 text-[0.6rem] font-bold text-ink-950">
                            NEW
                        </span>
                    )}
                </div>

                {/* info */}
                <div className="flex min-w-0 flex-1 flex-col py-1">
                    <h3 className="truncate font-semibold text-slate-100 transition group-hover:text-gold-300">{book.title}</h3>
                    {book.subtitle && <p className="truncate text-xs text-slate-400">{book.subtitle}</p>}
                    {book.author && <p className="truncate text-[0.7rem] text-slate-500">By {book.author}</p>}

                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {book.genres?.slice(0, 2).map((g) => (
                            <span key={g.slug} className="rounded-full border border-white/10 bg-ink-700/60 px-2 py-0.5 text-[0.65rem] text-slate-300">
                                {g.name}
                            </span>
                        ))}
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-slate-400">
                        {book.rating > 0 && <span className="flex items-center gap-0.5 text-gold-300"><Star className="h-3 w-3 fill-current" strokeWidth={0} />{Number(book.rating).toFixed(1)}</span>}
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" strokeWidth={1.75} />{book.chapters_count} ch</span>
                        <span className="capitalize">• {book.status}</span>
                        <span className="ml-auto text-gold-400 opacity-0 transition group-hover:opacity-100">Read <ArrowRight className="inline h-3.5 w-3.5" strokeWidth={2} /></span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
