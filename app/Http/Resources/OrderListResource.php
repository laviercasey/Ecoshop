<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Order */
class OrderListResource extends JsonResource
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
            'total' => (float) $this->total,
            'items_count' => $this->whenLoaded('items', fn () => $this->items->count()),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
