import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BookCover from '@/Components/store/BookCover';
import DataTable from '@/Components/admin/DataTable';
import { Star } from 'lucide-react';

export default function Index({ books }) {
    const remove = (book) => {
        if (confirm(`Delete "${book.title}"? Its chapters will also be deleted.`)) {
            router.delete(route('admin.books.destroy', book.slug), { preserveScroll: true });
        }
    };

    const columns = [
        {
            key: 'title',
            label: 'Book',
            render: (b) => (
                <div className="flex items-center gap-3">
                    <div className="on-dark h-12 w-9 flex-none overflow-hidden rounded ring-1 ring-black/10">
                        <BookCover book={b} variant="minimal" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-medium theme-heading">{b.title}</p>
                        <p className="truncate text-xs theme-muted">{b.author}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'is_published',
            label: 'Status',
            render: (b) => (
                <>
                    <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                            b.is_published ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-500/15 theme-muted'
                        }`}
                    >
                        {b.is_published ? 'Published' : 'Draft'}
                    </span>
                    {b.is_featured && <Star className="ml-1 inline h-3 w-3 fill-current text-gold-500" strokeWidth={0} />}
                </>
            ),
        },
        {
            key: 'chapters_count',
            label: 'Chapters',
            align: 'center',
            render: (b) => (
                <Link href={route('admin.books.chapters.index', b.slug)} className="theme-accent hover:opacity-70">
                    {b.chapters_count}
                </Link>
            ),
        },
        {
            key: 'access_codes_count',
            label: 'Codes',
            align: 'center',
            render: (b) => (
                <Link href={route('admin.codes.index', { book: b.id })} className="theme-accent hover:opacity-70">
                    {b.access_codes_count}
                </Link>
            ),
        },
        {
            key: 'views',
            label: 'Views',
            align: 'right',
            render: (b) => Intl.NumberFormat('en').format(b.views),
        },
    ];

    return (
        <AdminLayout
            title="Books"
            actions={
                <Link
                    href={route('admin.books.create')}
                    className="rounded-full bg-gold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                >
                    + New Book
                </Link>
            }
        >
            <Head title="Admin — Books" />

            <DataTable
                columns={columns}
                rows={books.data}
                paginator={books}
                empty="No books yet. Add one using “New Book”."
                actions={(b) => (
                    <div className="flex justify-end gap-3 text-xs">
                        <Link href={route('admin.books.chapters.index', b.slug)} className="theme-text hover:text-gold-400">
                            Chapters
                        </Link>
                        <Link href={route('admin.books.edit', b.slug)} className="theme-accent hover:opacity-70">
                            Edit
                        </Link>
                        <button onClick={() => remove(b)} className="text-rose-500 hover:opacity-70">
                            Delete
                        </button>
                    </div>
                )}
            />
        </AdminLayout>
    );
}
