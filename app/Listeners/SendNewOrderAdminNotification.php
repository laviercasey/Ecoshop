<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Mail\NewOrderAdminMail;
use App\Models\Setting;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendNewOrderAdminNotification implements ShouldQueue
{
    public int $tries = 3;

    public array $backoff = [10, 60, 300];

    public function handle(OrderCreated $event): void
    {
        $order = $event->order;
        $order->loadMissing('items');

        $adminEmail = Setting::get('general', 'email');
        if (! $adminEmail) {
            return;
        }

        Mail::to($adminEmail)->send(new NewOrderAdminMail($order));
    }

    public function failed(OrderCreated $event, \Throwable $e): void
    {
        Log::error('Failed to send admin order notification after all retries', [
            'order_id' => $event->order->id,
            'error' => $e->getMessage(),
        ]);
    }
}
