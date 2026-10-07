import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/admin/DataTable';
import FormPanel from '@/Components/admin/FormPanel';

const input =
    'w-full rounded-lg border theme-input px-3 py-2 text-sm focus:border-gold-500 focus:ring-gold-500';

const FILTERS = [
    ['', 'All'],
    ['active', 'Active'],
    ['expired', 'Expired'],
    ['unclaimed', 'Unclaimed'],
];

export default function Index({ cards, filters, summary }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ quantity: 50, device_limit: 3, batch: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.cards.store'), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const filter = (status) =>
        router.get(route('admin.cards.index'), status ? { status } : {}, {
            preserveState: true,
            preserveScroll: true,
        });

    const toggle = (c) =>
        router.put(route('admin.cards.toggle', c.id), {}, { preserveScroll: true });

    const resetDevices = (c) => {
        if (confirm(`Clear all devices for ${c.code}? The reader can then sign in on a new phone.`)) {
            router.put(route('admin.cards.reset', c.id), {}, { preserveScroll: true });
        }
    };

    const remove = (c) => {
        if (confirm(`Delete card ${c.code}?`)) {
            router.delete(route('admin.cards.destroy', c.id), { preserveScroll: true });
        }
    };

    const columns = [
        {
            key: 'code',
            label: 'Card',
            render: (c) => (
                <div className="min-w-0">
                    <p className="font-mono text-xs theme-accent">{c.code}</p>
                    <p className="text-[0.65rem] theme-muted">
                        <span className="capitalize">{c.source}</span>
                        {c.batch && ` · ${c.batch}`}
                    </p>
                </div>
            ),
        },
        {
            key: 'holder',
            label: 'Holder',
            render: (c) =>
                c.holder ? (
                    <div className="min-w-0">
                        <p className="truncate theme-text">{c.holder}</p>
                        <p className="truncate text-xs theme-muted">{c.holder_email}</p>
                    </div>
                ) : (
                    <span className="theme-muted">Unclaimed</span>
                ),
        },
        {
            key: 'active',
            label: 'Validity',
            render: (c) =>
                !c.is_active ? (
                    <span className="whitespace-nowrap rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-600">
                        Blocked
                    </span>
                ) : c.active ? (
                    <span className="whitespace-nowrap text-xs text-emerald-600">
                        {c.days_left} days left · {c.expires_at}
                    </span>
                ) : (
                    <span className="whitespace-nowrap rounded-full bg-slate-500/15 px-2 py-0.5 text-xs font-medium theme-muted">
                        {c.expires_at ? 'Expired' : 'Not recharged'}
                    </span>
                ),
        },
        {
            key: 'devices',
            label: 'Devices',
            align: 'center',
            render: (c) => (
                <span className={c.devices >= c.device_limit ? 'text-amber-600' : 'theme-muted'}>
                    {c.devices}/{c.device_limit}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Master Cards"
            actions={
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="rounded-full bg-gold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                >
                    + Generate Cards
                </button>
            }
        >
            <Head title="Admin — Master Cards" />

            <p className="mb-4 text-sm theme-muted">
                A master card unlocks every book while it is in date — recharge it with a voucher.
                Total: {summary.total} · Active: {summary.active} · Unclaimed: {summary.unclaimed}
            </p>

            <FormPanel open={open} title="Generate Cards" onClose={() => setOpen(false)}>
                <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[8rem_10rem_1fr_auto] lg:items-end">
                    <label className="block">
                        <span className="mb-1 block text-sm theme-text">Quantity</span>
                        <input
                            type="number"
                            min="1"
                            max="500"
                            value={form.data.quantity}
                            onChange={(e) => form.setData('quantity', e.target.value)}
                            className={input}
                        />
                        {form.errors.quantity && <span className="mt-1 block text-xs text-rose-500">{form.errors.quantity}</span>}
                    </label>

                    <label className="block">
                        <span className="mb-1 block text-sm theme-text">Device limit</span>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={form.data.device_limit}
                            onChange={(e) => form.setData('device_limit', e.target.value)}
                            className={input}
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1 block text-sm theme-text">Batch label (optional)</span>
                        <input
                            value={form.data.batch}
                            onChange={(e) => form.setData('batch', e.target.value)}
                            placeholder="e.g. CARD-JAN"
                            className={input}
                        />
                    </label>

                    <button
                        disabled={form.processing}
                        className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
                    >
                        Generate
                    </button>
                </form>
            </FormPanel>

            <div className="mb-4 flex gap-1">
                {FILTERS.map(([value, label]) => (
                    <button
                        key={value || 'all'}
                        onClick={() => filter(value)}
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                            (filters.status || '') === value
                                ? 'border-gold-500 bg-gold-500/10 theme-accent'
                                : 'theme-border theme-muted hover:border-gold-500/40 hover:text-gold-400'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                rows={cards.data}
                paginator={cards}
                empty="No cards yet. Generate a batch to print."
                actions={(c) => (
                    <div className="flex justify-end gap-3 text-xs">
                        <a
                            href={route('admin.cards.qr', c.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-text hover:text-gold-400"
                        >
                            QR
                        </a>
                        <button onClick={() => toggle(c)} className="theme-accent hover:opacity-70">
                            {c.is_active ? 'Block' : 'Unblock'}
                        </button>
                        {c.devices > 0 && (
                            <button onClick={() => resetDevices(c)} className="theme-text hover:text-gold-400">
                                Reset devices
                            </button>
                        )}
                        {!c.active && (
                            <button onClick={() => remove(c)} className="text-rose-500 hover:opacity-70">
                                Delete
                            </button>
                        )}
                    </div>
                )}
            />
        </AdminLayout>
    );
}
