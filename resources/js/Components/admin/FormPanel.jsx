import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Collapsible "create" panel that sits above an admin table.
 *
 * Keeps these pages structurally identical to Books/Slides (full-width table,
 * action button in the header) without moving the inline form to its own route.
 */
export default function FormPanel({ open, title, onClose, children }) {
    return (
        <AnimatePresence initial={false}>
            {open && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                >
                    <div className="mb-4 rounded-2xl border theme-border theme-card p-5 sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold theme-heading">{title}</h2>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="grid h-7 w-7 place-items-center rounded-lg theme-muted transition hover:bg-gold-500/10 hover:text-gold-400"
                            >
                                <X className="h-4 w-4" strokeWidth={1.75} />
                            </button>
                        </div>
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
