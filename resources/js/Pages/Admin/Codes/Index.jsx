import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/admin/DataTable';
import { Copy } from 'lucide-react';

const input =
    'w-full rounded-lg border theme-input px-3 py-2 text-sm focus:border-gold-500 focus:ring-gold-500';

export default function Index({ codes, books, filters, summary }) {
    const filter = (params) => {
        router.get(route('admin.codes.index'), params, { preserveState: true, preserveScroll: true });
    };

    /**
     * A code and its book are one unit, so this wipes the book too. The prompt
     * spells that out — the row only shows a code, so it would otherwise look
     * like a much smaller action than it is.
     */
    const remove = (c) => {
        const msg =
            `Delete "${c.book}"?\n\n` +
            `This removes the book, all of its chapters and their uploaded PDFs, ` +
            `along with code ${c.code}.\n\nThis cannot be undone.`;

        if (confirm(msg)) {
            router.delete(route('admin.codes.destroy', c.id), { preserveScroll: true });
        }
    };

    const copy = (code) => navigator.clipboard?.writeText(code);

    const columns = [
        {
            key: 'code',
            label: 'Code',
            render: (c) => (
                <button
                    onClick={() => copy(c.code)}
                    title="Copy to clipboard"
                    className="font-mono text-xs theme-accent hover:opacity-70"
                >
                    {c.code} <Copy className="ml-1 inline h-3 w-3" strokeWidth={1.75} />
                </button>
            ),
        },
        {
            key: 'book',
            label: 'Book',
            render: (c) =>
                c.book_slug ? (
                    <Link
                        href={route('admin.books.edit', c.book_slug)}
                        title="Open book to change how many codes it has"
                        className="theme-text transition hover:text-gold-400"
                    >
                        {c.book}
                    </Link>
                ) : (
                    c.book
                ),
        },
        {
            key: 'batch',
            label: 'Batch',
            render: (c) => c.batch || <span className="theme-muted">—</span>,
        },
        { key: 'duration_months', label: 'Months', align: 'center' },
    ];

    return (
        <AdminLayout title="Access Codes">
            <Head title="Admin — Access Codes" />

            <p className="mb-4 text-sm theme-muted">
                Every book has exactly one unique code, created with the book and never changed.
                Deleting a code deletes its book. Total: {summary.total}
            </p>

            <div className="mb-4">
                <select
                    value={filters.book || ''}
                    onChange={(e) => filter(e.target.value ? { book: e.target.value } : {})}
                    className={`${input} max-w-[14rem]`}
                >
                    <option value="">All books</option>
                    {books.map((b) => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                </select>
            </div>

            <DataTable
                columns={columns}
                rows={codes.data}
                paginator={codes}
                empty="No codes found for this filter."
                actions={(c) =>
                    c.redeemed ? (
                        <span className="text-xs theme-muted" title="A reader has paid for this access">
                            Locked
                        </span>
                    ) : (
                        <button
                            onClick={() => remove(c)}
                            title="Deletes the book too"
                            className="text-xs text-rose-500 hover:opacity-70"
                        >
                            Delete book
                        </button>
                    )
                }
            />
        </AdminLayout>
    );
}
