import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AuthLayout, { AuthField } from '@/Layouts/AuthLayout';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <AuthLayout
            title="Staff sign in"
            subtitle="Admin access. Readers use a one-time code instead."
            footer={
                <>
                    Reading on StoryVerse?{' '}
                    <Link href={route('otp.create')} className="font-semibold text-gold-300 hover:text-gold-200">
                        Sign in with your email
                    </Link>
                </>
            }
        >
            <Head title="Staff sign in" />

            {status && (
                <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <AuthField
                    label="Email"
                    type="email"
                    value={data.email}
                    autoComplete="username"
                    autoFocus
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    delay={0.05}
                />
                <AuthField
                    label="Password"
                    type="password"
                    value={data.password}
                    autoComplete="current-password"
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    delay={0.12}
                />

                <div className="mb-6 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-white/20 bg-ink-800 text-gold-500 focus:ring-gold-500"
                        />
                        Remember me
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')} className="text-sm text-slate-400 hover:text-gold-300">
                            Forgot password?
                        </Link>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={processing}
                    className="w-full rounded-xl bg-gold-500 py-3 text-sm font-semibold text-ink-950 shadow-gold transition hover:bg-gold-400 disabled:opacity-60"
                >
                    {processing ? 'Signing in…' : 'Sign In'}
                </motion.button>
            </form>
        </AuthLayout>
    );
}
