import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/admin/DataTable';
import { ArrowLeft, CheckCircle2, Lock, TriangleAlert } from 'lucide-react';

export default function Index({ book, chapters }) {
    const remove = (c) => {
        if (confirm(`Delete Chapter ${c.number} "${c.title}"?`)) {
            router.delete(route('admin.books.chapters.destroy', [book.slug, c.id]), { preserveScroll: true });
        }
    };

    const columns = [
        {
            key: 'number',
            label: '#',
            className: 'w-12 font-mono theme-accent',
        },
        {
            key: 'title',
            label: 'Title',
            render: (c) => <span className="font-medium theme-heading">{c.title}</span>,
        },
        {
            key: 'has_pdf',
            label: 'PDF',
            render: (c) =>
                c.has_pdf ? (
                    <span className="whitespace-nowrap text-xs text-emerald-600">
                        <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.75} />Uploaded{c.pdf_pages ? ` · ${c.pdf_pages}p` : ''}
                    </span>
                ) : (
                    <span className="whitespace-nowrap text-xs text-amber-600"><TriangleAlert className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.75} />Missing</span>
                ),
        },
        {
            key: 'is_free',
            label: 'Access',
            render: (c) =>
                c.is_free ? (
                    <span className="whitespace-nowrap rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        Free
                    </span>
                ) : (
                    <span className="whitespace-nowrap rounded-full bg-slate-500/15 px-2 py-0.5 text-xs font-medium theme-muted">
                        <Lock className="mr-1 inline h-3 w-3" strokeWidth={1.75} />Locked
                    </span>
                ),
        },
        {
            key: 'published_at',
            label: 'Published',
            render: (c) => c.published_at || <span className="theme-muted">—</span>,
        },
    ];

    return (
        <AdminLayout
            title={`Chapters — ${book.title}`}
            actions={
                <Link
                    href={route('admin.books.chapters.create', book.slug)}
                    className="rounded-full bg-gold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                >
                    + New Chapter
                </Link>
            }
        >
            <Head title={`Chapters — ${book.title}`} />

            <Link
                href={route('admin.books.index')}
                className="mb-4 inline-block text-sm theme-muted transition hover:text-gold-400"
            >
                <ArrowLeft className="mr-1 inline h-4 w-4" strokeWidth={1.75} />Books
            </Link>

            <DataTable
                columns={columns}
                rows={chapters.data}
                paginator={chapters}
                empty="No chapters yet. Add one using “New Chapter”."
                actions={(c) => (
                    <div className="flex justify-end gap-3 text-xs">
                        <Link
                            href={route('admin.books.chapters.edit', [book.slug, c.id])}
                            className="theme-accent hover:opacity-70"
                        >
                            Edit
                        </Link>
                        <button onClick={() => remove(c)} className="text-rose-500 hover:opacity-70">
                            Delete
                        </button>
                    </div>
                )}
            />
        </AdminLayout>
    );
}
