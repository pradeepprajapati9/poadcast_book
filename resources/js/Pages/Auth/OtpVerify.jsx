import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';
import { ArrowLeft, Mail } from 'lucide-react';

export default function OtpVerify({ email, status }) {
    const { data, setData, post, processing, errors } = useForm({ code: '' });
    const [cooldown, setCooldown] = useState(45);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    const submit = (e) => {
        e.preventDefault();
        post(route('otp.verify.store'));
    };

    const resend = () => {
        if (cooldown > 0) return;
        router.post(route('otp.store'), { email }, { onSuccess: () => setCooldown(45) });
    };

    return (
        <AuthLayout
            title="Enter your OTP"
            subtitle={`A 6-digit code was sent to ${email}.`}
            footer={
                <Link href={route('otp.create')} className="text-slate-400 hover:text-gold-300">
                    <ArrowLeft className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.75} />Change email
                </Link>
            }
        >
            <Head title="Verify OTP" />

            {status && (
                <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-300">
                    <Mail className="mr-1.5 inline h-4 w-4" strokeWidth={1.75} />{status}
                </div>
            )}

            <form onSubmit={submit}>
                <motion.input
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    placeholder="••••••"
                    className="w-full rounded-xl border-white/10 bg-ink-800 py-3 text-center font-mono text-2xl tracking-[0.5em] text-gold-200 placeholder:text-slate-600 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/40"
                />
                {errors.code && <p className="mt-2 text-center text-xs text-rose-400">{errors.code}</p>}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={processing || data.code.length !== 6}
                    className="mt-5 w-full rounded-xl bg-gold-500 py-3 text-sm font-semibold text-ink-950 shadow-gold transition hover:bg-gold-400 disabled:opacity-50"
                >
                    {processing ? 'Verifying…' : 'Verify & Log In'}
                </motion.button>
            </form>

            <div className="mt-5 text-center text-sm text-slate-400">
                Didn't receive a code?{' '}
                {cooldown > 0 ? (
                    <span className="text-slate-500">Resend in {cooldown}s</span>
                ) : (
                    <button onClick={resend} className="font-semibold text-gold-300 hover:text-gold-200">
                        Resend OTP
                    </button>
                )}
            </div>
        </AuthLayout>
    );
}
