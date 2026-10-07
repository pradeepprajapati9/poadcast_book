<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Genre;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * XML sitemap — every public URL, so search engines can find and index the
     * whole library. Generated live; with a large catalogue this can later be
     * cached, but it stays well within limits for a few thousand books.
     */
    public function index(): Response
    {
        $urls = [
            ['loc' => route('home'), 'priority' => '1.0', 'freq' => 'daily'],
            ['loc' => route('library'), 'priority' => '0.9', 'freq' => 'daily'],
        ];

        foreach (Genre::orderBy('name')->get() as $genre) {
            $urls[] = [
                'loc' => route('library', ['genre' => $genre->slug]),
                'priority' => '0.7',
                'freq' => 'weekly',
            ];
        }

        Book::where('is_published', true)
            ->latest('updated_at')
            ->get(['slug', 'updated_at'])
            ->each(function (Book $book) use (&$urls) {
                $urls[] = [
                    'loc' => route('books.show', $book->slug),
                    'lastmod' => $book->updated_at?->toAtomString(),
                    'priority' => '0.8',
                    'freq' => 'weekly',
                ];
            });

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
            . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($urls as $u) {
            $xml .= "  <url>\n    <loc>" . e($u['loc']) . "</loc>\n";
            if (! empty($u['lastmod'])) {
                $xml .= "    <lastmod>{$u['lastmod']}</lastmod>\n";
            }
            $xml .= "    <changefreq>{$u['freq']}</changefreq>\n"
                . "    <priority>{$u['priority']}</priority>\n  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}
