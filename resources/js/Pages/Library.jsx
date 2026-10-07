import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import StoreLayout from '@/Layouts/StoreLayout';
import BookCard from '@/Components/store/BookCard';
import { Stagger, StaggerItem } from '@/Components/motion/Reveal';
import { genreIcon } from '@/lib/genreIcon';
import Seo from '@/Components/Seo';

export default function Library({ books, genres, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const apply = (params) => {
        router.get(route('library'), params, { preserveScroll: true, preserveState: false });
    };

    const submit = (e) => {
        e.preventDefault();
        apply({ ...(search ? { search } : {}), ...(filters.genre ? { genre: filters.genre } : {}) });
    };

    return (
        <StoreLayout>
            <Seo
                title="Library"
                description="Browse the full StoryVerse library — original novels and stories across fantasy, sci-fi, horror, thriller, romance and more. Read online, start free."
                keywords="story library, read novels online, browse web novels, online stories, fantasy, sci-fi, horror, thriller, romance"
            />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
                <h1 className="font-display text-2xl font-bold text-slate-50 sm:text-3xl">Library</h1>
                <p className="mt-1 text-sm text-slate-400 sm:text-base">
                    {books.length} {books.length === 1 ? 'story' : 'stories'} available
                </p>

                {/* Filters */}
                <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:gap-4">
                    <form onSubmit={submit} className="flex gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title or author…"
                            className="w-full max-w-md rounded-full border-white/10 bg-ink-700 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-gold-500 focus:ring-gold-500 sm:px-5"
                        />
                        <button className="flex-none rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-400 sm:px-5">
                            Search
                        </button>
                    </form>

                    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                        <button
                            onClick={() => apply(search ? { search } : {})}
                            className={`flex-none whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition ${
                                !filters.genre
                                    ? 'border-gold-500 bg-gold-500/10 text-gold-300'
                                    : 'border-white/10 bg-ink-800 text-slate-300 hover:text-gold-300'
                            }`}
                        >
                            All
                        </button>
                        {genres.map((g) => {
                            const Icon = genreIcon(g);
                            return (
                                <button
                                    key={g.id}
                                    onClick={() => apply({ ...(search ? { search } : {}), genre: g.slug })}
                                    className={`flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition ${
                                        filters.genre === g.slug
                                            ? 'border-gold-500 bg-gold-500/10 text-gold-300'
                                            : 'border-white/10 bg-ink-800 text-slate-300 hover:text-gold-300'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                                    {g.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid */}
                {books.length ? (
                    <Stagger
                        className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
                        gap={0.06}
                    >
                        {books.map((book) => (
                            <StaggerItem key={book.id}>
                                <BookCard book={book} />
                            </StaggerItem>
                        ))}
                    </Stagger>
                ) : (
                    <div className="mt-16 rounded-2xl border border-white/5 bg-ink-800 p-12 text-center">
                        <p className="text-slate-400">No stories found. Try changing the filters.</p>
                        <Link href={route('library')} className="mt-3 inline-block text-gold-400 hover:text-gold-300">
                            Clear filters
                        </Link>
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
