<?php

namespace App\Actions;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class UpdateOrderStatusAction
{
    public function execute(Order $order, OrderStatus $newStatus, ?string $trackingNumber, ?string $comment, ?string $authorName): Order
    {
        return DB::transaction(function () use ($order, $newStatus, $trackingNumber, $comment, $authorName) {
            $oldStatus = $order->status;

            if ($oldStatus === OrderStatus::Cancelled && $newStatus !== OrderStatus::Cancelled) {
                throw new \RuntimeException('Отменённый заказ нельзя вернуть в работу');
            }

            if ($newStatus === OrderStatus::Cancelled && $oldStatus !== OrderStatus::Cancelled) {
                $this->restoreStock($order);
            }

            $order->update([
                'status' => $newStatus,
                'tracking_number' => $trackingNumber ?? $order->tracking_number,
            ]);

            $order->statusHistory()->create([
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'comment' => $comment,
                'author_name' => $authorName,
            ]);

            return $order;
        });
    }

    private function restoreStock(Order $order): void
    {
        /** @var Collection<int, OrderItem> $items */
        $items = $order->items()->whereNotNull('product_id')->get();

        if ($items->isEmpty()) {
            return;
        }

        $products = Product::lockForUpdate()
            ->whereIn('id', $items->pluck('product_id'))
            ->get()
            ->keyBy('id');

        foreach ($items as $item) {
            $product = $products->get($item->product_id);

            if ($product && $product->stock !== null) {
                $product->increment('stock', $item->quantity);
            }
        }
    }
}
