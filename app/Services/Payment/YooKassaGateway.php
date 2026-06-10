<?php

namespace App\Services\Payment;

use App\Enums\PaymentMethod;
use App\Models\Order;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class YooKassaGateway implements PaymentGateway
{
    private const API_URL = 'https://api.yookassa.ru/v3';

    public function isConfigured(): bool
    {
        return (bool) config('services.yookassa.shop_id')
            && (bool) config('services.yookassa.secret_key');
    }

    public function create(Order $order, string $returnUrl): PaymentDetails
    {
        $payload = [
            'amount' => [
                'value' => number_format((float) $order->total, 2, '.', ''),
                'currency' => 'RUB',
            ],
            'capture' => true,
            'confirmation' => [
                'type' => 'redirect',
                'return_url' => $returnUrl,
            ],
            'description' => "Заказ {$order->number}",
            'metadata' => ['order_id' => $order->id],
        ];

        if ($order->payment_method === PaymentMethod::Sbp) {
            $payload['payment_method_data'] = ['type' => 'sbp'];
        }

        $response = $this->request()
            ->withHeaders(['Idempotence-Key' => "order-{$order->number}"])
            ->post(self::API_URL.'/payments', $payload)
            ->throw()
            ->json();

        return new PaymentDetails($response['id'], $response['confirmation']['confirmation_url']);
    }

    public function status(string $paymentId): array
    {
        return $this->request()
            ->get(self::API_URL."/payments/{$paymentId}")
            ->throw()
            ->json();
    }

    private function request(): PendingRequest
    {
        return Http::withBasicAuth(
            (string) config('services.yookassa.shop_id'),
            (string) config('services.yookassa.secret_key'),
        )->acceptJson()->timeout(15);
    }
}
