import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BookCover from '@/Components/store/BookCover';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

/** Clickable KPI tile. */
function Stat({ label, value, sub, tone = 'default', href }) {
    const tones = {
        default: 'theme-heading',
        warn: 'text-amber-600',
        good: 'text-emerald-600',
    };

    const body = (
        <>
            <p className="text-[0.65rem] uppercase tracking-widest theme-muted">{label}</p>
            <p className={`mt-2 font-display text-3xl font-bold ${tones[tone]}`}>{value}</p>
            {sub && <p className="mt-1 text-xs theme-muted">{sub}</p>}
        </>
    );

    const className =
        'block rounded-2xl border theme-border theme-card p-5 transition hover:border-gold-500/40';

    return href ? (
        <Link href={href} className={className}>{body}</Link>
    ) : (
        <div className={className}>{body}</div>
    );
}

function Panel({ title, action, children }) {
    return (
        <div className="rounded-2xl border theme-border theme-card">
            <div className="flex items-center justify-between border-b theme-border px-5 py-3.5">
                <h2 className="text-sm font-semibold theme-heading">{title}</h2>
                {action}
            </div>
            {children}
        </div>
    );
}

function More({ href, children }) {
    return (
        <Link href={href} className="text-xs font-medium theme-accent transition hover:opacity-70">
            {children}
        </Link>
    );
}

/** A group of things that need fixing, e.g. chapters with no PDF. */
function TodoGroup({ label, items, tone = 'amber' }) {
    if (!items.length) return null;

    const dot = tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500';

    return (
        <div className="px-5 py-3.5">
            <p className="mb-2 flex items-center gap-2 text-xs font-medium theme-text">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {label}
            </p>
            <ul className="space-y-1">
                {items.map((it) => (
                    <li key={it.id}>
                        {it.href ? (
                            <Link href={it.href} className="block truncate text-sm theme-muted transition hover:text-gold-400">
                                {it.label}
                            </Link>
                        ) : (
                            <span className="block truncate text-sm theme-muted">{it.label}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Dashboard({ stats, attention, recentBooks }) {
    const todoCount =
        attention.chapters_missing_pdf.length +
        attention.books_without_chapters.length +
        attention.unpublished_books.length;

    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin — Dashboard" />

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat
                    label="Books"
                    value={stats.books}
                    sub={`${stats.books_published} published · ${stats.books_draft} draft`}
                    href={route('admin.books.index')}
                />
                <Stat
                    label="Chapters"
                    value={stats.chapters}
                    sub={
                        stats.chapters_missing_pdf
                            ? `${stats.chapters_missing_pdf} missing a PDF`
                            : 'All have a PDF'
                    }
                    tone={stats.chapters_missing_pdf ? 'warn' : 'default'}
                    href={route('admin.books.index')}
                />
                <Stat
                    label="Readers"
                    value={stats.readers}
                    sub={`${stats.readers_with_access} with active access`}
                />
                <Stat
                    label="Access Codes"
                    value={stats.codes}
                    sub="One per book"
                    href={route('admin.codes.index')}
                />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {/* Recent books */}
                <div className="lg:col-span-2">
                    <Panel
                        title="Recent Books"
                        action={<More href={route('admin.books.index')}>Manage <ArrowRight className="ml-0.5 inline h-3 w-3" strokeWidth={2} /></More>}
                    >
                        {recentBooks.length ? (
                            <ul>
                                {recentBooks.map((b, i) => (
                                    <li key={b.id} className={i > 0 ? 'border-t theme-border' : ''}>
                                        <Link
                                            href={route('admin.books.edit', b.slug)}
                                            className="flex items-center gap-3 px-5 py-3 transition hover:bg-gold-500/5"
                                        >
                                            <div className="on-dark h-11 w-8 flex-none overflow-hidden rounded ring-1 ring-black/10">
                                                <BookCover book={b} variant="minimal" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium theme-heading">{b.title}</p>
                                                <p className="text-xs theme-muted">
                                                    {b.chapters_count} chapter{b.chapters_count === 1 ? '' : 's'}
                                                </p>
                                            </div>

                                            <span
                                                className={`flex-none whitespace-nowrap rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${
                                                    b.is_published
                                                        ? 'bg-emerald-500/15 text-emerald-600'
                                                        : 'bg-slate-500/15 theme-muted'
                                                }`}
                                            >
                                                {b.is_published ? 'Published' : 'Draft'}
                                            </span>

                                            <span className="w-16 flex-none text-right text-xs theme-muted">
                                                {Intl.NumberFormat('en', { notation: 'compact' }).format(b.views)}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="px-5 py-10 text-center text-sm theme-muted">No books yet.</p>
                        )}
                    </Panel>
                </div>

                {/* Needs attention */}
                <Panel
                    title={todoCount ? `Needs attention (${todoCount})` : 'Needs attention'}
                >
                    {todoCount ? (
                        <div className="divide-y theme-border">
                            <TodoGroup
                                label="Chapters without a PDF"
                                items={attention.chapters_missing_pdf}
                            />
                            <TodoGroup
                                label="Books with no chapters"
                                items={attention.books_without_chapters}
                            />
                            <TodoGroup
                                label="Not published yet"
                                items={attention.unpublished_books}
                            />
                        </div>
                    ) : (
                        <p className="px-5 py-10 text-center text-sm theme-muted">
                            <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-500" strokeWidth={1.5} />
                            Everything looks complete.
                        </p>
                    )}
                </Panel>
            </div>

        </AdminLayout>
    );
}
