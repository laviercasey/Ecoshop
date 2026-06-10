<?php

namespace App\Http\Controllers\Admin;

use App\Actions\UpdateOrderStatusAction;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\OrderListResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly UpdateOrderStatusAction $updateOrderStatusAction,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Order::with('items')->latest();

        $status = $request->query('status');
        if (is_string($status) && $status !== '') {
            $orderStatus = OrderStatus::tryFrom($status);
            if ($orderStatus) {
                $query->byStatus($orderStatus);
            }
        }

        $search = $request->query('search');
        if (is_string($search) && $search !== '') {
            $search = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search);
            $query->where(fn ($q) => $q->where('number', 'like', "%{$search}%")
                ->orWhere('customer_name', 'like', "%{$search}%")
                ->orWhere('customer_email', 'like', "%{$search}%"));
        }

        $perPage = min((int) $request->query('per_page', '15'), 100);
        $orders = $query->paginate($perPage);

        return response()->json([
            'orders' => OrderListResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::with(['items', 'statusHistory', 'user'])->findOrFail($id);

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $data = $request->validated();

        try {
            $this->updateOrderStatusAction->execute(
                order: $order,
                newStatus: OrderStatus::from($data['status']),
                trackingNumber: $data['tracking_number'] ?? null,
                comment: $data['comment'] ?? null,
                authorName: $request->user()?->name,
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $order->load(['items', 'statusHistory']);

        return response()->json([
            'message' => 'Статус заказа обновлён',
            'order' => new OrderResource($order),
        ]);
    }
}
