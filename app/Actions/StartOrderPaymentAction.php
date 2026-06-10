<?php

namespace App\Actions;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Services\Payment\PaymentGateway;

class StartOrderPaymentAction
{
    public function __construct(
        private readonly PaymentGateway $gateway,
    ) {}

    public function execute(Order $order, string $returnUrl): ?string
    {
        if (! $this->gateway->isConfigured()) {
            return null;
        }

        if (! in_array($order->payment_method, [PaymentMethod::Card, PaymentMethod::Sbp], true)) {
            return null;
        }

        $details = $this->gateway->create($order, $returnUrl);

        $order->update([
            'payment_id' => $details->id,
            'status' => OrderStatus::PendingPayment,
        ]);

        $order->statusHistory()->create([
            'old_status' => OrderStatus::New,
            'new_status' => OrderStatus::PendingPayment,
            'comment' => null,
            'author_name' => 'ЮKassa',
        ]);

        return $details->confirmationUrl;
    }
}
