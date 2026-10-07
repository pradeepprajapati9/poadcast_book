import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft } from 'lucide-react';

const input =
    'w-full rounded-lg border theme-input px-3 py-2 text-sm focus:border-gold-500 focus:ring-gold-500';

const fileInput =
    'block w-full text-sm theme-muted file:mr-3 file:rounded file:border-0 file:bg-gold-500 file:px-3 file:py-1.5 file:font-medium file:text-ink-950';

export default function Form({ book, chapter, nextNumber }) {
    const editing = !!chapter;

    const form = useForm({
        number: chapter?.number ?? nextNumber,
        title: chapter?.title || '',
        is_free: chapter?.is_free ?? false,
        published_at: chapter?.published_at ? String(chapter.published_at).slice(0, 10) : '',
        image: null,
        image_url: '',
        pdf: null,
    });

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            form.transform((d) => ({ ...d, _method: 'put' }));
            form.post(route('admin.books.chapters.update', [book.slug, chapter.id]), { forceFormData: true });
        } else {
            form.post(route('admin.books.chapters.store', book.slug), { forceFormData: true });
        }
    };

    return (
        <AdminLayout title={editing ? `Edit Chapter ${chapter.number}` : 'New Chapter'}>
            <Head title={editing ? 'Edit Chapter' : 'New Chapter'} />

            <Link
                href={route('admin.books.chapters.index', book.slug)}
                className="text-sm theme-muted transition hover:text-gold-400"
            >
                <ArrowLeft className="mr-1 inline h-4 w-4" strokeWidth={1.75} />{book.title} chapters
            </Link>

            <form onSubmit={submit} className="mt-4 max-w-3xl space-y-5">
                <div className="rounded-2xl border theme-border theme-card p-5 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-4">
                        <label className="block sm:col-span-1">
                            <span className="mb-1 block text-sm theme-text">Chapter #</span>
                            <input
                                type="number"
                                min="1"
                                value={form.data.number}
                                onChange={(e) => form.setData('number', e.target.value)}
                                className={input}
                            />
                            {form.errors.number && <span className="mt-1 block text-xs text-rose-500">{form.errors.number}</span>}
                        </label>
                        <label className="block sm:col-span-3">
                            <span className="mb-1 block text-sm theme-text">Title *</span>
                            <input
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                className={input}
                            />
                            {form.errors.title && <span className="mt-1 block text-xs text-rose-500">{form.errors.title}</span>}
                        </label>
                    </div>

                    {/* PDF is the chapter body now */}
                    <div className="mt-5 rounded-xl border border-gold-500/25 bg-gold-500/5 p-4">
                        <p className="text-sm font-medium theme-text">
                            Chapter PDF {editing ? '' : '*'}
                        </p>
                        <p className="mb-3 text-xs theme-muted">
                            Readers see this PDF as the chapter. Max 50 MB.
                            {editing && chapter.has_pdf && (
                                <>
                                    {' '}Currently uploaded
                                    {chapter.pdf_pages ? ` · ${chapter.pdf_pages} pages` : ''} —
                                    choosing a new file replaces it.
                                </>
                            )}
                        </p>

                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => form.setData('pdf', e.target.files[0])}
                            className={fileInput}
                        />
                        {form.data.pdf && (
                            <p className="mt-2 text-xs text-emerald-600">Selected: {form.data.pdf.name}</p>
                        )}
                        {form.errors.pdf && <p className="mt-2 text-xs text-rose-500">{form.errors.pdf}</p>}
                        {editing && !chapter.has_pdf && !form.data.pdf && (
                            <p className="mt-2 text-xs text-amber-600">
                                No PDF uploaded yet — readers cannot open this chapter.
                            </p>
                        )}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1 block text-sm theme-text">Chapter thumbnail (upload)</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => form.setData('image', e.target.files[0])}
                                className={fileInput}
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-sm theme-text">…or image URL</span>
                            <input
                                value={form.data.image_url}
                                onChange={(e) => form.setData('image_url', e.target.value)}
                                placeholder="https://…"
                                className={input}
                            />
                        </label>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label className="flex items-center gap-2 text-sm theme-text">
                            <input
                                type="checkbox"
                                checked={form.data.is_free}
                                onChange={(e) => form.setData('is_free', e.target.checked)}
                                className="rounded theme-border text-gold-500 focus:ring-gold-500"
                            />
                            Free preview chapter
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-sm theme-text">Published date</span>
                            <input
                                type="date"
                                value={form.data.published_at}
                                onChange={(e) => form.setData('published_at', e.target.value)}
                                className={input}
                            />
                        </label>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        disabled={form.processing}
                        className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
                    >
                        {form.processing ? 'Uploading…' : editing ? 'Save Chapter' : 'Add Chapter'}
                    </button>
                    <Link
                        href={route('admin.books.chapters.index', book.slug)}
                        className="text-sm theme-muted transition hover:text-gold-400"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
