<?php

namespace App\Services\Payment;

use App\Models\Order;

interface PaymentGateway
{
    public function isConfigured(): bool;

    public function create(Order $order, string $returnUrl): PaymentDetails;

    /**
     * @return array<string, mixed>
     */
    public function status(string $paymentId): array;
}
