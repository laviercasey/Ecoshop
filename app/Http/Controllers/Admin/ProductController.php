<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with([
            'images' => fn ($q) => $q->orderBy('sort_order')->limit(1),
            'categories',
        ]);

        if ($search = $request->query('search')) {
            $search = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search);
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%"));
        }

        if ($request->has('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        $sort = $request->query('sort', 'latest');
        match ($sort) {
            'name' => $query->orderBy('name'),
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default => $query->latest(),
        };

        $perPage = min((int) $request->query('per_page', 15), 100);
        $products = $query->paginate($perPage);

        return response()->json([
            'products' => ProductResource::collection($products),
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();

        $product = Product::create(collect($data)->except(['categories', 'images'])->toArray());

        if (!empty($data['categories'])) {
            $product->categories()->sync($data['categories']);
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products');
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $path,
                    'sort_order' => $index,
                ]);
            }
        }

        $product->load(['images', 'categories', 'attributes']);

        return response()->json([
            'message' => 'Товар создан',
            'product' => new ProductResource($product),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with(['images', 'categories', 'attributes'])->findOrFail($id);

        return response()->json([
            'product' => new ProductResource($product),
        ]);
    }

    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $data = $request->validated();

        $product->update(collect($data)->except(['categories', 'images', 'existing_image_ids'])->toArray());

        if (array_key_exists('categories', $data)) {
            $product->categories()->sync($data['categories'] ?? []);
        }

        if (array_key_exists('existing_image_ids', $data)) {
            $keepIds = $data['existing_image_ids'] ?? [];
            $product->images()->whereNotIn('id', $keepIds)->each(function (ProductImage $image) {
                if ($image->path && preg_match('#^products/[^/]+$#', $image->path)) {
                    Storage::delete($image->path);
                }
                $image->delete();
            });
        }

        if ($request->hasFile('images')) {
            $keepCount = count($data['existing_image_ids'] ?? []);
            $newCount = count($request->file('images'));
            if ($keepCount + $newCount > 10) {
                return response()->json(['message' => 'Нельзя хранить более 10 изображений для одного товара.'], 422);
            }
            $maxSort = $product->images()->max('sort_order') ?? -1;
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products');
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $path,
                    'sort_order' => $maxSort + $index + 1,
                ]);
            }
        }

        $product->load(['images', 'categories', 'attributes']);

        return response()->json([
            'message' => 'Товар обновлён',
            'product' => new ProductResource($product),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(null, 204);
    }
}
