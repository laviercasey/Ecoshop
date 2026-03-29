<?php

namespace App\Http\Resources;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Order */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_color' => $this->status->color(),
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'customer_phone' => $this->customer_phone,
            'customer_note' => $this->customer_note,
            'shipping_method' => $this->shipping_method->value,
            'shipping_method_label' => $this->shipping_method->label(),
            'payment_method' => $this->payment_method->value,
            'payment_method_label' => $this->payment_method->label(),
            'shipping_address' => $this->shipping_address,
            'subtotal' => (float) $this->subtotal,
            'shipping_cost' => (float) $this->shipping_cost,
            'total' => (float) $this->total,
            'tracking_number' => $this->tracking_number,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn (OrderItem $item) => [ // @phpstan-ignore return.type
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'product_sku' => $item->product_sku,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
                'subtotal' => $item->subtotal(),
            ])),
            'status_history' => $this->whenLoaded('statusHistory', fn () => $this->statusHistory->map(fn (OrderStatusHistory $h) => [ // @phpstan-ignore return.type
                'old_status' => $h->old_status?->value,
                'old_status_label' => $h->old_status?->label(),
                'new_status' => $h->new_status->value,
                'new_status_label' => $h->new_status->label(),
                'comment' => $h->comment,
                'created_at' => $h->created_at?->toISOString(),
            ])),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
