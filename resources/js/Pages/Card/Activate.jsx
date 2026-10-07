import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import BrandLogo from '@/Components/store/BrandLogo';

const input =
    'w-full rounded-xl border theme-input px-4 py-2.5 text-sm focus:border-gold-500 focus:ring-gold-500';

/**
 * Landing page for the QR printed on a physical card.
 *
 * The holder has already paid over the counter, so this asks for as little as
 * possible: the card number is pre-filled from the QR and the name is optional.
 */
export default function Activate({ code }) {
    const form = useForm({ code: code || '', email: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('card.activate'));
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center theme-bg px-4 py-10">
            <Head title="Activate your card — StoryVerse" />

            <Link href="/" className="mb-6">
                <BrandLogo />
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm rounded-2xl border theme-border theme-card p-6"
            >
                <h1 className="font-display text-xl font-bold theme-heading">Activate your card</h1>
                <p className="mt-1 text-sm leading-6 theme-muted">
                    Welcome to StoryVerse. Enter your email — we will send a one-time code to confirm it.
                </p>

                <form onSubmit={submit} className="mt-5 space-y-4">
                    <label className="block">
                        <span className="mb-1 block text-sm theme-text">Card number</span>
                        <input
                            value={form.data.code}
                            onChange={(e) => form.setData('code', e.target.value)}
                            className={`${input} font-mono uppercase`}
                        />
                        {form.errors.code && <p className="mt-1 text-sm text-rose-500">{form.errors.code}</p>}
                    </label>

                    <label className="block">
                        <span className="mb-1 block text-sm theme-text">Your email</span>
                        <input
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            placeholder="you@example.com"
                            autoFocus
                            className={input}
                        />
                        {form.errors.email && <p className="mt-1 text-sm text-rose-500">{form.errors.email}</p>}
                    </label>

                    <button
                        disabled={form.processing}
                        className="w-full rounded-full bg-gold-500 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
                    >
                        {form.processing ? 'Sending code…' : 'Continue'}
                    </button>
                </form>

                <p className="mt-4 text-center text-xs theme-muted">
                    No password needed — your card is linked once the code is confirmed.
                </p>
            </motion.div>
        </div>
    );
}
