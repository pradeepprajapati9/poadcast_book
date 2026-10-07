import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AccountLayout from '@/Layouts/AccountLayout';
import { ArrowRight } from 'lucide-react';

const input =
    'w-full rounded-xl border theme-input px-4 py-2.5 text-sm focus:border-gold-500 focus:ring-gold-500';

/** The card itself — deliberately looks like a physical pass. */
function CardFace({ card }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="on-dark relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-6 shadow-lg"
        >
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-500/20 blur-3xl" />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold-300">StoryVerse</p>
                    <p className="mt-1 font-display text-lg font-bold text-white">Master Card</p>
                </div>
                <span
                    className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold ${
                        card.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                >
                    {card.active ? 'Active' : 'Inactive'}
                </span>
            </div>

            <p className="relative mt-8 font-mono text-lg tracking-[0.2em] text-white">{card.code}</p>

            <div className="relative mt-5 flex items-end justify-between">
                <div>
                    <p className="text-[0.6rem] uppercase tracking-widest text-slate-400">Valid till</p>
                    <p className="text-sm font-semibold text-white">{card.expires_at || '—'}</p>
                </div>
                {card.active && (
                    <p className="text-right text-sm text-gold-300">
                        {card.days_left} <span className="text-xs text-slate-400">days left</span>
                    </p>
                )}
            </div>
        </motion.div>
    );
}

/** One selectable row in the plan table. */
function PlanRow({ plan, selected, onSelect, first }) {
    return (
        <label
            className={`flex cursor-pointer items-center gap-4 px-4 py-3.5 transition sm:px-5 ${
                first ? '' : 'border-t theme-border'
            } ${selected ? 'bg-gold-500/10' : 'hover:bg-gold-500/5'}`}
        >
            <input
                type="radio"
                name="plan"
                checked={selected}
                onChange={() => onSelect(plan)}
                className="h-4 w-4 flex-none theme-border text-gold-500 focus:ring-gold-500"
            />

            <div className="min-w-0 flex-1">
                <p className="font-medium theme-heading">{plan.name}</p>
                <p className="text-xs theme-muted">
                    {plan.months} month{plan.months > 1 ? 's' : ''} · full access
                    {plan.description && ` · ${plan.description}`}
                </p>
            </div>

            <span className="hidden flex-none text-xs theme-muted sm:block">₹{plan.per_month}/mo</span>

            <span className="w-16 flex-none text-right font-display text-lg font-bold theme-heading">
                ₹{plan.price}
            </span>
        </label>
    );
}

/** Load the Razorpay checkout script once, on demand. */
function loadRazorpay() {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });
}

