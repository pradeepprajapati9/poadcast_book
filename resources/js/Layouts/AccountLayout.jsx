import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import StoreLayout from '@/Layouts/StoreLayout';

/**
 * Account area shell.
 *
 * One destination ("My Account") with two tabs instead of a sidebar — the
 * sidebar held only three live links and collapsed badly on mobile.
 */
const TABS = [
    { key: 'library', label: 'My Books', route: 'dashboard' },
    { key: 'card', label: 'My Card', route: 'card.show' },
    { key: 'profile', label: 'Profile', route: 'profile.edit' },
];

export default function AccountLayout({ active, title, subtitle, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <StoreLayout>
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
                {/* User header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border theme-border theme-card p-4 sm:p-5"
                >
                    <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-gold-500 text-lg font-bold text-ink-950">
                        {user?.name?.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold theme-heading">{user?.name}</p>
                        <p className="truncate text-xs theme-muted">{user?.email}</p>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex-none rounded-full border theme-border px-4 py-1.5 text-xs font-semibold text-rose-500 transition hover:border-rose-500/40 hover:bg-rose-500/10"
                    >
                        Log Out
                    </Link>
                </motion.div>

                {/* Tabs */}
                <div className="mt-6 flex gap-1 border-b theme-border">
                    {TABS.map((t) => (
                        <Link
                            key={t.key}
                            href={route(t.route)}
                            className={`relative -mb-px px-4 py-2.5 text-sm font-medium transition ${
                                active === t.key ? 'theme-accent' : 'theme-muted hover:theme-heading'
                            }`}
                        >
                            {t.label}
                            {active === t.key && (
                                <motion.span
                                    layoutId="accountTab"
                                    className="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-gold-500"
                                />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Content */}
                <motion.section
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="mt-6"
                >
                    {title && (
                        <div className="mb-5">
                            <h1 className="font-display text-2xl font-bold theme-heading sm:text-3xl">{title}</h1>
                            {subtitle && <p className="mt-1 text-sm theme-muted">{subtitle}</p>}
                        </div>
                    )}
                    {children}
                </motion.section>
            </div>
        </StoreLayout>
    );
}
