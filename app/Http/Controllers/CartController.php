<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CartController extends Controller
{
    public function index(): JsonResponse
    {
        $cart = session('cart', []);
        $items = [];
        $subtotal = 0;

        if (!empty($cart)) {
            $products = Product::whereIn('id', array_keys($cart))
                ->published()
                ->with(['images' => fn ($q) => $q->orderBy('sort_order')->limit(1), 'attributes'])
                ->get();

            foreach ($products as $product) {
                $quantity = $cart[$product->id] ?? 0;
                if ($quantity <= 0) continue;

                $specs = $product->attributes->take(3)->pluck('value')->join(' • ');
                $itemTotal = $product->price * $quantity;
                $subtotal += $itemTotal;

                $items[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'quantity' => $quantity,
                    'image' => $product->images->first()?->path
                        ? Storage::url($product->images->first()->path)
                        : null,
                    'specs' => $specs ?: null,
                    'unit' => $product->unit,
                ];
            }
        }

        return response()->json([
            'items' => $items,
            'subtotal' => $subtotal,
            'total' => $subtotal,
            'count' => collect($items)->sum('quantity'),
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'integer', Rule::exists('products', 'id')->where('is_published', true)->whereNull('deleted_at')],
            'quantity' => 'integer|min:1|max:9999',
        ]);

        $productId = $request->input('product_id');
        $quantity = $request->input('quantity', 1);
        $cart = session('cart', []);

        if (count($cart) >= 50 && !array_key_exists($productId, $cart)) {
            return response()->json(['message' => 'Корзина переполнена (максимум 50 позиций)'], 422);
        }

        $cart[$productId] = min(($cart[$productId] ?? 0) + $quantity, 9999);

        session(['cart' => $cart]);

        return response()->json([
            'message' => 'Товар добавлен в корзину',
            'cartItems' => $cart,
            'cartCount' => array_sum($cart),
        ]);
    }

    public function update(Request $request, int $product): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0', 'max:9999'],
        ]);
        $product = \App\Models\Product::published()->findOrFail($product);

        $cart = session('cart', []);

        if ($validated['quantity'] <= 0) {
            unset($cart[$product->id]);
        } else {
            $cart[$product->id] = $validated['quantity'];
        }

        session(['cart' => $cart]);

        return response()->json([
            'message' => 'Корзина обновлена',
            'cartItems' => $cart,
            'cartCount' => array_sum($cart),
        ]);
    }

    public function remove(int $product): JsonResponse
    {
        $model = Product::published()->findOrFail($product);

        $cart = session('cart', []);

        unset($cart[$model->id]);
        session(['cart' => $cart]);

        return response()->json([
            'message' => 'Товар удалён из корзины',
            'cartItems' => $cart,
            'cartCount' => array_sum($cart),
        ]);
    }
}
