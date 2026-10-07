import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/admin/DataTable';
import FormPanel from '@/Components/admin/FormPanel';
import { Copy } from 'lucide-react';

const input =
    'w-full rounded-lg border theme-input px-3 py-2 text-sm focus:border-gold-500 focus:ring-gold-500';

const FILTERS = [
    ['', 'All'],
    ['unused', 'Unused'],
    ['used', 'Used'],
];

export default function Vouchers({ vouchers, filters, summary }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ quantity: 50, months: 1, batch: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.vouchers.store'), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const filter = (status) =>
        router.get(route('admin.vouchers.index'), status ? { status } : {}, {
            preserveState: true,
            preserveScroll: true,
        });

    const remove = (v) => {
        if (confirm(`Delete voucher ${v.code}?`)) {
            router.delete(route('admin.vouchers.destroy', v.id), { preserveScroll: true });
        }
    };

    const copy = (code) => navigator.clipboard?.writeText(code);

    const columns = [
        {
            key: 'code',
            label: 'Voucher',
            render: (v) => (
                <button
                    onClick={() => copy(v.code)}
                    title="Copy to clipboard"
                    className="font-mono text-xs theme-accent hover:opacity-70"
                >
                    {v.code} <Copy className="ml-1 inline h-3 w-3" strokeWidth={1.75} />
                </button>
            ),
        },
        {
            key: 'months',
            label: 'Adds',
            align: 'center',
            render: (v) => `${v.months} month${v.months > 1 ? 's' : ''}`,
        },
        {
            key: 'batch',
            label: 'Batch',
            render: (v) => v.batch || <span className="theme-muted">—</span>,
        },
        {
            key: 'used',
            label: 'Status',
            render: (v) =>
                v.used ? (
                    <span className="whitespace-nowrap text-xs theme-muted">
                        Used by {v.used_by} · {v.used_at}
                    </span>
                ) : (
                    <span className="whitespace-nowrap rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        Unused
                    </span>
                ),
        },
    ];

    return (
        <AdminLayout
            title="Recharge Vouchers"
            actions={
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="rounded-full bg-gold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                >
                    + Generate Vouchers
                </button>
            }
        >
            <Head title="Admin — Recharge Vouchers" />

            <p className="mb-4 text-sm theme-muted">
                Printed slips that add months to a master card. Each works once.
                Total: {summary.total} · Used: {summary.used}
            </p>

            <FormPanel open={open} title="Generate Vouchers" onClose={() => setOpen(false)}>
                <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[8rem_8rem_1fr_auto] lg:items-end">
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
                        <span className="mb-1 block text-sm theme-text">Months each</span>
                        <input
                            type="number"
                            min="1"
                            max="24"
                            value={form.data.months}
                            onChange={(e) => form.setData('months', e.target.value)}
                            className={input}
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1 block text-sm theme-text">Batch label (optional)</span>
                        <input
                            value={form.data.batch}
                            onChange={(e) => form.setData('batch', e.target.value)}
                            placeholder="e.g. RC-JAN-99"
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
                rows={vouchers.data}
                paginator={vouchers}
                empty="No vouchers yet. Generate a batch to print."
                actions={(v) =>
                    v.used ? (
                        <span className="text-xs theme-muted">Locked</span>
                    ) : (
                        <button onClick={() => remove(v)} className="text-xs text-rose-500 hover:opacity-70">
                            Delete
                        </button>
                    )
                }
            />
        </AdminLayout>
    );
}
