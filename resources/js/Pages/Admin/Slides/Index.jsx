import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/admin/DataTable';

export default function Index({ slides }) {
    const remove = (s) => {
        if (confirm(`Delete slide "${s.title}"?`)) {
            router.delete(route('admin.slides.destroy', s.id), { preserveScroll: true });
        }
    };

    const columns = [
        {
            key: 'title',
            label: 'Slide',
            render: (s) => (
                <div className="flex items-center gap-3">
                    <div className="on-dark h-10 w-16 flex-none overflow-hidden rounded-md bg-ink-800 ring-1 ring-black/10">
                        {s.image && (
                            <img src={s.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-medium theme-heading">{s.title}</p>
                        {s.subtitle && <p className="truncate text-xs theme-muted">{s.subtitle}</p>}
                    </div>
                </div>
            ),
        },
        {
            key: 'eyebrow',
            label: 'Name',
            render: (s) => s.eyebrow || <span className="theme-muted">—</span>,
        },
        {
            key: 'card_image',
            label: 'Card',
            render: (s) => (
                <div className="on-dark h-10 w-8 overflow-hidden rounded bg-ink-800 ring-1 ring-black/10">
                    {s.card_image && <img src={s.card_image} alt="" loading="lazy" className="h-full w-full object-cover" />}
                </div>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (s) =>
                s.is_active ? (
                    <span className="whitespace-nowrap rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        Active
                    </span>
                ) : (
                    <span className="whitespace-nowrap rounded-full bg-slate-500/15 px-2 py-0.5 text-xs font-medium theme-muted">
                        Hidden
                    </span>
                ),
        },
    ];

    return (
        <AdminLayout
            title="Hero Slides"
            actions={
                <Link
                    href={route('admin.slides.create')}
                    className="rounded-full bg-gold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                >
                    + New Slide
                </Link>
            }
        >
            <Head title="Admin — Hero Slides" />

            <p className="mb-4 text-sm theme-muted">
                Homepage hero slider — add as many as you want and manage order and on/off status.
            </p>

            <DataTable
                columns={columns}
                rows={slides.data}
                paginator={slides}
                empty="No slides yet. Featured books keep auto-sliding until you add one."
                actions={(s) => (
                    <div className="flex justify-end gap-3 text-xs">
                        <Link href={route('admin.slides.edit', s.id)} className="theme-accent hover:opacity-70">
                            Edit
                        </Link>
                        <button onClick={() => remove(s)} className="text-rose-500 hover:opacity-70">
                            Delete
                        </button>
                    </div>
                )}
            />
        </AdminLayout>
    );
}
