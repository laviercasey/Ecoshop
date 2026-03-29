<?php

namespace App\Actions;

use App\Enums\OrderStatus;
use App\Enums\ShippingMethod;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class CreateOrderAction
{
    public function execute(array $checkoutData, array $cart, int $userId): array
    {
        $skippedItems = [];

        $order = DB::transaction(function () use ($checkoutData, $cart, $userId, &$skippedItems) {
            $subtotal = 0;
            $orderItems = [];
            $productIds = array_keys($cart);

            $products = Product::published()
                ->lockForUpdate()
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            foreach ($productIds as $productId) {
                $product = $products->get($productId);

                if (! $product) {
                    $skippedItems[] = ['id' => $productId, 'reason' => 'not_found'];

                    continue;
                }

                $quantity = $cart[$productId] ?? 0;

                if ($quantity <= 0) {
                    $skippedItems[] = ['id' => $productId, 'name' => $product->name, 'reason' => 'invalid_quantity'];

                    continue;
                }

                if ($product->stock !== null && $product->stock <= 0) {
                    $skippedItems[] = ['id' => $productId, 'name' => $product->name, 'reason' => 'out_of_stock'];

                    continue;
                }

                $quantity = min($quantity, $product->stock ?? $quantity);
                $product->decrement('stock', $quantity);

                $subtotal += $product->price * $quantity;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $quantity,
                    'price' => $product->price,
                ];
            }

            if (empty($orderItems)) {
                throw new \RuntimeException('Ни один из товаров в корзине недоступен для заказа');
            }

            $shippingAddress = ($checkoutData['shipping_method'] ?? '') !== ShippingMethod::Pickup->value
                ? [
                    'city' => $checkoutData['city'] ?? null,
                    'street' => $checkoutData['street'] ?? null,
                    'building' => $checkoutData['building'] ?? null,
                    'apartment' => $checkoutData['apartment'] ?? null,
                    'postal_code' => $checkoutData['postal_code'] ?? null,
                ]
                : null;

            $order = Order::create([
                'number' => Order::generateNumber(),
                'user_id' => $userId,
                'status' => OrderStatus::New,
                'subtotal' => $subtotal,
                'shipping_cost' => 0,
                'total' => $subtotal,
                'payment_method' => $checkoutData['payment_method'],
                'shipping_method' => $checkoutData['shipping_method'],
                'customer_name' => $checkoutData['customer_name'],
                'customer_email' => $checkoutData['customer_email'],
                'customer_phone' => $checkoutData['customer_phone'] ?? null,
                'customer_note' => $checkoutData['customer_note'] ?? null,
                'shipping_address' => $shippingAddress,
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            return $order;
        });

        return ['order' => $order, 'skippedItems' => $skippedItems];
    }
}
