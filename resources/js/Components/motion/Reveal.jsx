import { motion } from 'framer-motion';

/**
 * Scroll-triggered reveal. Fades + slides content into view once.
 * dir: 'up' | 'down' | 'left' | 'right' | 'none'
 */
const offsets = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 60, y: 0 },
    right: { x: -60, y: 0 },
    none: { x: 0, y: 0 },
};

export default function Reveal({
    children,
    dir = 'up',
    delay = 0,
    duration = 0.6,
    className = '',
    once = true,
    amount = 0.2,
    as = 'div',
}) {
    const MotionTag = motion[as] || motion.div;
    const off = offsets[dir] ?? offsets.up;

    return (
        <MotionTag
            className={className}
            initial={{ opacity: 0, ...off }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once, amount }}
            transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </MotionTag>
    );
}

/** Stagger container — children reveal one after another. */
export function Stagger({ children, className = '', gap = 0.09, once = true }) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="show"
            viewport={{ once, amount: 0.15 }}
            variants={{
                hidden: {},
                show: { transition: { staggerChildren: gap } },
            }}
        >
            {children}
        </motion.div>
    );
}

/** Child item for <Stagger>. */
export function StaggerItem({ children, className = '', dir = 'up' }) {
    const off = offsets[dir] ?? offsets.up;
    return (
        <motion.div
            className={className}
            variants={{
                hidden: { opacity: 0, ...off },
                show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
            }}
        >
            {children}
        </motion.div>
    );
}
