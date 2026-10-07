import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/admin/DataTable';
import { Search, ShieldCheck } from 'lucide-react';

const input =
    'w-full rounded-lg border theme-input px-3 py-2 text-sm focus:border-gold-500 focus:ring-gold-500';

const FILTERS = [
    ['', 'All'],
    ['readers', 'Readers'],
    ['card', 'Card holders'],
    ['admin', 'Admins'],
];

export default function Index({ users, filters, summary }) {
    const [search, setSearch] = useState(filters.search || '');

    const go = (params) =>
        router.get(route('admin.users.index'), params, { preserveState: true, preserveScroll: true });

    const submitSearch = (e) => {
        e.preventDefault();
        go({ ...(search ? { search } : {}), ...(filters.filter ? { filter: filters.filter } : {}) });
    };

    const setFilter = (filter) =>
        go({ ...(search ? { search } : {}), ...(filter ? { filter } : {}) });

    const toggleAdmin = (u) => {
        const msg = u.is_admin
            ? `Remove admin access from ${u.name}?`
            : `Make ${u.name} an admin? They will get full panel access.`;
        if (confirm(msg)) {
            router.put(route('admin.users.admin', u.id), {}, { preserveScroll: true });
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'User',
            render: (u) => (
                <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gold-500/15 text-sm font-bold theme-accent">
                        {(u.name || '?').charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-medium theme-heading">
                            {u.name}
                            {u.is_admin && (
                                <ShieldCheck className="h-3.5 w-3.5 flex-none text-gold-500" strokeWidth={2} />
                            )}
                        </p>
                        <p className="truncate text-xs theme-muted">{u.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'phone',
            label: 'Phone',
            render: (u) => u.phone || <span className="theme-muted">—</span>,
        },
        {
            key: 'card',
            label: 'Card',
            render: (u) =>
                u.card ? (
                    <div className="min-w-0">
                        <p className="font-mono text-xs theme-accent">{u.card.code}</p>
                        <p className="text-[0.65rem]">
                            {u.card.active ? (
                                <span className="text-emerald-600">Active · {u.card.expires_at}</span>
                            ) : (
                                <span className="theme-muted">
                                    {u.card.expires_at ? 'Expired' : 'Not recharged'}
                                </span>
                            )}
                        </p>
                    </div>
                ) : (
                    <span className="theme-muted">No card</span>
                ),
        },
        {
            key: 'active_books',
            label: 'Books',
            align: 'center',
            render: (u) => u.active_books || <span className="theme-muted">0</span>,
        },
        { key: 'joined', label: 'Joined' },
    ];

    return (
        <AdminLayout title="Users">
            <Head title="Admin — Users" />

            <p className="mb-4 text-sm theme-muted">
                Everyone signed up. Total: {summary.total} · Readers: {summary.readers} · With card: {summary.with_card}
            </p>

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <form onSubmit={submitSearch} className="relative flex-1 sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 theme-muted" strokeWidth={1.75} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, phone…"
                        className={`${input} pl-9`}
                    />
                </form>

                <div className="flex flex-wrap gap-1">
                    {FILTERS.map(([value, label]) => (
                        <button
                            key={value || 'all'}
                            onClick={() => setFilter(value)}
                            className={`rounded-full border px-3 py-1 text-xs transition ${
                                (filters.filter || '') === value
                                    ? 'border-gold-500 bg-gold-500/10 theme-accent'
                                    : 'theme-border theme-muted hover:border-gold-500/40 hover:text-gold-400'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <DataTable
                columns={columns}
                rows={users.data}
                paginator={users}
                empty="No users match this filter."
                actions={(u) => (
                    <button
                        onClick={() => toggleAdmin(u)}
                        className={`text-xs hover:opacity-70 ${u.is_admin ? 'text-rose-500' : 'theme-accent'}`}
                    >
                        {u.is_admin ? 'Remove admin' : 'Make admin'}
                    </button>
                )}
            />
        </AdminLayout>
    );
}
