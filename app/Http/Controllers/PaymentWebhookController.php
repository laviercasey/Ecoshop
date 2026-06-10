<?php

namespace App\Http\Controllers;

use App\Actions\ConfirmOrderPaymentAction;
use App\Models\Order;
use App\Services\Payment\PaymentGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentWebhookController extends Controller
{
    public function __construct(
        private readonly PaymentGateway $gateway,
        private readonly ConfirmOrderPaymentAction $confirmOrderPayment,
    ) {}

    public function yookassa(Request $request): JsonResponse
    {
        $paymentId = $request->input('object.id');

        if (! is_string($paymentId) || $paymentId === '') {
            return response()->json(['message' => 'Некорректное уведомление'], 400);
        }

        $order = Order::where('payment_id', $paymentId)->first();

        if (! $order) {
            return response()->json([]);
        }

        $payment = $this->gateway->status($paymentId);

        $this->confirmOrderPayment->execute($order, (string) ($payment['status'] ?? ''));

        return response()->json([]);
    }
}
