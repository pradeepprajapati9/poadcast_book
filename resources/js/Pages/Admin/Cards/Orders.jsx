import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/admin/DataTable';

const input =
    'w-full rounded-lg border theme-input px-3 py-2 text-sm focus:border-gold-500 focus:ring-gold-500';

const FILTERS = [
    ['pending', 'Pending'],
    ['paid', 'Paid'],
    ['cancelled', 'Cancelled'],
    ['all', 'All'],
];

export default function Orders({ orders, filters, summary }) {
    const [approving, setApproving] = useState(null);
    const form = useForm({ method: 'cash', reference: '' });

    const startApprove = (o) => {
        setApproving(o);
        form.setData({ method: 'cash', reference: '' });
        form.clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        form.put(route('admin.orders.approve', approving.id), {
            preserveScroll: true,
            onSuccess: () => setApproving(null),
        });
    };

    const cancel = (o) => {
        if (confirm(`Cancel order #${o.id} for ₹${o.amount}?`)) {
            router.put(route('admin.orders.cancel', o.id), {}, { preserveScroll: true });
        }
    };

    const filter = (status) =>
        router.get(route('admin.orders.index'), { status }, { preserveState: true, preserveScroll: true });

    const columns = [
        {
            key: 'user',
            label: 'Reader',
            render: (o) => (
                <div className="min-w-0">
                    <p className="truncate font-medium theme-heading">{o.user || '—'}</p>
                    <p className="truncate text-xs theme-muted">{o.email}</p>
                </div>
            ),
        },
        {
            key: 'card',
            label: 'Card',
            render: (o) => (
                <div className="min-w-0">
                    <p className="font-mono text-xs theme-accent">{o.card || '—'}</p>
                    <p className="text-[0.65rem] capitalize theme-muted">{o.source}</p>
                </div>
            ),
        },
        {
            key: 'plan',
            label: 'Plan',
            render: (o) => (
                <span className="whitespace-nowrap">
                    {o.plan || `${o.months} mo`}
                    <span className="ml-1 text-xs capitalize theme-muted">· {o.kind}</span>
                </span>
            ),
        },
        {
            key: 'amount',
            label: 'Amount',
            align: 'right',
            render: (o) => <span className="font-semibold theme-heading">₹{o.amount}</span>,
        },
        {
            key: 'status',
            label: 'Status',
            render: (o) => {
                const tone = {
                    pending: 'bg-amber-500/15 text-amber-600',
                    paid: 'bg-emerald-500/15 text-emerald-600',
                    cancelled: 'bg-slate-500/15 theme-muted',
                }[o.status];

                return (
                    <div>
                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium capitalize ${tone}`}>
                            {o.status}
                        </span>
                        <p className="mt-0.5 text-[0.65rem] theme-muted">
                            {o.status === 'paid' ? `${o.method} · ${o.paid_at}` : o.placed_on}
                        </p>
                    </div>
                );
            },
        },
    ];

    return (
        <AdminLayout title="Card Orders">
            <Head title="Admin — Card Orders" />

            <p className="mb-4 text-sm theme-muted">
                Readers pick a plan and pay you directly — confirm the money here and the months go
                onto their card. Pending: {summary.pending} · Collected: ₹{summary.revenue}
            </p>

            {/* Confirm-payment modal — centred so it is always in view */}
            <AnimatePresence>
                {approving && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setApproving(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 16, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.97 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-2xl border theme-border theme-card p-5 shadow-xl sm:p-6"
                        >
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-semibold theme-heading">Confirm payment</h2>
                                    <p className="mt-0.5 text-sm theme-muted">
                                        ₹{approving.amount} from {approving.user || 'reader'} · adds {approving.months} months
                                    </p>
                                </div>
                                <button
                                    onClick={() => setApproving(null)}
                                    aria-label="Close"
                                    className="grid h-8 w-8 flex-none place-items-center rounded-lg theme-muted transition hover:bg-gold-500/10 hover:text-gold-400"
                                >
                                    <X className="h-4 w-4" strokeWidth={1.75} />
                                </button>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <label className="block">
                                    <span className="mb-1 block text-sm theme-text">Paid by</span>
                                    <select
                                        value={form.data.method}
                                        onChange={(e) => form.setData('method', e.target.value)}
                                        className={input}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="upi">UPI</option>
                                        <option value="online">Online</option>
                                    </select>
                                </label>

                                <label className="block">
                                    <span className="mb-1 block text-sm theme-text">Reference (optional)</span>
                                    <input
                                        value={form.data.reference}
                                        onChange={(e) => form.setData('reference', e.target.value)}
                                        placeholder="UPI txn id / receipt no."
                                        className={input}
                                    />
                                </label>

                                <div className="flex justify-end gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setApproving(null)}
                                        className="rounded-full border theme-border px-5 py-2.5 text-sm font-semibold theme-text transition hover:border-gold-500/40"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={form.processing}
                                        className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
                                    >
                                        {form.processing ? 'Confirming…' : `Add ${approving.months} months`}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-4 flex gap-1">
                {FILTERS.map(([value, label]) => (
                    <button
                        key={value}
                        onClick={() => filter(value)}
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                            filters.status === value
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
                rows={orders.data}
                paginator={orders}
                empty="No orders here."
                actions={(o) =>
                    o.status === 'pending' ? (
                        <div className="flex justify-end gap-3 text-xs">
                            <button onClick={() => startApprove(o)} className="font-medium text-emerald-600 hover:opacity-70">
                                Confirm payment
                            </button>
                            <button onClick={() => cancel(o)} className="text-rose-500 hover:opacity-70">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <span className="text-xs theme-muted">{o.reference || '—'}</span>
                    )
                }
            />
        </AdminLayout>
    );
}
