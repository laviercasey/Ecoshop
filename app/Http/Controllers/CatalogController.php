<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductListResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CatalogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categorySlug = $request->query('category');
        $search       = $request->query('search');
        $sort         = $request->query('sort', 'popular');
        $page         = (int) $request->query('page', 1);

        $categories = Cache::remember('catalog:categories', now()->addHour(), function () {
            return Category::active()->roots()->orderBy('sort_order')
                ->with(['children' => fn ($q) => $q->active()->orderBy('sort_order')])
                ->get(['id', 'name', 'slug', 'sort_order', 'is_active']);
        });

        $categoryCounts = Cache::remember('catalog:category_counts', now()->addMinutes(5), function () {
            return DB::table('category_product')
                ->join('products', 'products.id', '=', 'category_product.product_id')
                ->join('categories', 'categories.id', '=', 'category_product.category_id')
                ->where('products.is_published', true)
                ->whereNull('products.deleted_at')
                ->select('categories.slug', DB::raw('count(*) as count'))
                ->groupBy('categories.slug')
                ->pluck('count', 'slug');
        });

        $allProductsCount = Cache::remember('catalog:total_count', now()->addMinutes(5), function () {
            return Product::published()->count();
        });

        $categoryName = null;
        $categoryId   = null;

        if ($categorySlug) {
            $category     = Category::where('slug', $categorySlug)->firstOrFail();
            $categoryName = $category->name;
            $categoryId   = $category->id;
        }

        $cacheKey = 'catalog:page:' . md5("{$categorySlug}:{$sort}:{$page}");
        $ttl      = now()->addMinutes(3);

        if ($search) {
            $paginator = $this->buildQuery($categoryId, $search, $sort)->paginate(12)->withQueryString();
            $paginator->withPath('/catalog');
            $paginatorArray = $paginator->toArray();
            $items          = ProductListResource::collection($paginator->items())->resolve();
        } else {
            $cached = Cache::remember($cacheKey, $ttl, function () use ($categoryId, $sort) {
                $paginator = $this->buildQuery($categoryId, null, $sort)->paginate(12)->withQueryString();
                $paginator->withPath('/catalog');
                $arr = $paginator->toArray();

                return [
                    'links'        => $arr['links'],
                    'current_page' => $paginator->currentPage(),
                    'last_page'    => $paginator->lastPage(),
                    'per_page'     => $paginator->perPage(),
                    'total'        => $paginator->total(),
                    'items'        => ProductListResource::collection($paginator->items())->resolve(),
                ];
            });

            $items = $cached['items'];
            $paginatorArray = $cached;
        }

        return response()->json([
            'products' => [
                'data'         => $items,
                'links'        => $paginatorArray['links'],
                'current_page' => $paginatorArray['current_page'],
                'last_page'    => $paginatorArray['last_page'],
                'per_page'     => $paginatorArray['per_page'],
                'total'        => $paginatorArray['total'],
            ],
            'categories'      => $categories,
            'currentCategory' => $categorySlug,
            'categoryName'    => $categoryName,
            'currentSort'     => $sort,
            'currentSearch'   => $search ?? '',
            'categoryCounts'  => $categoryCounts,
            'totalCount'      => $allProductsCount,
        ]);
    }

    public function all(): JsonResponse
    {
        $data = Cache::remember('catalog:all', now()->addMinutes(10), function () {
            $products = Product::published()
                ->with([
                    'images'     => fn ($q) => $q->orderBy('sort_order')->limit(1),
                    'categories',
                    'attributes' => fn ($q) => $q->orderBy('sort_order'),
                ])
                ->latest()
                ->get();

            $categories = Category::active()->roots()->orderBy('sort_order')
                ->with(['children' => fn ($q) => $q->active()->orderBy('sort_order')])
                ->get(['id', 'name', 'slug', 'sort_order', 'is_active']);

            return [
                'products'   => ProductListResource::collection($products)->resolve(),
                'categories' => $categories,
                'totalCount' => $products->count(),
            ];
        });

        return response()->json($data);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::published()
            ->where('slug', $slug)
            ->with([
                'images'     => fn ($q) => $q->orderBy('sort_order'),
                'categories',
                'attributes' => fn ($q) => $q->orderBy('sort_order'),
            ])
            ->firstOrFail();

        $relatedPool = Cache::remember(
            "related_pool_{$product->id}",
            now()->addHour(),
            fn () => Product::published()
                ->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $product->categories->pluck('id')))
                ->where('id', '!=', $product->id)
                ->with(['images' => fn ($q) => $q->orderBy('sort_order')->limit(1)])
                ->take(20)
                ->get()
        );

        $relatedProducts = $relatedPool->shuffle()->take(4);

        return response()->json([
            'product'         => new ProductResource($product),
            'relatedProducts' => ProductListResource::collection($relatedProducts),
        ]);
    }

    private function buildQuery(?int $categoryId, ?string $search, string $sort)
    {
        if ($search) {
            $query = Product::search($search)
                ->where('is_published', true)
                ->query(fn ($q) => $q->with([
                    'images'     => fn ($q) => $q->orderBy('sort_order')->limit(1),
                    'categories',
                    'attributes' => fn ($q) => $q->orderBy('sort_order'),
                ]));

            if ($categoryId) {
                $query->query(fn ($q) => $q->whereHas('categories', fn ($c) => $c->where('categories.id', $categoryId)));
            }

            return $query;
        }

        $query = Product::published()
            ->with([
                'images'     => fn ($q) => $q->orderBy('sort_order')->limit(1),
                'categories',
                'attributes' => fn ($q) => $q->orderBy('sort_order'),
            ]);

        if ($categoryId) {
            $query->whereHas('categories', fn ($q) => $q->where('categories.id', $categoryId));
        }

        match ($sort) {
            'price_asc'  => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'name'       => $query->orderBy('name'),
            default      => $query->latest(),
        };

        return $query;
    }
}
