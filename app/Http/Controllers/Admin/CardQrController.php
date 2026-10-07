<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterCard;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Response;

class CardQrController extends Controller
{
    /**
     * The QR printed on a physical card.
     *
     * Encodes the public activation URL (/card/{code}) — scanning it lands the
     * buyer on the activation screen. SVG so it prints crisp at any size and
     * needs no image extension on the server.
     */
    public function show(MasterCard $card): Response
    {
        $url = route('card.qr', $card->code);

        $renderer = new ImageRenderer(
            new RendererStyle(300, 1),
            new SvgImageBackEnd(),
        );

        $svg = (new Writer($renderer))->writeString($url);

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Content-Disposition' => 'inline; filename="' . $card->code . '.svg"',
        ]);
    }
}
