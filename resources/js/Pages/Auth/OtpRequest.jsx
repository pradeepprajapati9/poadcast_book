import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { CreditCard, Mail } from 'lucide-react';
import AuthLayout, { AuthField } from '@/Layouts/AuthLayout';

export default function OtpRequest({ prefillEmail, linkingCard }) {
    const { status } = usePage().props;

    // Two ways in: an email code, or a physical card number.
    const [mode, setMode] = useState('email');

    const email = useForm({ email: prefillEmail || '' });
    const card = useForm({ code: '', email: prefillEmail || '' });

    const sendCode = (e) => {
        e.preventDefault();
        email.post(route('otp.store'));
    };

    const useCard = (e) => {
        e.preventDefault();
        // Validates the card, remembers it, then sends the same email OTP.
        card.post(route('card.activate'));
    };

    const tab = (key, label, Icon) => (
        <button
            type="button"
            onClick={() => setMode(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
                mode === key
                    ? 'bg-gold-500 text-ink-950 shadow-gold'
                    : 'text-slate-400 hover:text-gold-300'
            }`}
        >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
        </button>
    );

    return (
        <AuthLayout
            title={linkingCard ? 'Confirm your email' : 'Sign in'}
            subtitle={
                linkingCard
                    ? 'We will send a one-time code, then link your card.'
                    : 'No password needed — sign in with your email or your card.'
            }
        >
            <Head title="Sign in" />

            {status && (
                <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
                    {status}
                </div>
            )}

            {linkingCard && (
                <div className="mb-4 rounded-lg border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-xs text-gold-200">
                    Card <span className="font-mono">{linkingCard}</span> will be added to your account.
                </div>
            )}

            {/* Tab switcher — hidden while linking a card mid-flow */}
            {!linkingCard && (
                <div className="mb-5 flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
                    {tab('email', 'Email', Mail)}
                    {tab('card', 'Card', CreditCard)}
                </div>
            )}

            {mode === 'email' || linkingCard ? (
                <form onSubmit={sendCode}>
                    <AuthField
                        label="Email address"
                        type="email"
                        value={email.data.email}
                        autoComplete="email"
                        autoFocus
                        placeholder="you@example.com"
                        onChange={(e) => email.setData('email', e.target.value)}
                        error={email.errors.email}
                        delay={0.05}
                    />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={email.processing}
                        className="mt-2 w-full rounded-xl bg-gold-500 py-3 text-sm font-semibold text-ink-950 shadow-gold transition hover:bg-gold-400 disabled:opacity-60"
                    >
                        {email.processing ? 'Sending code…' : 'Send code'}
                    </motion.button>

                    <p className="mt-6 text-center text-xs text-slate-500">
                        New to StoryVerse? Just enter your email — nothing else to fill in.
                    </p>
                </form>
            ) : (
                <form onSubmit={useCard}>
                    <AuthField
                        label="Card number"
                        value={card.data.code}
                        autoFocus
                        placeholder="SV-XXXX-XXXX-XXXX"
                        onChange={(e) => card.setData('code', e.target.value)}
                        error={card.errors.code}
                        className="font-mono uppercase"
                        delay={0.05}
                    />
                    <AuthField
                        label="Email address"
                        type="email"
                        value={card.data.email}
                        autoComplete="email"
                        placeholder="you@example.com"
                        onChange={(e) => card.setData('email', e.target.value)}
                        error={card.errors.email}
                        delay={0.1}
                    />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={card.processing}
                        className="mt-2 w-full rounded-xl bg-gold-500 py-3 text-sm font-semibold text-ink-950 shadow-gold transition hover:bg-gold-400 disabled:opacity-60"
                    >
                        {card.processing ? 'Please wait…' : 'Continue'}
                    </motion.button>

                    <p className="mt-6 text-center text-xs text-slate-500">
                        The card number is printed on your StoryVerse card. We will email you a code to confirm.
                    </p>
                </form>
            )}
        </AuthLayout>
    );
}
