<?php

namespace Database\Seeders;

use App\Models\AccessCode;
use App\Models\Book;
use App\Models\Chapter;
use App\Models\Genre;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StoryverseSeeder extends Seeder
{
    public function run(): void
    {
        $genres = [
            'Isekai' => '🌀', 'Fantasy' => '⚔️', 'Slice of Life' => '🍃',
            'Romance' => '❤️', 'Mystery' => '🔍', 'Supernatural' => '👻',
            'Sci-Fi' => '🚀', 'Action' => '💥', 'Adventure' => '🧭', 'Thriller' => '🕯️',
        ];

        $genreModels = [];
        foreach ($genres as $name => $icon) {
            $genreModels[$name] = Genre::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'icon' => $icon],
            );
        }

        $books = [
            [
                'title' => 'Blue Beast',
                'subtitle' => 'The Rebirth of Manav',
                'author' => 'Mori Zenro "Zen"',
                'tagline' => 'A journey of pain, power, and rebirth.',
                'description' => 'After losing everything, Manav awakens a power beyond imagination. Reborn in a world of magic and beasts, he vows to protect those he loves and become the strongest of all. This is not just his story — this is the legend of the Blue Beast.',
                'status' => 'ongoing',
                'rating' => 4.8,
                'views' => 120000,
                'is_featured' => true,
                'genres' => ['Action', 'Fantasy', 'Adventure', 'Isekai'],
            ],
            [
                'title' => 'An Alien in the Classroom',
                'subtitle' => 'Being human is harder than being an alien.',
                'author' => 'Mori Zenro',
                'tagline' => 'Being human is harder than being an alien.',
                'description' => 'A lonely alien enrolls in an ordinary school to study humans — only to discover that fitting in, making friends and understanding feelings is the hardest mission in the galaxy.',
                'status' => 'ongoing',
                'rating' => 4.6,
                'views' => 84000,
                'is_featured' => true,
                'genres' => ['Slice of Life', 'Sci-Fi', 'Adventure'],
            ],
            [
                'title' => "God's Thought",
                'subtitle' => 'Beyond belief. Beyond understanding.',
                'author' => 'Mori Zenro',
                'tagline' => 'A story of the seen and the unseen.',
                'description' => 'When an ordinary man begins to hear the thoughts of the divine, the line between faith and reality collapses. A story of the seen and the unseen, belief and doubt.',
                'status' => 'ongoing',
                'rating' => 4.7,
                'views' => 96000,
                'is_featured' => true,
                'genres' => ['Supernatural', 'Mystery', 'Fantasy'],
            ],
            [
                'title' => '7 Ke Baad (After 7)',
                'subtitle' => 'A dark mystery thriller',
                'author' => 'Mori Zenro',
                'tagline' => 'Some nights, the city comes alive. Some nights, it comes hungry.',
                'description' => 'Every night after 7, the city changes. Three children and a lone officer must survive the hours when the streets come alive — and hungry. A dark mystery thriller you cannot put down.',
                'status' => 'ongoing',
                'rating' => 4.9,
                'views' => 110000,
                'is_featured' => true,
                'genres' => ['Mystery', 'Thriller', 'Supernatural', 'Action'],
            ],
            [
                'title' => 'Pratima Online',
                'subtitle' => 'The girl who lived inside the game',
                'author' => 'Mori Zenro',
                'tagline' => 'Log in. Level up. Never log out.',
                'description' => 'When Pratima logs into a mysterious new VR world, she cannot log out. To return home she must clear a game that plays for keeps.',
                'status' => 'ongoing',
                'rating' => 4.5,
                'views' => 61000,
                'is_featured' => false,
                'genres' => ['Isekai', 'Sci-Fi', 'Action'],
            ],
            [
                'title' => 'Meta Beast',
                'subtitle' => 'Evolution has a new name',
                'author' => 'Mori Zenro',
                'tagline' => 'When the code becomes claw.',
                'description' => 'In a near future where minds upload to the Meta, one glitch gives rise to a beast that hunts across both worlds.',
                'status' => 'ongoing',
                'rating' => 4.4,
                'views' => 52000,
                'is_featured' => false,
                'genres' => ['Sci-Fi', 'Action', 'Supernatural'],
            ],
        ];

        foreach ($books as $data) {
            $genreNames = $data['genres'];
            unset($data['genres']);

            $book = Book::updateOrCreate(
                ['slug' => Str::slug($data['title'])],
                array_merge($data, ['is_published' => true, 'price' => 30, 'access_months' => 3]),
            );

            $book->genres()->sync(collect($genreNames)->map(fn ($n) => $genreModels[$n]->id)->all());

            $this->seedChapters($book);
            $this->seedCodes($book);
        }

        $this->seedSlides();
        $this->seedTestimonials();
    }

    protected function seedSlides(): void
    {
        $featured = Book::where('is_featured', true)->take(4)->get();
        foreach ($featured as $i => $book) {
            \App\Models\Slide::updateOrCreate(
                ['title' => $book->title, 'book_id' => $book->id],
                [
                    'eyebrow' => 'Featured Story',
                    'subtitle' => $book->subtitle,
                    'tagline' => $book->tagline,
                    'cta_label' => 'Start Reading',
                    'sort_order' => $i,
                    'is_active' => true,
                ],
            );
        }
    }

    protected function seedTestimonials(): void
    {
        $items = [
            ['name' => 'Aarav S.', 'role' => 'Reader · Delhi', 'body' => 'I scanned the code from the packet and started reading immediately. Blue Beast kept me awake all night. Best ₹30 spent.', 'stars' => 5],
            ['name' => 'Priya M.', 'role' => 'Reader · Mumbai', 'body' => 'The reader experience feels premium — text size, dark mode, and everything else are excellent. God’s Thought is beautifully written.', 'stars' => 5],
            ['name' => 'Rohan K.', 'role' => 'Reader · Pune', 'body' => 'The 7 Ke Baad thriller hooked me immediately. It works smoothly on my phone and I can read anytime.', 'stars' => 5],
            ['name' => 'Sneha T.', 'role' => 'Reader · Jaipur', 'body' => 'An Alien in the Classroom is such a lovely story! Instant access, no hassle at all.', 'stars' => 5],
        ];

        foreach ($items as $i => $t) {
            \App\Models\Testimonial::updateOrCreate(
                ['name' => $t['name']],
                array_merge($t, ['sort_order' => $i, 'is_active' => true]),
            );
        }
    }

    protected function seedChapters(Book $book): void
    {
        $titles = [
            'The Boy Who Died', 'Awakening', 'The Blue Flame',
            "Beast's Instinct", 'New Allies', 'The First Battle',
        ];

        foreach ($titles as $i => $title) {
            $number = $i + 1;
            Chapter::updateOrCreate(
                ['book_id' => $book->id, 'number' => $number],
                [
                    'title' => $title,
                    'is_free' => $number === 1,
                    'published_at' => now()->subDays((6 - $i) * 7),
                    'image' => null,
                    'content' => $this->sampleContent($book, $number, $title),
                ],
            );
        }
    }

    protected function sampleContent(Book $book, int $number, string $title): string
    {
        $paras = [
            "The first rain after his awakening was cold.",
            "He stood on the edge of the cliff, the drops hitting his face like tiny blades. His body ached, every muscle screaming in protest. But the pain was real — so was he.",
            "\"So this… is my second life?\" he murmured, looking at his hands. They were no longer weak. No longer trembling. A strange energy pulsed beneath his skin, like a beast waiting to be unleashed.",
            "A low growl echoed behind him. He turned. Out of the mist emerged a massive shape, its eyes glowing like twin moons. It didn't attack. It simply bowed its head… as if recognizing its master.",
            "From that day forward, their journey became one. But it had just begun. Stronger enemies. Darker secrets. Greater powers. And a destiny written in blood and fire.",
        ];

        $html = "<p>" . implode("</p>\n<p>", $paras) . "</p>";

        return "<h3>Chapter {$number}: {$title}</h3>\n{$html}\n<p><em>— {$book->title}</em></p>";
    }

    protected function seedCodes(Book $book): void
    {
        $prefix = Str::of($book->title)->explode(' ')->first();

        for ($i = 0; $i < 5; $i++) {
            AccessCode::create([
                'code' => AccessCode::generateCode($prefix),
                'book_id' => $book->id,
                'duration_months' => $book->access_months,
                'batch' => 'SEED-DEMO',
            ]);
        }
    }
}
