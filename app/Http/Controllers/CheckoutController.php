<?php

namespace App\Http\Controllers;

use App\Actions\CreateOrderAction;
use App\Events\OrderCreated;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Enums\ShippingMethod;
use App\Enums\PaymentMethod;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CreateOrderAction $createOrderAction,
    ) {}

    public function options(Request $request): JsonResponse
    {
        $cart = session('cart', []);
        $items = [];
        $subtotal = 0;

        if (!empty($cart)) {
            $products = Product::published()
                ->whereIn('id', array_keys($cart))
                ->with(['images' => fn ($q) => $q->orderBy('sort_order')->limit(1)])
                ->get();

            foreach ($products as $product) {
                $quantity = $cart[$product->id] ?? 0;
                if ($quantity <= 0) continue;

                $subtotal += $product->price * $quantity;
                $firstImage = $product->images->first();

                $items[] = [
                    'product_id' => $product->id,
                    'name'       => $product->name,
                    'price'      => (float) $product->price,
                    'quantity'   => $quantity,
                    'image'      => $firstImage ? Storage::url($firstImage->path) : null,
                ];
            }
        }

        $shippingMethods = array_map(
            fn (ShippingMethod $m) => ['value' => $m->value, 'label' => $m->label()],
            ShippingMethod::cases()
        );

        $paymentMethods = array_map(
            fn (PaymentMethod $m) => ['value' => $m->value, 'label' => $m->label()],
            PaymentMethod::cases()
        );

        return response()->json([
            'items'          => $items,
            'subtotal'       => $subtotal,
            'total'          => $subtotal,
            'shippingMethods' => $shippingMethods,
            'paymentMethods'  => $paymentMethods,
        ]);
    }

    public function store(CheckoutRequest $request): JsonResponse
    {
        $cart = session('cart', []);

        if (empty($cart)) {
            return response()->json(['message' => 'Корзина пуста'], 422);
        }

        try {
            $result = $this->createOrderAction->execute(
                checkoutData: $request->validated(),
                cart: $cart,
                userId: $request->user()->id,
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Illuminate\Database\UniqueConstraintViolationException) {
            return response()->json(['message' => 'Попробуйте оформить заказ ещё раз'], 503);
        }

        session()->forget('cart');

        OrderCreated::dispatch($result['order']);

        return response()->json([
            'message' => 'Заказ оформлен',
            'order' => new OrderResource($result['order']),
            'skipped_items' => $result['skippedItems'],
        ], 201);
    }

    public function success(Request $request, int $order): JsonResponse
    {
        $order = $request->user()->orders()->findOrFail($order);

        return response()->json([
            'order' => [
                'number' => $order->number,
                'total' => (float) $order->total,
                'customer_email' => $order->customer_email,
            ],
        ]);
    }
}
