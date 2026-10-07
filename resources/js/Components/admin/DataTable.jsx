import Pagination from './Pagination';

/**
 * Shared admin list table.
 *
 * `columns`: [{ key, label, align?, className?, render?(row) }]
 * `rows`: array of records (usually paginator.data)
 * `paginator`: raw Laravel paginator, for the footer links
 */
export default function DataTable({
    columns,
    rows = [],
    paginator,
    empty = 'Nothing here yet.',
    actions,
}) {
    const align = (a) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');

    return (
        <div className="overflow-hidden rounded-2xl border theme-border theme-card">
            {/* Horizontal scroll keeps wide tables usable on phones without
                breaking the page layout. */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] border-collapse text-sm">
                    <thead>
                        <tr className="border-b theme-border">
                            {columns.map((c) => (
                                <th
                                    key={c.key}
                                    className={`whitespace-nowrap px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-wider theme-muted ${align(c.align)}`}
                                >
                                    {c.label}
                                </th>
                            ))}
                            {actions && (
                                <th className="whitespace-nowrap px-4 py-3 text-right text-[0.68rem] font-semibold uppercase tracking-wider theme-muted">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="px-4 py-12 text-center text-sm theme-muted"
                                >
                                    {empty}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, i) => (
                                <tr
                                    key={row.id ?? i}
                                    className={`transition hover:bg-gold-500/5 ${i > 0 ? 'border-t theme-border' : ''}`}
                                >
                                    {columns.map((c) => (
                                        <td
                                            key={c.key}
                                            className={`px-4 py-3 theme-text ${align(c.align)} ${c.className ?? ''}`}
                                        >
                                            {c.render ? c.render(row) : row[c.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {paginator && (
                <div className="border-t theme-border px-4 py-3">
                    <Pagination paginator={paginator} />
                </div>
            )}
        </div>
    );
}
