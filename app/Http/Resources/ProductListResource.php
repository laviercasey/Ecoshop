<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin Product */
class ProductListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'price' => (float) $this->price,
            'old_price' => $this->compare_price ? (float) $this->compare_price : null,
            'has_discount' => $this->hasDiscount(),
            'discount_percent' => $this->discountPercent(),
            'image_url' => $this->whenLoaded('images', fn () => $this->images->first()?->path
                ? Storage::url($this->images->first()->path)
                : null
            ),
            'category_names' => $this->whenLoaded('categories', fn () => $this->categories->pluck('name')->toArray()),
            'category_slugs' => $this->whenLoaded('categories', fn () => $this->categories->pluck('slug')->toArray()),
        ];
    }
}
