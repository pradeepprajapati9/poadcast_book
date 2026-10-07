import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowDown, ArrowUp, X } from 'lucide-react';

function Field({ label, error, children, hint }) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm theme-text">{label}</span>
            {children}
            {hint && <span className="mt-1 block text-xs theme-muted">{hint}</span>}
            {error && <span className="mt-1 block text-xs text-rose-500">{error}</span>}
        </label>
    );
}

const input =
    'w-full rounded-lg border theme-input px-3 py-2 text-sm focus:border-gold-500 focus:ring-gold-500';

const fileInput =
    'block w-full text-sm theme-muted file:mr-3 file:rounded file:border-0 file:bg-gold-500 file:px-3 file:py-1.5 file:font-medium file:text-ink-950';

export default function Form({ book, genres, selectedGenres }) {
    const editing = !!book;

    const form = useForm({
        title: book?.title || '',
        subtitle: book?.subtitle || '',
        author: book?.author || '',
        description: book?.description || '',
        status: book?.status || 'ongoing',
        rating: book?.rating ?? 4.5,
        price: book?.price ?? 30,
        access_months: book?.access_months ?? 3,
        is_featured: book?.is_featured ?? false,
        is_published: book?.is_published ?? true,
        genres: selectedGenres || [],
        cover_image: null,
        card_image: null,
        chapter_image: null,
        chapter_pdfs: [],
    });

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(route('admin.books.update', book.slug), { forceFormData: true });
        } else {
            form.post(route('admin.books.store'), { forceFormData: true });
        }
    };

    const toggleGenre = (id) => {
        form.setData(
            'genres',
            form.data.genres.includes(id)
                ? form.data.genres.filter((g) => g !== id)
                : [...form.data.genres, id],
        );
    };

    const pdfs = form.data.chapter_pdfs;
    const startNumber = editing ? book.chapters_count : 0;

    /**
     * Append to the queue instead of replacing it, so the admin can pick files
     * in several goes. Same name + size counts as a duplicate.
     */
    const addPdfs = (e) => {
        const picked = Array.from(e.target.files);
        const key = (f) => `${f.name}:${f.size}`;
        const seen = new Set(pdfs.map(key));

        form.setData('chapter_pdfs', [...pdfs, ...picked.filter((f) => !seen.has(key(f)))]);

        // Clear the input so re-picking the same file still fires onChange.
        e.target.value = '';
    };

    const removePdf = (i) => {
        form.setData('chapter_pdfs', pdfs.filter((_, idx) => idx !== i));
    };

    const move = (i, dir) => {
        const next = [...pdfs];
        const j = i + dir;
        if (j < 0 || j >= next.length) return;
        [next[i], next[j]] = [next[j], next[i]];
        form.setData('chapter_pdfs', next);
    };

    return (
        <AdminLayout title={editing ? `Edit: ${book.title}` : 'New Book'}>
            <Head title={editing ? 'Edit Book' : 'New Book'} />

            <form onSubmit={submit} className="max-w-3xl space-y-5">
                <div className="space-y-5 rounded-2xl border theme-border theme-card p-5 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Title *" error={form.errors.title}>
                            <input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className={input} />
                        </Field>
                        <Field label="Subtitle" error={form.errors.subtitle}>
                            <input value={form.data.subtitle} onChange={(e) => form.setData('subtitle', e.target.value)} className={input} />
                        </Field>
                        <Field label="Author" error={form.errors.author}>
                            <input value={form.data.author} onChange={(e) => form.setData('author', e.target.value)} className={input} />
                        </Field>
                        <Field label="Status">
                            <select value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} className={input}>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </Field>
                    </div>

                    <Field label="Description" error={form.errors.description}>
                        <textarea rows={5} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} className={input} />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="Rating" error={form.errors.rating}>
                            <input type="number" step="0.1" min="0" max="5" value={form.data.rating} onChange={(e) => form.setData('rating', e.target.value)} className={input} />
                        </Field>
                        <Field label="Price (₹)" error={form.errors.price}>
                            <input type="number" min="0" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} className={input} />
                        </Field>
                        <Field label="Access (months)" error={form.errors.access_months}>
                            <input type="number" min="1" value={form.data.access_months} onChange={(e) => form.setData('access_months', e.target.value)} className={input} />
                        </Field>
                    </div>

                    <div>
                        <span className="mb-2 block text-sm theme-text">Genres</span>
                        <div className="flex flex-wrap gap-2">
                            {genres.map((g) => (
                                <button
                                    type="button"
                                    key={g.id}
                                    onClick={() => toggleGenre(g.id)}
                                    className={`rounded-full border px-3 py-1 text-sm transition ${
                                        form.data.genres.includes(g.id)
                                            ? 'border-gold-500 bg-gold-500/10 theme-accent'
                                            : 'theme-border theme-muted hover:border-gold-500/40 hover:text-gold-400'
                                    }`}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Field label="Cover image" error={form.errors.cover_image} hint="Poster shown in the library grid.">
                                <input type="file" accept="image/*" onChange={(e) => form.setData('cover_image', e.target.files[0])} className={fileInput} />
                            </Field>
                            {editing && book.cover_image && !form.data.cover_image && (
                                <p className="mt-1 truncate text-xs theme-muted">Current: {book.cover_image}</p>
                            )}
                        </div>

                        <div>
                            <Field label="Card image" error={form.errors.card_image} hint="Shown in the book-page overview card.">
                                <input type="file" accept="image/*" onChange={(e) => form.setData('card_image', e.target.files[0])} className={fileInput} />
                            </Field>
                            {editing && book.card_image && !form.data.card_image && (
                                <p className="mt-1 truncate text-xs theme-muted">Current: {book.card_image}</p>
                            )}
                        </div>

                        <div>
                            <Field label="Chapter image" error={form.errors.chapter_image} hint="Thumbnail on every chapter row.">
                                <input type="file" accept="image/*" onChange={(e) => form.setData('chapter_image', e.target.files[0])} className={fileInput} />
                            </Field>
                            {editing && book.chapter_image && !form.data.chapter_image && (
                                <p className="mt-1 truncate text-xs theme-muted">Current: {book.chapter_image}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 text-sm theme-text">
                            <input type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} className="rounded theme-border text-gold-500 focus:ring-gold-500" />
                            Published
                        </label>
                        <label className="flex items-center gap-2 text-sm theme-text">
                            <input type="checkbox" checked={form.data.is_featured} onChange={(e) => form.setData('is_featured', e.target.checked)} className="rounded theme-border text-gold-500 focus:ring-gold-500" />
                            Featured on home
                        </label>
                    </div>
                </div>

                {/* Access code — one per book, created with the book */}
                <div className="rounded-2xl border theme-border theme-card p-5 sm:p-6">
                    <h2 className="font-semibold theme-heading">Access Code</h2>
                    {editing ? (
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <code className="rounded-lg border theme-border bg-gold-500/10 px-3 py-1.5 font-mono text-sm theme-accent">
                                {book.access_code || '—'}
                            </code>
                            <span className="text-xs theme-muted">
                                Unlocks this book for {book.access_months} month
                                {book.access_months === 1 ? '' : 's'}. Never changes when you edit the book.
                            </span>
                        </div>
                    ) : (
                        <p className="mt-1 text-xs leading-5 theme-muted">
                            A unique code is generated automatically when the book is created.
                        </p>
                    )}
                </div>

                {/* Chapters — upload as many PDFs as needed */}
                <div className="rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5 sm:p-6">
                    <h2 className="font-semibold theme-heading">Chapters (PDF)</h2>
                    <p className="mb-4 mt-1 text-xs leading-5 theme-muted">
                        Add PDFs one at a time or many at once — each becomes a chapter, in the order listed below.
                        {editing
                            ? ` They are added after the existing ${book.chapters_count} chapter${book.chapters_count === 1 ? '' : 's'}.`
                            : ' The first chapter is set as the free preview.'}
                    </p>

                    <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={addPdfs}
                        className={fileInput}
                    />

                    {pdfs.length > 0 && (
                        <>
                            <div className="mb-2 mt-4 flex items-center justify-between">
                                <p className="text-xs font-medium theme-text">
                                    {pdfs.length} chapter{pdfs.length === 1 ? '' : 's'} queued
                                </p>
                                <button
                                    type="button"
                                    onClick={() => form.setData('chapter_pdfs', [])}
                                    className="text-xs text-rose-500 hover:opacity-70"
                                >
                                    Clear all
                                </button>
                            </div>

                            <ol className="space-y-1.5">
                                {pdfs.map((f, i) => (
                                    <li
                                        key={`${f.name}-${f.size}-${i}`}
                                        className="flex items-center gap-2 rounded-lg border theme-border theme-card px-3 py-2 text-xs"
                                    >
                                        <span className="w-8 flex-none font-medium theme-accent">
                                            #{startNumber + i + 1}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate theme-text">{f.name}</span>
                                        <span className="flex-none theme-muted">{(f.size / 1024 / 1024).toFixed(1)} MB</span>

                                        <span className="flex flex-none items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => move(i, -1)}
                                                disabled={i === 0}
                                                title="Move up"
                                                className="rounded px-1 theme-muted transition hover:text-gold-400 disabled:opacity-25"
                                            >
                                                <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => move(i, 1)}
                                                disabled={i === pdfs.length - 1}
                                                title="Move down"
                                                className="rounded px-1 theme-muted transition hover:text-gold-400 disabled:opacity-25"
                                            >
                                                <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removePdf(i)}
                                                title="Remove"
                                                className="rounded px-1 text-rose-500 transition hover:opacity-70"
                                            >
                                                <X className="h-3.5 w-3.5" strokeWidth={2} />
                                            </button>
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </>
                    )}

                    {Object.keys(form.errors)
                        .filter((k) => k.startsWith('chapter_pdfs'))
                        .map((k) => (
                            <p key={k} className="mt-2 text-xs text-rose-500">{form.errors[k]}</p>
                        ))}
                </div>

                <div className="flex items-center gap-4">
                    <button disabled={form.processing} className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60">
                        {form.processing
                            ? `Uploading… ${form.progress ? `${form.progress.percentage}%` : ''}`
                            : editing
                              ? 'Save Changes'
                              : 'Create Book'}
                    </button>
                    <Link href={route('admin.books.index')} className="text-sm theme-muted transition hover:text-gold-400">
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
