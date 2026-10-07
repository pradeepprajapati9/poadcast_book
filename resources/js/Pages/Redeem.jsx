import { Head, useForm } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
import BrandLogo from '@/Components/store/BrandLogo';
import { BookOpen, ShieldCheck, Unlock } from 'lucide-react';

export default function Redeem({ code }) {
    const { data, setData, post, processing, errors } = useForm({ code: code || '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('redeem.store'));
    };

    return (
        <StoreLayout>
            <Head title="Redeem Code — StoryVerse" />

            <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
                <div className="overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-br from-ink-800 to-ink-950 p-8 shadow-gold">
                    <div className="text-center">
                        <BrandLogo className="justify-center" />
                        <h1 className="mt-6 font-display text-2xl font-bold text-slate-50">
                            Activate Your Access
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Enter the <span className="text-gold-300">Access Code</span> from the card inside your packet here.
                        </p>
                    </div>

                    <form onSubmit={submit} className="mt-8">
                        <label className="mb-1.5 block text-xs uppercase tracking-widest text-slate-500">
                            Your Access Code
                        </label>
                        <input
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            autoFocus
                            className="w-full rounded-xl border-white/10 bg-ink-900 px-4 py-3 text-center font-mono text-lg tracking-widest text-gold-200 placeholder:text-slate-600 focus:border-gold-500 focus:ring-gold-500"
                        />
                        {errors.code && <p className="mt-2 text-sm text-rose-400">{errors.code}</p>}

                        <button
                            disabled={processing}
                            className="mt-5 w-full rounded-xl bg-gold-500 py-3 font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
                        >
                            {processing ? 'Activating…' : 'Unlock Access'}
                        </button>
                    </form>

                    <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-center text-[0.7rem] text-slate-400">
                        <div>
                            <p className="flex items-center justify-center gap-1.5 text-gold-300"><Unlock className="h-4 w-4" strokeWidth={1.75} />Instant</p>
                            <p>Unlock Stories</p>
                        </div>
                        <div>
                            <p className="flex items-center justify-center gap-1.5 text-gold-300"><BookOpen className="h-4 w-4" strokeWidth={1.75} />Exclusive</p>
                            <p>Only For You</p>
                        </div>
                        <div>
                            <p className="flex items-center justify-center gap-1.5 text-gold-300"><ShieldCheck className="h-4 w-4" strokeWidth={1.75} />Secure</p>
                            <p>100% Private</p>
                        </div>
                    </div>
                </div>

                <p className="mt-4 text-center text-xs text-slate-500">
                    Having trouble with the code? Contact <span className="text-gold-400">hello@storyverse.in</span>.
                </p>
            </div>
        </StoreLayout>
    );
}
