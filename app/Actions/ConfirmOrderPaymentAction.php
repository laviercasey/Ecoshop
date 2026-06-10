<?php

namespace App\Actions;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class ConfirmOrderPaymentAction
{
    public function execute(Order $order, string $paymentStatus): void
    {
        if ($paymentStatus === 'succeeded') {
            if ($order->paid_at !== null) {
                return;
            }

            DB::transaction(function () use ($order) {
                $oldStatus = $order->status;

                $order->update([
                    'status' => OrderStatus::Paid,
                    'paid_at' => now(),
                ]);

                $order->statusHistory()->create([
                    'old_status' => $oldStatus,
                    'new_status' => OrderStatus::Paid,
                    'comment' => 'Оплата подтверждена',
                    'author_name' => 'ЮKassa',
                ]);
            });

            return;
        }

        if ($paymentStatus === 'canceled' && $order->status === OrderStatus::PendingPayment) {
            DB::transaction(function () use ($order) {
                $order->update(['status' => OrderStatus::New]);

                $order->statusHistory()->create([
                    'old_status' => OrderStatus::PendingPayment,
                    'new_status' => OrderStatus::New,
                    'comment' => 'Оплата не прошла',
                    'author_name' => 'ЮKassa',
                ]);
            });
        }
    }
}
