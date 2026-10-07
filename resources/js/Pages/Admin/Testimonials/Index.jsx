import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/admin/DataTable';
import FormPanel from '@/Components/admin/FormPanel';
import { Star } from 'lucide-react';

const input =
    'w-full rounded-lg border theme-input px-3 py-2 text-sm focus:border-gold-500 focus:ring-gold-500';

export default function Index({ testimonials }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ name: '', role: '', body: '', stars: 5, sort_order: 0, is_active: true });

    const add = (e) => {
        e.preventDefault();
        form.post(route('admin.testimonials.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    const remove = (t) => {
        if (confirm(`Delete the review from "${t.name}"?`)) {
            router.delete(route('admin.testimonials.destroy', t.id), { preserveScroll: true });
        }
    };

    const toggle = (t) => {
        router.put(
            route('admin.testimonials.update', t.id),
            { ...t, is_active: !t.is_active },
            { preserveScroll: true },
        );
    };

    const columns = [
        {
            key: 'name',
            label: 'Reviewer',
            render: (t) => (
                <div className="min-w-0">
                    <p className="truncate font-medium theme-heading">{t.name}</p>
                    {t.role && <p className="truncate text-xs theme-muted">{t.role}</p>}
                </div>
            ),
        },
        {
            key: 'stars',
            label: 'Rating',
            render: (t) => (
                <span className="flex whitespace-nowrap text-gold-500">
                    {Array.from({ length: t.stars }, (_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                    ))}
                </span>
            ),
        },
        {
            key: 'body',
            label: 'Review',
            className: 'max-w-md',
            render: (t) => <p className="line-clamp-2 text-sm theme-text">{t.body}</p>,
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (t) => (
                <button
                    onClick={() => toggle(t)}
                    title="Click to toggle"
                    className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium transition hover:opacity-70 ${
                        t.is_active ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-500/15 theme-muted'
                    }`}
                >
                    {t.is_active ? 'Active' : 'Hidden'}
                </button>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Testimonials"
            actions={
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="rounded-full bg-gold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                >
                    + New Testimonial
                </button>
            }
        >
            <Head title="Admin — Testimonials" />

            <FormPanel open={open} title="Add Testimonial" onClose={() => setOpen(false)}>
                <form onSubmit={add} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
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
                            <span className="mb-1 block text-sm theme-text">Role / City</span>
                            <input
                                value={form.data.role}
                                onChange={(e) => form.setData('role', e.target.value)}
                                placeholder="Reader · Delhi"
                                className={input}
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm theme-text">Stars</span>
                            <select
                                value={form.data.stars}
                                onChange={(e) => form.setData('stars', e.target.value)}
                                className={input}
                            >
                                {[5, 4, 3, 2, 1].map((s) => (
                                    <option key={s} value={s}>{s} star{s > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="block">
                        <span className="mb-1 block text-sm theme-text">Review *</span>
                        <textarea
                            rows={3}
                            value={form.data.body}
                            onChange={(e) => form.setData('body', e.target.value)}
                            className={input}
                        />
                        {form.errors.body && <span className="mt-1 block text-xs text-rose-500">{form.errors.body}</span>}
                    </label>

                    <button
                        disabled={form.processing}
                        className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
                    >
                        Add Testimonial
                    </button>
                </form>
            </FormPanel>

            <DataTable
                columns={columns}
                rows={testimonials.data}
                paginator={testimonials}
                empty="No testimonials yet. Add one using “New Testimonial”."
                actions={(t) => (
                    <button onClick={() => remove(t)} className="text-xs text-rose-500 hover:opacity-70">
                        Delete
                    </button>
                )}
            />
        </AdminLayout>
    );
}
