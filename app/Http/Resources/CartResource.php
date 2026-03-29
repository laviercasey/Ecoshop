<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'items' => $this->resource['items'] ?? [],
            'subtotal' => (float) ($this->resource['subtotal'] ?? 0),
            'total' => (float) ($this->resource['total'] ?? 0),
            'count' => (int) ($this->resource['count'] ?? 0),
        ];
    }
}
