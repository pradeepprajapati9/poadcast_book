import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center theme-bg px-4 pt-10 sm:justify-center sm:pt-0">
            <Link href="/">
                <ApplicationLogo className="h-16 w-16 fill-current theme-accent" />
            </Link>

            <div className="mt-6 w-full overflow-hidden rounded-2xl border theme-border theme-card px-6 py-6 shadow-sm sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
