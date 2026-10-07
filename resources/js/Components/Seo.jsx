import { Head } from '@inertiajs/react';

/**
 * Per-page SEO tags.
 *
 * Overrides the server-rendered defaults in app.blade.php. Inertia's <Head>
 * de-dupes by name/property, so setting the same tag here replaces the default
 * rather than adding a second one.
 */
export default function Seo({ title, description, keywords, image, type = 'website', jsonLd }) {
    const fullTitle = title ? `${title} — StoryVerse` : 'StoryVerse — Read Original Novels & Stories Online';
    const url = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <Head>
            <title>{fullTitle}</title>

            {description && <meta name="description" content={description} head-key="description" />}
            {keywords && <meta name="keywords" content={keywords} head-key="keywords" />}

            <meta property="og:title" content={fullTitle} head-key="og:title" />
            <meta property="og:type" content={type} head-key="og:type" />
            {description && <meta property="og:description" content={description} head-key="og:description" />}
            {image && <meta property="og:image" content={image} head-key="og:image" />}
            {url && <meta property="og:url" content={url} head-key="og:url" />}

            <meta name="twitter:title" content={fullTitle} head-key="tw:title" />
            {description && <meta name="twitter:description" content={description} head-key="tw:description" />}
            {image && <meta name="twitter:image" content={image} head-key="tw:image" />}

            {jsonLd && (
                <script type="application/ld+json" head-key="jsonld">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Head>
    );
}
