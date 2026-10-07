<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- Set the theme class before first paint so there is no flash.
             Light is the default; only an explicit 'dark' choice is dark. --}}
        <script>
            (function () {
                try {
                    var t = localStorage.getItem('storyverse-theme') === 'dark' ? 'dark' : 'light';
                    localStorage.setItem('storyverse-theme', t);
                    document.documentElement.classList.add(t);
                } catch (e) {}
            })();
        </script>

        {{-- SEO defaults. Per-page <Head> tags (Inertia) override these. --}}
        @php
            $seoTitle = 'StoryVerse — Read Original Novels & Stories Online';
            $seoDesc = 'Read original serialized novels and stories online on StoryVerse. Fantasy, sci-fi, horror, thriller, romance and more — start free, unlock everything with one card.';
            $seoKeywords = 'read novels online, web novels, online stories, serialized fiction, read stories online free, fantasy novels, sci-fi stories, horror stories, thriller novels, romance stories, Hindi stories, digital library, StoryVerse';
            $seoImage = url('/icons/icon-512.png');
        @endphp

        <meta name="description" content="{{ $seoDesc }}">
        <meta name="keywords" content="{{ $seoKeywords }}">
        <meta name="author" content="StoryVerse">
        <meta name="robots" content="index, follow, max-image-preview:large">
        <link rel="canonical" href="{{ url()->current() }}">

        {{-- Open Graph — WhatsApp / Facebook share preview (big for India) --}}
        <meta property="og:site_name" content="StoryVerse">
        <meta property="og:type" content="website">
        <meta property="og:title" content="{{ $seoTitle }}">
        <meta property="og:description" content="{{ $seoDesc }}">
        <meta property="og:image" content="{{ $seoImage }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:locale" content="en_IN">

        {{-- Twitter / X card --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seoTitle }}">
        <meta name="twitter:description" content="{{ $seoDesc }}">
        <meta name="twitter:image" content="{{ $seoImage }}">

        {{-- Site-level structured data --}}
        <script type="application/ld+json">
        {!! json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => 'StoryVerse',
            'url' => url('/'),
            'description' => $seoDesc,
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => url('/library') . '?search={search_term_string}',
                'query-input' => 'required name=search_term_string',
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
        </script>

        <!-- PWA / app-like -->
        <link rel="manifest" href="/manifest.webmanifest">
        <meta name="theme-color" content="#ffffff">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="StoryVerse">
        <link rel="apple-touch-icon" href="/icons/icon-192.png">
        <link rel="icon" type="image/png" href="/icons/icon-192.png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700|sora:500,600,700,800&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
            }
        </script>
    </body>
</html>
