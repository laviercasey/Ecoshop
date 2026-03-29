<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Mail\OrderConfirmationMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmation implements ShouldQueue
{
    public int $tries = 3;

    public array $backoff = [10, 60, 300];

    public function handle(OrderCreated $event): void
    {
        $order = $event->order;
        $order->loadMissing('items');

        Mail::to($order->customer_email)->send(new OrderConfirmationMail($order));
    }

    public function failed(OrderCreated $event, \Throwable $e): void
    {
        Log::error('Failed to send order confirmation email after all retries', [
            'order_id' => $event->order->id,
            'error' => $e->getMessage(),
        ]);
    }
}
