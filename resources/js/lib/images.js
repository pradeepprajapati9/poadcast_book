/**
 * Background image for cinematic sliders.
 * Priority: admin banner → cover → deterministic CDN placeholder (Picsum).
 * If the backend sets banner_image, that will be used.
 */
export function bgFor(book) {
    return (
        book?.banner_image ||
        book?.cover_image ||
        `https://picsum.photos/seed/sv-${book?.slug || 'story'}/1600/900`
    );
}
