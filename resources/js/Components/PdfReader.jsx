import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Bundled worker — keeps everything self-hosted, no CDN.
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Renders a chapter PDF as plain page images.
 *
 * We draw each page onto a canvas ourselves instead of embedding the browser's
 * PDF viewer, so there is no toolbar, no download/print button and no filename
 * on show — just the pages, edge to edge, on every device. Paid content, so the
 * fewer ways to pull the file out, the better.
 */
export default function PdfReader({ url }) {
    const containerRef = useRef(null);
    const [status, setStatus] = useState('loading'); // loading | ready | error

    useEffect(() => {
        let cancelled = false;
        let pdf = null;

        async function render() {
            setStatus('loading');
            const container = containerRef.current;
            if (!container) return;
            container.innerHTML = '';

            try {
                // Cookies go with the request so the gated route authorises it.
                pdf = await pdfjs.getDocument({ url, withCredentials: true }).promise;
                if (cancelled) return;

                // Fit page width to the container, sharp on retina screens.
                const width = container.clientWidth;
                const dpr = Math.min(window.devicePixelRatio || 1, 2);

                for (let n = 1; n <= pdf.numPages; n++) {
                    const page = await pdf.getPage(n);
                    if (cancelled) return;

                    const base = page.getViewport({ scale: 1 });
                    const scale = width / base.width;
                    const viewport = page.getViewport({ scale });

                    const canvas = document.createElement('canvas');
                    canvas.width = Math.floor(viewport.width * dpr);
                    canvas.height = Math.floor(viewport.height * dpr);
                    canvas.style.width = '100%';
                    canvas.style.height = 'auto';
                    canvas.style.display = 'block';
                    canvas.className = 'mx-auto';

                    container.appendChild(canvas);

                    await page.render({
                        canvasContext: canvas.getContext('2d'),
                        viewport: page.getViewport({ scale: scale * dpr }),
                    }).promise;
                }

                if (!cancelled) setStatus('ready');
            } catch (e) {
                if (!cancelled) setStatus('error');
            }
        }

        render();

        return () => {
            cancelled = true;
            pdf?.destroy?.();
        };
    }, [url]);

    return (
        <div className="w-full">
            <div ref={containerRef} className="flex flex-col gap-3 sm:gap-4" />

            {status === 'loading' && (
                <div className="py-20 text-center text-sm text-slate-400">Loading chapter…</div>
            )}

            {status === 'error' && (
                <div className="rounded-xl border border-white/10 p-8 text-center">
                    <p className="text-slate-300">This chapter could not be loaded.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-ink-950"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}
