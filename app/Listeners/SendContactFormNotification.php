<?php

namespace App\Listeners;

use App\Events\ContactFormSubmitted;
use App\Mail\ContactFormMail;
use App\Models\Setting;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendContactFormNotification implements ShouldQueue
{
    public int $tries = 3;

    public array $backoff = [10, 60, 300];

    public function handle(ContactFormSubmitted $event): void
    {
        $adminEmail = Setting::get('general', 'email');
        if (! $adminEmail) {
            return;
        }

        Mail::to($adminEmail)->send(new ContactFormMail(
            senderName: $event->senderName,
            senderEmail: $event->senderEmail,
            senderPhone: $event->senderPhone,
            messageText: $event->messageText,
        ));
    }

    public function failed(ContactFormSubmitted $event, \Throwable $e): void
    {
        Log::error('Failed to send contact form email after all retries', [
            'sender_email' => $event->senderEmail,
            'sender_name' => $event->senderName,
            'error' => $e->getMessage(),
        ]);
    }
}