export default function Show({ card, plans = [], pendingOrder, payTo, profile, razorpayEnabled }) {
    const { flash } = usePage().props;
    const [paying, setPaying] = useState(false);

    const claim = useForm({ code: '' });
    const recharge = useForm({ code: '' });
    const digital = useForm({});
    const order = useForm({
        plan: null,
        name: profile?.needs_name ? '' : profile?.name || '',
        phone: profile?.phone || '',
    });

    // Default to the best-value plan (lowest per-month) so one click pays.
    const [selected, setSelected] = useState(
        () => plans.slice().sort((a, b) => a.per_month - b.per_month)[0] ?? null,
    );

    const [showSlip, setShowSlip] = useState(false);

    const askDetails = profile?.needs_name || profile?.needs_phone;

    const pay = (e) => {
        e?.preventDefault();
        if (!selected) return;

        order.transform((d) => ({ plan: selected.id, name: d.name, phone: d.phone }));
        order.post(route('card.order'), { preserveScroll: true });
    };

    const cancelOrder = () => {
        if (confirm('Cancel this pending payment?')) {
            order.delete(route('card.order.cancel', pendingOrder.id), { preserveScroll: true });
        }
    };

    /**
     * Open Razorpay for a pending order. On success we hand the signed result
     * to the server, which verifies it before activating the card.
     */
    const payNow = async () => {
        if (!pendingOrder || paying) return;
        setPaying(true);

        const ok = await loadRazorpay();
        if (!ok) {
            setPaying(false);
            alert('Could not reach the payment gateway. Please try again.');
            return;
        }

        try {
            const { data } = await window.axios.post(route('pay.create', pendingOrder.id));

            const rzp = new window.Razorpay({
                ...data,
                theme: { color: '#c39b4e' },
                handler: (res) => {
                    // Verified server-side; a normal Inertia visit updates the page.
                    router.post(route('pay.verify'), {
                        razorpay_order_id: res.razorpay_order_id,
                        razorpay_payment_id: res.razorpay_payment_id,
                        razorpay_signature: res.razorpay_signature,
                    });
                },
                modal: { ondismiss: () => setPaying(false) },
            });

            rzp.on('payment.failed', () => {
                setPaying(false);
                alert('Payment failed. No money was deducted — you can try again.');
            });

            rzp.open();
        } catch {
            setPaying(false);
            alert('Could not start the payment. Please try again.');
        }
    };

    // Arriving from the QR on a physical card pre-fills the number.
    useEffect(() => {
        if (flash?.card_code && !card) {
            claim.setData('code', flash.card_code);
        }
    }, [flash?.card_code]);

    const submitClaim = (e) => {
        e.preventDefault();
        claim.post(route('card.claim'), { preserveScroll: true });
    };

    const submitRecharge = (e) => {
        e.preventDefault();
        recharge.post(route('card.recharge'), {
            preserveScroll: true,
            onSuccess: () => recharge.reset(),
        });
    };

    return (
        <AccountLayout active="card" title="My Card" subtitle="One card, every story.">
            <Head title="My Card — StoryVerse" />

            {card ? (
                <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
                    <div className="space-y-4">
                        <CardFace card={card} />

                        {!card.active && (
                            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 theme-text">
                                {card.expires_at
                                    ? 'Your card has expired. Add a recharge code to continue reading.'
                                    : 'Your card is not recharged yet. Add a recharge code to start reading.'}
                            </p>
                        )}

                        {!card.device_allowed && (
                            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs leading-5 theme-text">
                                This card is already in use on {card.device_limit} devices, so it will not
                                open books here. Ask support to reset your devices.
                            </p>
                        )}

                        <p className="text-xs theme-muted">
                            Devices used: {card.device_count} of {card.device_limit}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Pending order — pay online, or (fallback) pay UPI manually */}
                        {pendingOrder && (
                            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                                <p className="font-semibold theme-heading">
                                    ₹{pendingOrder.amount} · {pendingOrder.months} month
                                    {pendingOrder.months > 1 ? 's' : ''}
                                </p>

                                {razorpayEnabled ? (
                                    <>
                                        <p className="mt-1 text-sm leading-6 theme-text">
                                            Complete your payment to activate the card instantly.
                                        </p>
                                        <button
                                            onClick={payNow}
                                            disabled={paying}
                                            className="mt-3 rounded-full bg-gold-500 px-7 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
                                        >
                                            {paying ? 'Opening…' : `Pay ₹${pendingOrder.amount} now`}
                                        </button>
                                    </>
                                ) : (
                                    <p className="mt-1 text-sm leading-6 theme-text">
                                        {pendingOrder.months} month{pendingOrder.months > 1 ? 's' : ''} will be added
                                        once we confirm your payment.
                                        {payTo && (
                                            <>
                                                {' '}Pay <span className="font-mono font-semibold">{payTo}</span> on any UPI app.
                                            </>
                                        )}
                                    </p>
                                )}

                                <button
                                    onClick={cancelOrder}
                                    className="mt-3 block text-xs text-rose-500 hover:opacity-70"
                                >
                                    Cancel this order
                                </button>
                            </div>
                        )}

                        {/* Renewal nudge */}
                        {!pendingOrder && (card.needs_renewal || !card.active) && plans.length > 0 && (
                            <div className="rounded-2xl border border-gold-500/30 bg-gold-500/5 p-5">
                                <p className="font-semibold theme-heading">
                                    {card.active
                                        ? `Your card expires in ${card.days_left} days`
                                        : 'Your card is not active'}
                                </p>
                                <p className="mt-1 text-sm theme-muted">
                                    Renew below to keep reading without a break.
                                </p>
                            </div>
                        )}

                        {/* Plans — pick one row, pay once */}
                        {!pendingOrder && plans.length > 0 && (
                            <div className="overflow-hidden rounded-2xl border theme-border theme-card">
                                <div className="border-b theme-border px-4 py-3 sm:px-5">
                                    <h2 className="font-semibold theme-heading">
                                        {card.active ? 'Extend your card' : 'Activate your card'}
                                    </h2>
                                    <p className="text-xs theme-muted">Select a plan, then pay.</p>
                                </div>

                                {plans.map((p, i) => (
                                    <PlanRow
                                        key={p.id}
                                        plan={p}
                                        first={i === 0}
                                        selected={selected?.id === p.id}
                                        onSelect={setSelected}
                                    />
                                ))}

                                <form onSubmit={pay} className="border-t theme-border px-4 py-4 sm:px-5">
                                    {/* Only asked once — signup takes nothing but an email. */}
                                    {askDetails && (
                                        <div className="mb-4">
                                            <p className="mb-2 text-xs theme-muted">
                                                Just two details so we can reach you about your card:
                                            </p>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {profile.needs_name && (
                                                    <div>
                                                        <input
                                                            value={order.data.name}
                                                            onChange={(e) => order.setData('name', e.target.value)}
                                                            placeholder="Your name"
                                                            className={input}
                                                        />
                                                        {order.errors.name && (
                                                            <p className="mt-1 text-xs text-rose-500">{order.errors.name}</p>
                                                        )}
                                                    </div>
                                                )}
                                                {profile.needs_phone && (
                                                    <div>
                                                        <input
                                                            value={order.data.phone}
                                                            onChange={(e) => order.setData('phone', e.target.value)}
                                                            placeholder="Phone number"
                                                            inputMode="tel"
                                                            className={input}
                                                        />
                                                        {order.errors.phone && (
                                                            <p className="mt-1 text-xs text-rose-500">{order.errors.phone}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-sm theme-muted">
                                            {selected ? (
                                                <>
                                                    Paying{' '}
                                                    <span className="font-display text-lg font-bold theme-heading">
                                                        ₹{selected.price}
                                                    </span>{' '}
                                                    for {selected.months} month{selected.months > 1 ? 's' : ''}
                                                </>
                                            ) : (
                                                'Select a plan above'
                                            )}
                                        </p>

                                        <button
                                            disabled={!selected || order.processing}
                                            className="rounded-full bg-gold-500 px-7 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-50"
                                        >
                                            {order.processing ? 'Please wait…' : `Pay ₹${selected?.price ?? ''}`}
                                        </button>
                                    </div>

                                    {order.errors.plan && (
                                        <p className="mt-2 text-sm text-rose-500">{order.errors.plan}</p>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* Recharge slip — secondary, hidden until asked for so it
                            is not mistaken for the card-number field. */}
                        <div className="rounded-2xl border theme-border theme-card p-5">
                            <button
                                onClick={() => setShowSlip((v) => !v)}
                                className="flex w-full items-center justify-between text-left"
                            >
                                <span className="text-sm font-medium theme-text">
                                    Have a printed recharge slip?
                                </span>
                                <span className="text-xs theme-muted">{showSlip ? '−' : '+'}</span>
                            </button>

                            {showSlip && (
                                <div className="mt-4">
                                    <p className="mb-3 text-xs theme-muted">
                                        Enter the code from the slip — it starts with <span className="font-mono">RC-</span>.
                                        This is not your card number.
                                    </p>

                                    <form onSubmit={submitRecharge} className="flex flex-wrap gap-3">
                                        <input
                                            value={recharge.data.code}
                                            onChange={(e) => recharge.setData('code', e.target.value)}
                                            placeholder="RC-1M-XXXX-XXXX"
                                            className={`${input} max-w-xs flex-1 font-mono uppercase`}
                                        />
                                        <button
                                            disabled={recharge.processing}
                                            className="rounded-full border border-gold-500/40 px-6 py-2.5 text-sm font-semibold theme-accent transition hover:bg-gold-500/10 disabled:opacity-60"
                                        >
                                            Add months
                                        </button>
                                    </form>

                                    {recharge.errors.code && (
                                        <p className="mt-2 text-sm text-rose-500">{recharge.errors.code}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* History */}
                        {card.recharges.length > 0 && (
                            <div className="overflow-hidden rounded-2xl border theme-border theme-card">
                                <p className="border-b theme-border px-5 py-3 text-sm font-semibold theme-heading">
                                    Recharge history
                                </p>
                                <ul>
                                    {card.recharges.map((r, i) => (
                                        <li
                                            key={r.id}
                                            className={`flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm ${
                                                i > 0 ? 'border-t theme-border' : ''
                                            }`}
                                        >
                                            <span className="theme-text">
                                                +{r.months} month{r.months > 1 ? 's' : ''}
                                            </span>
                                            <span className="font-mono text-xs theme-muted">{r.reference}</span>
                                            <span className="text-xs theme-muted">{r.on}</span>
                                            <span className="text-xs theme-muted">till {r.valid_till}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Link
                            href={route('library')}
                            className="inline-block rounded-full border border-gold-500/40 px-6 py-2.5 text-sm font-semibold theme-accent transition hover:bg-gold-500/10"
                        >
                            Browse the library <ArrowRight className="ml-1 inline h-4 w-4" strokeWidth={2} />
                        </Link>
                    </div>
                </div>
            ) : (
                /* No card yet — link a physical one, or make a digital one. */
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="rounded-2xl border theme-border theme-card p-5 sm:p-6">
                        <h2 className="font-semibold theme-heading">Have a physical card?</h2>
                        <p className="mb-4 mt-1 text-sm leading-6 theme-muted">
                            Enter the number printed on it — or scan its QR — to link it to this account.
                        </p>

                        <form onSubmit={submitClaim} className="space-y-3">
                            <input
                                value={claim.data.code}
                                onChange={(e) => claim.setData('code', e.target.value)}
                                placeholder="SV-XXXX-XXXX-XXXX"
                                className={`${input} font-mono uppercase`}
                            />
                            {claim.errors.code && <p className="text-sm text-rose-500">{claim.errors.code}</p>}
                            <button
                                disabled={claim.processing}
                                className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
                            >
                                Link card
                            </button>
                        </form>
                    </div>

                    <div className="rounded-2xl border theme-border theme-card p-5 sm:p-6">
                        <h2 className="font-semibold theme-heading">No card yet?</h2>
                        <p className="mb-4 mt-1 text-sm leading-6 theme-muted">
                            Create a digital card instantly. It works exactly like the physical one —
                            recharge it and every book opens.
                        </p>

                        <button
                            onClick={() => digital.post(route('card.digital'))}
                            disabled={digital.processing}
                            className="w-full rounded-full border border-gold-500/40 py-2.5 text-sm font-semibold theme-accent transition hover:bg-gold-500/10 disabled:opacity-60"
                        >
                            Create digital card
                        </button>
                    </div>
                </div>
            )}
        </AccountLayout>
    );
}
