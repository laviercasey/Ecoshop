<?php

namespace App\Http\Controllers;

use App\Http\Resources\BannerResource;
use App\Http\Resources\ProductListResource;
use App\Models\Banner;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $banners = Banner::active()->orderBy('position')->get();

        $featuredProducts = Product::published()
            ->with(['images' => fn ($q) => $q->orderBy('sort_order')->limit(1)])
            ->latest()
            ->take(8)
            ->get();

        $discountedProducts = Product::published()
            ->whereNotNull('compare_price')
            ->with(['images' => fn ($q) => $q->orderBy('sort_order')->limit(1)])
            ->latest()
            ->take(4)
            ->get();

        return response()->json([
            'banners' => BannerResource::collection($banners),
            'featuredProducts' => ProductListResource::collection($featuredProducts),
            'discountedProducts' => ProductListResource::collection($discountedProducts),
        ]);
    }
}
