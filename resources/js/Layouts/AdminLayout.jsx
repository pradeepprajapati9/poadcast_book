import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    ArrowLeft,
    BatteryCharging,
    BookOpen,
    CreditCard,
    Image,
    LayoutDashboard,
    LogOut,
    MessageSquareQuote,
    Receipt,
    Tag,
    Ticket,
    Users,
} from 'lucide-react';
import BrandLogo from '@/Components/store/BrandLogo';

function Item({ href, active, icon: Icon, children }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                active ? 'bg-gold-500/15 theme-accent' : 'theme-text hover:bg-gold-500/10 hover:text-gold-400'
            }`}
        >
            <Icon className="h-4 w-4 flex-none" strokeWidth={1.75} />
            {children}
        </Link>
    );
}

export default function AdminLayout({ title, actions, children }) {
    const { auth, flash } = usePage().props;
    const currentUrl = usePage().url;
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash?.success]);

    const is = (path, exact = false) =>
        exact ? currentUrl === path : currentUrl.startsWith(path);

    return (
        <div className="min-h-screen theme-bg lg:flex">
            {/* Sidebar */}
            <aside className="flex-none border-b theme-border theme-surface lg:w-60 lg:border-b-0 lg:border-r">
                <div className="px-4 py-4">
                    <Link href={route('admin.dashboard')}>
                        <BrandLogo subtitle={false} />
                    </Link>
                    <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-gold-500/70">
                        Admin Panel
                    </p>
                </div>
                <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
                    <Item href={route('admin.dashboard')} active={is('/admin', true)} icon={LayoutDashboard}>Dashboard</Item>
                    <Item href={route('admin.users.index')} active={is('/admin/users')} icon={Users}>Users</Item>
                    <Item href={route('admin.slides.index')} active={is('/admin/slides')} icon={Image}>Hero Slides</Item>
                    <Item href={route('admin.books.index')} active={is('/admin/books')} icon={BookOpen}>Books</Item>
                    <Item href={route('admin.genres.index')} active={is('/admin/genres')} icon={Tag}>Genres</Item>
                    <Item href={route('admin.codes.index')} active={is('/admin/codes')} icon={Ticket}>Access Codes</Item>
                    <Item href={route('admin.cards.index')} active={is('/admin/cards')} icon={CreditCard}>Master Cards</Item>
                    <Item href={route('admin.plans.index')} active={is('/admin/plans')} icon={Tag}>Card Plans</Item>
                    <Item href={route('admin.orders.index')} active={is('/admin/orders')} icon={Receipt}>Card Orders</Item>
                    <Item href={route('admin.vouchers.index')} active={is('/admin/vouchers')} icon={BatteryCharging}>Recharge Vouchers</Item>
                    <Item href={route('admin.testimonials.index')} active={is('/admin/testimonials')} icon={MessageSquareQuote}>Testimonials</Item>
                </nav>
                <div className="hidden border-t theme-border px-3 py-3 lg:block">
                    <Link href={route('home')} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm theme-muted transition hover:bg-gold-500/10 hover:text-gold-400">
                        <ArrowLeft className="h-4 w-4 flex-none" strokeWidth={1.75} />
                        View Site
                    </Link>
                    <Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-rose-500 transition hover:bg-rose-500/10">
                        <LogOut className="h-4 w-4 flex-none" strokeWidth={1.75} />
                        Log Out
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <div className="min-w-0 flex-1">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b theme-border theme-surface px-4 py-4 sm:px-6">
                    <h1 className="font-display text-lg font-semibold theme-heading">{title}</h1>
                    <div className="flex items-center gap-3">
                        {actions}
                        <span className="hidden text-sm theme-muted sm:inline">{auth?.user?.name}</span>
                    </div>
                </header>
                <div className="p-4 sm:p-6">{children}</div>
            </div>

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-gold-500/40 theme-card px-5 py-2.5 text-sm theme-accent shadow-lg">
                    {toast}
                </div>
            )}
        </div>
    );
}
