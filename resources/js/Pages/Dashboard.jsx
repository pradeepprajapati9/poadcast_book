import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AccountLayout from '@/Layouts/AccountLayout';
import BookCover from '@/Components/store/BookCover';
import { Stagger, StaggerItem } from '@/Components/motion/Reveal';
import { ArrowRight } from 'lucide-react';

function StatCard({ label, value, accent = 'theme-accent' }) {
    return (
        <div className="rounded-2xl border theme-border theme-card p-4">
            <p className={`font-display text-2xl font-bold sm:text-3xl ${accent}`}>{value}</p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-widest theme-muted sm:text-xs">{label}</p>
        </div>
    );
}

export default function Dashboard({ library }) {
    const active = library.filter((b) => b.active);
    const expiringSoon = active.filter((b) => b.days_left <= 14).length;

    return (
        <AccountLayout active="library" title="My Books" subtitle="Your unlocked books in one place.">
            <Head title="My Account — StoryVerse" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <StatCard label="Total Books" value={library.length} />
                <StatCard label="Active" value={active.length} accent="text-emerald-500" />
                <StatCard label="Expiring ≤14d" value={expiringSoon} accent="text-rose-500" />
            </div>

            {/* Continue Reading */}
            {active.length > 0 && (
                <div className="mt-8">
                    <h2 className="mb-3 font-semibold theme-heading">Continue Reading</h2>
                    <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
                        {active.map((book) => (
                            <Link key={book.id} href={route('reader', [book.slug, 1])} className="group w-32 flex-none sm:w-40">
                                <motion.div whileHover={{ y: -5 }} className="overflow-hidden rounded-xl border theme-border theme-card">
                                    <div className="on-dark aspect-[2/3] overflow-hidden">
                                        <BookCover book={book} className="transition duration-500 group-hover:scale-110" />
                                    </div>
                                    <div className="p-2.5">
                                        <p className="truncate text-sm font-medium theme-heading group-hover:text-gold-400">{book.title}</p>
                                        <p className="mt-0.5 text-[0.7rem] text-emerald-500">{book.days_left} days left</p>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* All books */}
            <div className="mt-8">
                <h2 className="mb-3 font-semibold theme-heading">All Books</h2>

                {library.length ? (
                    <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2" gap={0.06}>
                        {library.map((book) => (
                            <StaggerItem key={book.id}>
                                <div className="flex gap-4 rounded-2xl border theme-border theme-card p-4">
                                    <Link href={route('books.show', book.slug)} className="w-20 flex-none">
                                        <div className="on-dark aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-black/10">
                                            <BookCover book={book} variant="minimal" />
                                        </div>
                                    </Link>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <Link href={route('books.show', book.slug)} className="truncate font-semibold theme-heading hover:text-gold-400">
                                            {book.title}
                                        </Link>
                                        <p className="truncate text-xs theme-muted">{book.subtitle}</p>
                                        <p className="mt-1 text-xs theme-muted">{book.chapters_count} chapters</p>

                                        <div className="mt-auto pt-3">
                                            {book.active ? (
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.7rem] text-emerald-600">
                                                        {book.days_left} days left
                                                    </span>
                                                    <Link href={route('reader', [book.slug, 1])} className="text-sm theme-accent hover:opacity-70">
                                                        Continue <ArrowRight className="ml-0.5 inline h-3.5 w-3.5" strokeWidth={2} />
                                                    </Link>
                                                </div>
                                            ) : (
                                                <span className="inline-block rounded-full bg-rose-500/15 px-2 py-0.5 text-[0.7rem] text-rose-600">
                                                    Expired · {book.expires_at}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </Stagger>
                ) : (
                    <div className="rounded-2xl border theme-border theme-card p-10 text-center sm:p-12">
                        <p className="theme-text">You have not unlocked any books yet.</p>
                        <p className="mt-1 text-sm theme-muted">Browse the library to find your next story.</p>
                        <Link
                            href={route('library')}
                            className="mt-5 inline-block rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                        >
                            Browse Library
                        </Link>
                    </div>
                )}
            </div>
        </AccountLayout>
    );
}
