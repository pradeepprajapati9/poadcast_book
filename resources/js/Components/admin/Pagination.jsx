import { Link } from '@inertiajs/react';

/**
 * Renders a Laravel paginator's links.
 *
 * Expects the raw paginator object Inertia receives from `->paginate()`:
 * { data, links, meta } (Laravel 11 flattens meta onto the root for
 * `paginate()`, so both shapes are handled).
 */
export default function Pagination({ paginator, className = '' }) {
    const links = paginator?.links ?? paginator?.meta?.links ?? [];
    const from = paginator?.from ?? paginator?.meta?.from;
    const to = paginator?.to ?? paginator?.meta?.to;
    const total = paginator?.total ?? paginator?.meta?.total ?? 0;

    // Only prev/next present means everything fits on one page.
    if (links.length <= 3) {
        return total > 0 ? (
            <p className={`text-xs text-slate-500 ${className}`}>
                Showing all {total} {total === 1 ? 'entry' : 'entries'}
            </p>
        ) : null;
    }

    return (
        <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
            <p className="text-xs text-slate-500">
                Showing {from}–{to} of {total}
            </p>

            <div className="flex flex-wrap items-center gap-1">
                {links.map((link, i) => {
                    const label = link.label
                        .replace('&laquo;', '‹')
                        .replace('&raquo;', '›')
                        .replace('Previous', '‹')
                        .replace('Next', '›');

                    // Laravel emits a disabled "..." separator with a null url.
                    if (!link.url) {
                        return (
                            <span key={i} className="px-2.5 py-1.5 text-xs text-slate-600">
                                {label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={i}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={`min-w-[2rem] rounded-lg px-2.5 py-1.5 text-center text-xs transition ${
                                link.active
                                    ? 'bg-gold-500 font-semibold text-ink-950'
                                    : 'border border-white/10 text-slate-300 hover:border-gold-500/40 hover:text-gold-300'
                            }`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
