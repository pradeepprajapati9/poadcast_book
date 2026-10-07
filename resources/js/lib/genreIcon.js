import {
    BookOpen,
    Castle,
    Compass,
    Ghost,
    Globe,
    Heart,
    Rocket,
    Search,
    Skull,
    Sparkles,
    Swords,
    VenetianMask,
} from 'lucide-react';

/**
 * Genre slug -> icon. One place so the home page, library and nav all agree.
 * Unknown genres fall back to a book, so adding a genre never breaks the UI.
 */
const BY_SLUG = {
    action: Swords,
    adventure: Compass,
    fantasy: Sparkles,
    isekai: Globe,
    mystery: Search,
    romance: Heart,
    'sci-fi': Rocket,
    scifi: Rocket,
    'slice-of-life': Castle,
    supernatural: Ghost,
    thriller: Skull,
    horror: Skull,
    drama: VenetianMask,
};

export function genreIcon(genre) {
    if (!genre) return BookOpen;
    const key = (genre.slug || genre.name || '').toLowerCase().replace(/\s+/g, '-');
    return BY_SLUG[key] || BookOpen;
}
