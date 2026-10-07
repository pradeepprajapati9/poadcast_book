import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/admin/DataTable';
import FormPanel from '@/Components/admin/FormPanel';

const input =
    'w-full rounded-lg border theme-input px-3 py-2 text-sm focus:border-gold-500 focus:ring-gold-500';

const BLANK = { name: '', months: 3, price: 50, description: '', is_active: true, sort_order: 0 };

export default function Plans({ plans }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const form = useForm(BLANK);

    const startCreate = () => {
        setEditing(null);
        form.setData(BLANK);
        form.clearErrors();
        setOpen(true);
    };

    const startEdit = (p) => {
        setEditing(p);
        form.setData({
            name: p.name,
            months: p.months,
            price: p.price,
            description: p.description || '',
            is_active: p.is_active,
            sort_order: 0,
        });
        form.clearErrors();
        setOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const done = { preserveScroll: true, onSuccess: () => setOpen(false) };

        if (editing) {
            form.put(route('admin.plans.update', editing.id), done);
        } else {
            form.post(route('admin.plans.store'), done);
        }
    };

    const remove = (p) => {
        if (confirm(`Delete plan "${p.name}"?`)) {
            router.delete(route('admin.plans.destroy', p.id), { preserveScroll: true });
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Plan',
            render: (p) => (
                <div className="min-w-0">
                    <p className="font-medium theme-heading">{p.name}</p>
                    {p.description && <p className="truncate text-xs theme-muted">{p.description}</p>}
                </div>
            ),
        },
        {
            key: 'months',
            label: 'Duration',
            align: 'center',
            render: (p) => `${p.months} mo`,
        },
        {
            key: 'price',
            label: 'Price',
            align: 'right',
            render: (p) => (
                <span className="whitespace-nowrap">
                    <span className="font-semibold theme-heading">₹{p.price}</span>
                    <span className="ml-1 text-xs theme-muted">₹{p.per_month}/mo</span>
                </span>
            ),
        },
        { key: 'sold', label: 'Sold', align: 'center' },
        {
            key: 'is_active',
            label: 'Status',
            render: (p) => (
                <span
                    className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.is_active ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-500/15 theme-muted'
                    }`}
                >
                    {p.is_active ? 'Live' : 'Hidden'}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Card Plans"
            actions={
                <button
                    onClick={startCreate}
                    className="rounded-full bg-gold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                >
                    + New Plan
                </button>
            }
        >
            <Head title="Admin — Card Plans" />

            <p className="mb-4 text-sm theme-muted">
                What a master card costs. Readers pick one of these when activating or renewing.
            </p>

            <FormPanel
                open={open}
                title={editing ? `Edit: ${editing.name}` : 'New Plan'}
                onClose={() => setOpen(false)}
            >
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="block">
                            <span className="mb-1 block text-sm theme-text">Name *</span>
                            <input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="3 Months"
                                className={input}
                            />
                            {form.errors.name && <span className="mt-1 block text-xs text-rose-500">{form.errors.name}</span>}
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm theme-text">Months *</span>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={form.data.months}
                                onChange={(e) => form.setData('months', e.target.value)}
                                className={input}
                            />
                            {form.errors.months && <span className="mt-1 block text-xs text-rose-500">{form.errors.months}</span>}
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm theme-text">Price (₹) *</span>
                            <input
                                type="number"
                                min="0"
                                value={form.data.price}
                                onChange={(e) => form.setData('price', e.target.value)}
                                className={input}
                            />
                            {form.errors.price && <span className="mt-1 block text-xs text-rose-500">{form.errors.price}</span>}
                        </label>

                        <label className="flex items-center gap-2 pt-6 text-sm theme-text">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                className="rounded theme-border text-gold-500 focus:ring-gold-500"
                            />
                            Show to readers
                        </label>
                    </div>

                    <label className="block">
                        <span className="mb-1 block text-sm theme-text">Short note (optional)</span>
                        <input
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            placeholder="Best value"
                            className={input}
                        />
                    </label>

                    {form.data.months > 0 && form.data.price > 0 && (
                        <p className="text-xs theme-muted">
                            Works out to ₹{Math.round(form.data.price / form.data.months)} per month.
                        </p>
                    )}

                    <button
                        disabled={form.processing}
                        className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
                    >
                        {editing ? 'Save Plan' : 'Create Plan'}
                    </button>
                </form>
            </FormPanel>

            <DataTable
                columns={columns}
                rows={plans.data}
                paginator={plans}
                empty="No plans yet. Add one so readers can buy a card."
                actions={(p) => (
                    <div className="flex justify-end gap-3 text-xs">
                        <button onClick={() => startEdit(p)} className="theme-accent hover:opacity-70">
                            Edit
                        </button>
                        <button onClick={() => remove(p)} className="text-rose-500 hover:opacity-70">
                            Delete
                        </button>
                    </div>
                )}
            />
        </AdminLayout>
    );
}
