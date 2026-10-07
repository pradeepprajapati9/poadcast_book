import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const input =
    'w-full rounded-lg border theme-input px-3 py-2 text-sm focus:border-gold-500 focus:ring-gold-500';

const fileInput =
    'block w-full text-sm theme-muted file:mr-3 file:rounded file:border-0 file:bg-gold-500 file:px-3 file:py-1.5 file:font-medium file:text-ink-950';

/** Upload field with an optional URL fallback and a preview of what is saved. */
function ImageField({ label, hint, current, fileValue, urlValue, onFile, onUrl }) {
    const preview = fileValue ? URL.createObjectURL(fileValue) : urlValue || current;

    return (
        <div className="rounded-xl border theme-border p-4">
            <p className="text-sm font-medium theme-text">{label}</p>
            {hint && <p className="mb-3 text-xs theme-muted">{hint}</p>}

            <div className="flex items-start gap-4">
                <div className="on-dark h-20 w-28 flex-none overflow-hidden rounded-lg bg-ink-800 ring-1 ring-black/10">
                    {preview && <img src={preview} alt="" className="h-full w-full object-cover" />}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                    <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files[0])} className={fileInput} />
                    <input value={urlValue} onChange={(e) => onUrl(e.target.value)} placeholder="…or paste an image URL" className={input} />
                </div>
            </div>
        </div>
    );
}

export default function Form({ slide }) {
    const editing = !!slide;

    const form = useForm({
        eyebrow: slide?.eyebrow || 'Featured Story',
        title: slide?.title || '',
        subtitle: slide?.subtitle || '',
        is_active: slide?.is_active ?? true,
        image: null,
        image_url: '',
        card_image: null,
        card_image_url: '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            form.transform((d) => ({ ...d, _method: 'put' }));
            form.post(route('admin.slides.update', slide.id), { forceFormData: true });
        } else {
            form.post(route('admin.slides.store'), { forceFormData: true });
        }
    };

    return (
        <AdminLayout title={editing ? 'Edit Slide' : 'New Slide'}>
            <Head title={editing ? 'Edit Slide' : 'New Slide'} />

            <form onSubmit={submit} className="max-w-3xl space-y-5">
                <div className="rounded-2xl border theme-border theme-card p-5 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1 block text-sm theme-text">Name</span>
                            <input
                                value={form.data.eyebrow}
                                onChange={(e) => form.setData('eyebrow', e.target.value)}
                                placeholder="Featured Story"
                                className={input}
                            />
                            {form.errors.eyebrow && <span className="mt-1 block text-xs text-rose-500">{form.errors.eyebrow}</span>}
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm theme-text">Title *</span>
                            <input
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                className={input}
                            />
                            {form.errors.title && <span className="mt-1 block text-xs text-rose-500">{form.errors.title}</span>}
                        </label>

                        <label className="block sm:col-span-2">
                            <span className="mb-1 block text-sm theme-text">Subtitle</span>
                            <input
                                value={form.data.subtitle}
                                onChange={(e) => form.setData('subtitle', e.target.value)}
                                className={input}
                            />
                        </label>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <ImageField
                            label="Background image"
                            hint="Full-width artwork behind the slide."
                            current={slide?.image}
                            fileValue={form.data.image}
                            urlValue={form.data.image_url}
                            onFile={(f) => form.setData('image', f)}
                            onUrl={(v) => form.setData('image_url', v)}
                        />
                        <ImageField
                            label="Card image"
                            hint="Small poster shown beside the slide."
                            current={slide?.card_image}
                            fileValue={form.data.card_image}
                            urlValue={form.data.card_image_url}
                            onFile={(f) => form.setData('card_image', f)}
                            onUrl={(v) => form.setData('card_image_url', v)}
                        />
                    </div>

                    <label className="mt-5 flex items-center gap-2 text-sm theme-text">
                        <input
                            type="checkbox"
                            checked={form.data.is_active}
                            onChange={(e) => form.setData('is_active', e.target.checked)}
                            className="rounded theme-border text-gold-500 focus:ring-gold-500"
                        />
                        Active (show on home)
                    </label>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        disabled={form.processing}
                        className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
                    >
                        {editing ? 'Save Slide' : 'Create Slide'}
                    </button>
                    <Link href={route('admin.slides.index')} className="text-sm theme-muted transition hover:text-gold-400">
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
