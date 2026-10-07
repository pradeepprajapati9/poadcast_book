import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/** Counts up from 0 to `value` when scrolled into view. */
export default function Counter({ value = 0, duration = 1.6, suffix = '', prefix = '', decimals = 0 }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!inView) return;
        const controls = animate(0, value, {
            duration,
            ease: 'easeOut',
            onUpdate: (v) => setDisplay(v),
        });
        return () => controls.stop();
    }, [inView, value, duration]);

    const formatted =
        decimals > 0
            ? display.toFixed(decimals)
            : Intl.NumberFormat('en', { notation: value >= 1000 ? 'compact' : 'standard' }).format(Math.round(display));

    return (
        <span ref={ref}>
            {prefix}
            {formatted}
            {suffix}
        </span>
    );
}
