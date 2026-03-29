<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $now = now();
        $cacheKey = 'dashboard.'.$now->format('Y-m');

        $payload = Cache::remember($cacheKey, 60, function () use ($now) {
            return $this->buildDashboard($now);
        });

        return response()->json($payload);
    }

    private function buildDashboard(Carbon $now): array
    {
        $currentMonth = Order::whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->whereNotIn('status', [OrderStatus::Cancelled->value])
            ->sum('total');

        $previousMonth = $now->copy()->subMonth();
        $previousMonthRevenue = Order::whereMonth('created_at', $previousMonth->month)
            ->whereYear('created_at', $previousMonth->year)
            ->whereNotIn('status', [OrderStatus::Cancelled->value])
            ->sum('total');

        $revenueChange = $previousMonthRevenue > 0
            ? round(($currentMonth - $previousMonthRevenue) / $previousMonthRevenue * 100, 1)
            : 0;

        $ordersThisMonth = Order::whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->count();

        $newOrders = Order::where('status', OrderStatus::New)->count();

        $customersThisMonth = User::role('customer')
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->count();

        $totalCustomers = User::role('customer')->count();

        $averageOrder = Order::whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->whereNotIn('status', [OrderStatus::Cancelled->value])
            ->avg('total') ?? 0;

        $recentOrders = Order::latest()
            ->take(10)
            ->get()
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'number' => $order->number,
                'customer_name' => $order->customer_name,
                'total' => (float) $order->total,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'status_color' => $order->status->color(),
                'created_at' => $order->created_at?->toISOString(),
            ]);

        $topProducts = Product::query()
            ->withCount(['orderItems as total_sold' => function ($query) {
                $query->whereHas('order', fn ($q) => $q->whereNull('deleted_at'));
            }])
            ->addSelect([
                'products.*',
                'total_revenue' => DB::table('order_items')
                    ->selectRaw('COALESCE(SUM(order_items.quantity * order_items.price), 0)')
                    ->whereColumn('order_items.product_id', 'products.id')
                    ->whereExists(function ($query) {
                        $query->select(DB::raw(1))
                            ->from('orders')
                            ->whereColumn('orders.id', 'order_items.order_id')
                            ->whereNull('orders.deleted_at');
                    }),
            ])
            ->orderByDesc('total_sold')
            ->take(10)
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'total_sold' => (int) $product->getAttribute('total_sold'),
                'total_revenue' => (float) $product->getAttribute('total_revenue'),
            ]);

        return [
            'stats' => [
                'revenue' => (float) $currentMonth,
                'revenue_change' => $revenueChange,
                'orders_this_month' => $ordersThisMonth,
                'new_orders' => $newOrders,
                'customers_this_month' => $customersThisMonth,
                'total_customers' => $totalCustomers,
                'average_order' => round((float) $averageOrder, 2),
            ],
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
        ];
    }
}
