<?php

namespace App\Services\Payment;

class PaymentDetails
{
    public function __construct(
        public readonly string $id,
        public readonly string $confirmationUrl,
    ) {}
}
