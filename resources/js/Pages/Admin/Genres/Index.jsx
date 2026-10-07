import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/admin/DataTable';
import FormPanel from '@/Components/admin/FormPanel';

const input =
    'w-full rounded-lg border theme-input px-3 py-2 text-sm focus:border-gold-500 focus:ring-gold-500';

export default function Index({ genres }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ name: '', icon: '' });

    const add = (e) => {
        e.preventDefault();
        form.post(route('admin.genres.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    const remove = (g) => {
        if (confirm(`Delete genre "${g.name}"?`)) {
            router.delete(route('admin.genres.destroy', g.id), { preserveScroll: true });
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Genre',
            render: (g) => (
                <span className="font-medium theme-heading">
                    <span className="mr-2">{g.icon}</span>
                    {g.name}
                </span>
            ),
        },
        {
            key: 'slug',
            label: 'Slug',
            render: (g) => <span className="theme-muted">{g.slug}</span>,
        },
        { key: 'books_count', label: 'Books', align: 'center' },
    ];

    return (
        <AdminLayout
            title="Genres"
            actions={
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="rounded-full bg-gold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                >
                    + New Genre
                </button>
            }
        >
            <Head title="Admin — Genres" />

            <FormPanel open={open} title="Add Genre" onClose={() => setOpen(false)}>
                <form onSubmit={add} className="grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
                    <label className="block">
                        <span className="mb-1 block text-sm theme-text">Name *</span>
                        <input
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className={input}
                        />
                        {form.errors.name && <span className="mt-1 block text-xs text-rose-500">{form.errors.name}</span>}
                    </label>

                    <label className="block">
                        <span className="mb-1 block text-sm theme-text">Icon (emoji)</span>
                        <input
                            value={form.data.icon}
                            onChange={(e) => form.setData('icon', e.target.value)}
                            placeholder="Emoji, e.g. fire"
                            className={input}
                        />
                    </label>

                    <button
                        disabled={form.processing}
                        className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
                    >
                        Add Genre
                    </button>
                </form>
            </FormPanel>

            <DataTable
                columns={columns}
                rows={genres.data}
                paginator={genres}
                empty="No genres yet. Add your first one using “New Genre”."
                actions={(g) => (
                    <button onClick={() => remove(g)} className="text-xs text-rose-500 hover:opacity-70">
                        Delete
                    </button>
                )}
            />
        </AdminLayout>
    );
}
