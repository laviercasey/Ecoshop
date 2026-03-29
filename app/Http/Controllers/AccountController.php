<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderListResource;
use App\Http\Resources\OrderResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
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
        /** @var User $user */
        $user = $request->user();
        $order = $user->orders()
            ->with(['items', 'statusHistory'])
            ->findOrFail($orderId);

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }
}
