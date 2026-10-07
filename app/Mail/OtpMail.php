<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public int $minutes = 10,
        public ?string $cardCode = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "{$this->code} is your StoryVerse code",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
            text: 'emails.otp-text',
        );
    }
}
