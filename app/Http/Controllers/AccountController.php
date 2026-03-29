<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderListResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = $user->orders()
            ->with('items')
            ->latest()
            ->paginate(10);

        return response()->json([
            'orders' => OrderListResource::collection($orders),
        ]);
    }

    public function showOrder(Request $request, int $orderId): JsonResponse
    {
        $order = $request->user()
            ->orders()
            ->with(['items', 'statusHistory'])
            ->findOrFail($orderId);

        return response()->json([
            'order' => new \App\Http\Resources\OrderResource($order),
        ]);
    }
}
