<?php

namespace App\Http\Resources;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin Product */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'description' => $this->description,
            'price' => (float) $this->price,
            'compare_price' => $this->compare_price ? (float) $this->compare_price : null,
            'stock' => $this->stock,
            'min_order_qty' => $this->min_order_qty,
            'unit' => $this->unit,
            'dimensions' => $this->dimensions,
            'weight' => $this->weight ? (float) $this->weight : null,
            'is_published' => $this->is_published,
            'has_discount' => $this->hasDiscount(),
            'discount_percent' => $this->discountPercent(),
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn (ProductImage $img) => [ // @phpstan-ignore return.type
                'id' => $img->id,
                'url' => Storage::url($img->path),
                'alt' => $img->alt,
                'sort_order' => $img->sort_order,
            ])),
            'attributes' => $this->whenLoaded('attributes', fn () => $this->attributes->map(fn (ProductAttribute $attr) => [
                'id' => $attr->id,
                'name' => $attr->name,
                'value' => $attr->value,
            ])),
            'categories' => $this->whenLoaded('categories', fn () => $this->categories->map(fn (Category $cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ])),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
